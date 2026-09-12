const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const { HttpError } = require("../utils/httpError");

const VALID_TYPES = ["income", "expense", "investment"];

const parseTransactionInput = (body) => {
  const { amount, type, category, date, note } = body || {};

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new HttpError(400, "Amount must be a positive number!");
  }

  if (!VALID_TYPES.includes(type)) {
    throw new HttpError(400, "Type must be one of: income, expense, investment");
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
    category: category.trim().toLowerCase(),
    date: parsedDate,
    note: note ? String(note).trim() : undefined,
  };
};

const buildFilter = ({ userId, type, month }) => {
  const filter = { userId: new mongoose.Types.ObjectId(userId) };

  if (type) {
    if (!VALID_TYPES.includes(type)) {
      throw new HttpError(400, "Type must be one of: income, expense, investment");
    }
    filter.type = type;
  }

  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new HttpError(400, "Month must be in YYYY-MM format");
    }
    const [year, monthIndex] = month.split("-").map(Number);
    filter.date = {
      $gte: new Date(Date.UTC(year, monthIndex - 1, 1)),
      $lt: new Date(Date.UTC(year, monthIndex, 1)),
    };
  }

  return filter;
};

const addTransaction = async (req, res) => {
  const input = parseTransactionInput(req.body);

  const transaction = await Transaction.create({
    ...input,
    userId: req.user.userId,
  });

  res.status(201).json({ message: "Transaction added successfully!", transaction });
};

const getTransactions = async (req, res) => {
  const filter = buildFilter({
    userId: req.user.userId,
    type: req.query.type,
    month: req.query.month,
  });

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1 })
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

const getTransactionSummary = async (req, res) => {
  const filter = buildFilter({
    userId: req.user.userId,
    type: req.query.type,
    month: req.query.month,
  });

  const [result] = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
        expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
        investment: { $sum: { $cond: [{ $eq: ["$type", "investment"] }, "$amount", 0] } },
      },
    },
  ]);

  const summary = {
    income: result?.income || 0,
    expense: result?.expense || 0,
    investment: result?.investment || 0,
  };
  summary.balance = summary.income - summary.expense - summary.investment;

  res.status(200).json(summary);
};

const updateTransaction = async (req, res) => {
  const input = parseTransactionInput(req.body);

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    input,
    { new: true, runValidators: true }
  );

  if (!transaction) {
    throw new HttpError(404, "Transaction not found");
  }

  res.status(200).json({ message: "Transaction updated successfully!", transaction });
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

module.exports = {
  addTransaction,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
};