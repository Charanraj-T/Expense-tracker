const express = require("express");
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactions");
const router = express.Router();

router.get("/", getTransactions);
router.post("/", addTransaction);
router.patch("/:id",updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
