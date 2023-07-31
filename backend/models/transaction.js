const mongoose = require("mongoose");

const transactionModel = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxLength: 30 },
    amount: { type: Number, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    category: { type: String, trim: true, maxLength: 30 },
    comment: { type: String, trim: true, maxLength: 100 },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionModel);
