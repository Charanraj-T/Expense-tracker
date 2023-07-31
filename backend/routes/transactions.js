const express = require("express");
const {
  addIncome,
  addExpense,
  addDebt,
} = require("../controllers/transactions");
const router = express.Router();

router.post("/income", addIncome);

router.post("/expense", addExpense);

router.post("/debt", addDebt);

module.exports = router;
