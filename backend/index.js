const express = require("express");
const cors = require("cors");
const db = require("./db/db");
const userRoutes = require("./routes/user");
const transactionRoutes = require("./routes/transactions");
const { validateBody, invalidRequest } = require("./middleware/validator");
require("dotenv").config();
const app = express();

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//routes
app.use(validateBody);
app.use("/auth", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/", invalidRequest);

app.listen(process.env.PORT, () => {
  db();
  console.log(`Server started and running on port: ${process.env.PORT}`);
});
