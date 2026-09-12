const dns = require("node:dns");
const mongoose = require("mongoose");

const db = async () => {
  try {
    mongoose.set("strictQuery", false);
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing in environment variables");
    }

    if (mongoUri.startsWith("mongodb+srv://")) {
      dns.setDefaultResultOrder("ipv4first");
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    }

    await mongoose.connect(mongoUri);
    console.log("DB connected");
  } catch (err) {
    console.log("DB connection error:" + err);
  }
};

module.exports = db;