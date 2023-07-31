const transactionModel = require("../models/transaction");

const addIncome = (req, res) => {
  const { title, amount, type, category, date, comment } = req.body;
  if (!title || !amount || !type || !category || !date) {
    return res.status(400).json({ message: "All fields are required!" });
  } else if (amount <= 0 || isNaN(amount)) {
    return res.status(400).json({ message: "Not a valid amount!" });
  } else {
    const income = transactionModel({
      title,
      amount,
      type,
      category,
      date: new Date(date).toLocaleDateString(),
      comment,
    });
    res.send(income);
  }
};

const addExpense = (req, res) => {
  const { title, amount, type, category, date, comment } = req.body;
  const expense = transactionModel({
    title,
    amount,
    type,
    category,
    date: new Date(date).toLocaleDateString(),
    comment,
  });
  res.send(expense);
};

const addDebt = (req, res) => {};

module.exports = {
  addIncome,
  addExpense,
  addDebt,
};
