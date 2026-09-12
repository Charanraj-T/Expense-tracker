const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user");
const transactionRoutes = require("./routes/transactions");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", userRoutes);
app.use("/transactions", transactionRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;