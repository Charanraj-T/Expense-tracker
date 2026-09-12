const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than 0"] },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense", "investment"],
    },
    category: { type: String, required: true, trim: true, maxLength: 30 },
    date: { type: Date, required: true },
    note: { type: String, trim: true, maxLength: 100 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);