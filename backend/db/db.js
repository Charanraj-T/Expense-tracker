const mongoose = require("mongoose");

const db = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hzq90.mongodb.net/trackerDB?retryWrites=true&w=majority`);
    console.log("DB connected");
  } catch (err) {
    console.log("DB connection error:" + err);
  }
};

module.exports = db;
