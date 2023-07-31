const express = require("express");
const cors = require("cors");
const db = require("./db/db");
const transactionRoutes = require("./routes/transactions");
require("dotenv").config();
const app = express();

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//routes
app.use("/transactions", transactionRoutes);

app.listen(process.env.PORT, () => {
  db();
  console.log(`Server started and running on port: ${process.env.PORT}`);
});
