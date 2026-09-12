const User = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/login");
const { createToken } = require("../middleware/auth");
const { HttpError } = require("../utils/httpError");

const registerUser = async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    throw new HttpError(400, "All fields are required!");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new HttpError(409, "User already exists");
  }

  const user = await User.create({
    username,
    email,
    password: await hashPassword(password),
  });

  res.status(201).json({ message: "User registered successfully!" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new HttpError(400, "All fields are required!");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = createToken({ userId: user._id, email: user.email });

  res.status(200).json({ username: user.username, userId: user._id, token });
};

module.exports = { registerUser, loginUser };