const express = require("express");
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactions");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.get("/", verifyToken, getTransactions);
router.post("/", verifyToken, addTransaction);
router.patch("/:id", verifyToken, updateTransaction);
router.delete("/:id", verifyToken, deleteTransaction);

module.exports = router;
