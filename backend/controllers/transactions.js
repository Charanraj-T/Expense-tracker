const transaction = require("../models/transaction");

const addTransaction = async (req, res) => {
  const { title, amount, type, category, date, comment } = req.body;
  try {
    if (!title || !amount || !type || !category || !date) {
      return res.status(400).json({ message: "All fields are required!" });
    } else if (amount <= 0 || isNaN(amount)) {
      return res.status(400).json({ message: "Not a valid amount!" });
    } else {
      const newTransaction = transaction({
        title,
        amount,
        type,
        category,
        date: new Date(date).toLocaleDateString(),
        comment,
      });
      await newTransaction.save();
      res.status(201).json({ message: "Transaction added successfully!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await transaction.find().sort({ date: 1 });
    res.status(200).json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTransaction = async (req, res) => {
  const { title, amount, type, category, date, comment } = req.body;
  const { id } = req.params;
  try {
    if (!title || !amount || !type || !category || !date) {
      return res.status(400).json({ message: "All fields are required!" });
    } else if (amount <= 0 || isNaN(amount)) {
      return res.status(400).json({ message: "Not a valid amount!" });
    } else {
      const newTransaction = {
        title: title,
        amount: amount,
        type: type,
        category: category,
        date: new Date(date).toLocaleDateString(),
        comment: comment,
      };
      const updatedTransaction = await transaction.findByIdAndUpdate(
        id,
        newTransaction,
        { new: true }
      );
      if (updatedTransaction) {
        res.status(200).json({ message: "Transaction updated successfully!" });
      } else {
        res.status(200).json({ message: "Transaction not updated!" });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  await transaction
    .findByIdAndDelete(id)
    .then((trans) =>
      res.status(200).json({ message: "Transaction deleted successfully" })
    )
    .catch((err) => res.status(500).json({ error: err.message }));
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
