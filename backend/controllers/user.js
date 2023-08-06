const user = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/login");
const { createToken } = require("../middleware/auth");

const registerUser = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    } else {
      const userDetail = await user.findOne({ email: email });
      if (userDetail) {
        res.status(403).json({ message: "User already exists" });
      } else {
        const newUser = user({
          username: username,
          email: email,
          password: await hashPassword(password),
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    } else {
      const userDetail = await user.findOne({ email: email });
      if (userDetail) {
        const isUserValid = await comparePassword(
          password,
          userDetail.password
        );
        if (isUserValid) {
          res.status(200).json({
            username: userDetail.username,
            token: createToken({
              username: userDetail.username,
              email: userDetail.email,
            }),
          });
        } else {
          res.status(401).json({ message: "Invalid password" });
        }
      } else {
        res.status(401).json({ message: "Invalid user!" });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser };
