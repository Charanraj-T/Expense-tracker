const express = require("express");
const {
  addTransaction,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCsv,
} = require("../controllers/transactions");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);

router.get("/summary", getTransactionSummary);
router.get("/export/csv", exportTransactionsCsv);
router.get("/", getTransactions);
router.post("/", addTransaction);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;