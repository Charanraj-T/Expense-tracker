const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user");
const transactionRoutes = require("./routes/transactions");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", userRoutes);
app.use("/transactions", transactionRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;