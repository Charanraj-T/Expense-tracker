const mongoose = require("mongoose");

const userModel = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, maxLength: 30 },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userModel);
