require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const start = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`Server started and running on port: ${process.env.PORT}`);
    });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

start();