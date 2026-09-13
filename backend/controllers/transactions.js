const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const { HttpError } = require("../utils/httpError");

const VALID_TYPES = ["income", "expense", "investment"];

const escapeCsv = (value) => {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const parseTransactionInput = (body) => {
  const { amount, type, title, category, date, note } = body || {};

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new HttpError(400, "Amount must be a positive number!");
  }

  if (!VALID_TYPES.includes(type)) {
    throw new HttpError(
      400,
      "Type must be one of: income, expense, investment",
    );
  }

  const parsedTitle = title ? String(title).trim() : "";
  if (!parsedTitle) {
    throw new HttpError(400, "Title is required!");
  }
  if (parsedTitle.length > 60) {
    throw new HttpError(400, "Title must be at most 60 characters!");
  }

  if (!category || !category.trim()) {
    throw new HttpError(400, "Category is required!");
  }

  const parsedDate = new Date(date);
  if (!date || isNaN(parsedDate.getTime())) {
    throw new HttpError(400, "A valid date is required!");
  }

  return {
    amount: parsedAmount,
    type,
    title: parsedTitle,
    category: category.trim().toLowerCase(),
    date: parsedDate,
    note: note ? String(note).trim() : undefined,
  };
};

const buildFilter = ({ userId, type, category, month, startDate, endDate, search }) => {
  const filter = { userId: new mongoose.Types.ObjectId(userId) };

  if (type) {
    if (!VALID_TYPES.includes(type)) {
      throw new HttpError(
        400,
        "Type must be one of: income, expense, investment",
      );
    }
    filter.type = type;
  }

  if (category) {
    filter.category = String(category).trim().toLowerCase();
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        throw new HttpError(400, "startDate must be in YYYY-MM-DD format");
      }
      const [sYear, sMonth, sDay] = startDate.split("-").map(Number);
      filter.date.$gte = new Date(
        Date.UTC(sYear, sMonth - 1, sDay, 0, 0, 0, 0),
      );
    }
    if (endDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        throw new HttpError(400, "endDate must be in YYYY-MM-DD format");
      }
      const [eYear, eMonth, eDay] = endDate.split("-").map(Number);
      filter.date.$lte = new Date(
        Date.UTC(eYear, eMonth - 1, eDay, 23, 59, 59, 999),
      );
    }
  } else if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new HttpError(400, "Month must be in YYYY-MM format");
    }
    const [year, monthIndex] = month.split("-").map(Number);
    if (monthIndex < 1 || monthIndex > 12) {
      throw new HttpError(400, "Month must be a valid month (01-12)");
    }
    filter.date = {
      $gte: new Date(Date.UTC(year, monthIndex - 1, 1)),
      $lt: new Date(Date.UTC(year, monthIndex, 1)),
    };
  }

  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { title: { $regex: s, $options: "i" } },
      { category: { $regex: s, $options: "i" } },
      { note: { $regex: s, $options: "i" } },
    ];
  }

  return filter;
};

const addTransaction = async (req, res) => {
  const input = parseTransactionInput(req.body);

  const transaction = await Transaction.create({
    ...input,
    userId: req.user.userId,
  });

  res
    .status(201)
    .json({ message: "Transaction added successfully!", transaction });
};

const getTransactions = async (req, res) => {
  const filter = buildFilter({
    userId: req.user.userId,
    type: req.query.type,
    category: req.query.category,
    month: req.query.month,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    search: req.query.search,
  });

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 1000);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.status(200).json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

const getTodayTransactions = async (req, res) => {
  const targetDate = req.query.clientDate || req.query.startDate;
  let sYear, sMonth, sDay;
  if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    [sYear, sMonth, sDay] = targetDate.split("-").map(Number);
  } else {
    const now = new Date();
    sYear = now.getUTCFullYear();
    sMonth = now.getUTCMonth() + 1;
    sDay = now.getUTCDate();
  }

  const filter = {
    userId: new mongoose.Types.ObjectId(req.user.userId),
    date: {
      $gte: new Date(Date.UTC(sYear, sMonth - 1, sDay, 0, 0, 0, 0)),
      $lte: new Date(Date.UTC(sYear, sMonth - 1, sDay, 23, 59, 59, 999)),
    },
  };

  const transactions = await Transaction.find(filter).sort({
    date: -1,
    createdAt: -1,
  });

  res.status(200).json({
    transactions,
    total: transactions.length,
  });
};

const getTransactionSummary = async (req, res) => {
  const filter = buildFilter({
    userId: req.user.userId,
    type: req.query.type,
    category: req.query.category,
    month: req.query.month,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  });

  const [result] = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
        investment: {
          $sum: { $cond: [{ $eq: ["$type", "investment"] }, "$amount", 0] },
        },
      },
    },
  ]);

  let daysInPeriod = 30;
  if (req.query.startDate && req.query.endDate) {
    const [sYear, sMonth, sDay] = req.query.startDate.split("-").map(Number);
    const [eYear, eMonth, eDay] = req.query.endDate.split("-").map(Number);
    const startMs = Date.UTC(sYear, sMonth - 1, sDay);
    const endMs = Date.UTC(eYear, eMonth - 1, eDay);
    daysInPeriod = Math.max(1, Math.round((endMs - startMs) / 86400000) + 1);
  }

  const expenseTotal = result?.expense || 0;
  const dailyAverage =
    expenseTotal > 0
      ? Math.round((expenseTotal / daysInPeriod) * 100) / 100
      : 0;

  const summary = {
    income: result?.income || 0,
    expense: expenseTotal,
    investment: result?.investment || 0,
    dailyAverage,
    daysInPeriod,
  };

  res.status(200).json(summary);
};

const updateTransaction = async (req, res) => {
  const input = parseTransactionInput(req.body);

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    input,
    { returnDocument: "after", runValidators: true },
  );

  if (!transaction) {
    throw new HttpError(404, "Transaction not found");
  }

  res
    .status(200)
    .json({ message: "Transaction updated successfully!", transaction });
};

const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!transaction) {
    throw new HttpError(404, "Transaction not found");
  }

  res.status(200).json({ message: "Transaction deleted successfully" });
};

const exportTransactionsCsv = async (req, res) => {
  const filter = buildFilter({
    userId: req.user.userId,
    type: req.query.type,
    month: req.query.month,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    search: req.query.search,
  });

  const transactions = await Transaction.find(filter).sort({
    date: -1,
    createdAt: -1,
  });

  const headers = ["Date", "Type", "Title", "Category", "Amount", "Note"];
  const lines = transactions.map((t) =>
    [
      t.date ? t.date.toISOString().slice(0, 10) : "",
      t.type,
      escapeCsv(t.title),
      escapeCsv(t.category),
      t.amount,
      escapeCsv(t.note),
    ].join(","),
  );

  const csv = [headers.join(","), ...lines].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"');
  res.send(csv);
};

module.exports = {
  addTransaction,
  getTransactions,
  getTodayTransactions,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCsv,
};
