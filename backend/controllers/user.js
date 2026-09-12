const mongoose = require("mongoose");
const User = require("../models/user");
const Session = require("../models/session");
const { hashPassword, comparePassword } = require("../utils/login");
const {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../middleware/auth");
const {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_MS,
  hashRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require("../utils/tokenHash");
const { HttpError } = require("../utils/httpError");
const crypto = require("node:crypto");

const registerUser = async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    throw new HttpError(400, "All fields are required!");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new HttpError(409, "User already exists");
  }

  await User.create({
    username,
    email,
    password: await hashPassword(password),
  });

  res.status(201).json({ message: "User registered successfully!" });
};

const issueRefreshSession = async (userId, userAgent, sessionId) => {
  const _id = sessionId || new mongoose.Types.ObjectId();
  const token = createRefreshToken({
    userId: String(userId),
    sessionId: String(_id),
    jti: crypto.randomBytes(16).toString("hex"),
  });
  const expiresAt = new Date(Date.now() + REFRESH_COOKIE_MAX_AGE_MS);

  await Session.updateOne(
    { _id },
    { $set: { userId, tokenHash: hashRefreshToken(token), expiresAt, userAgent } },
    { upsert: true },
  );

  return { token, _id };
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

  const accessToken = createToken({ userId: user._id, email: user.email });
  const { token } = await issueRefreshSession(
    user._id,
    req.get("user-agent") || "",
  );
  setRefreshCookie(res, token);

  res
    .status(200)
    .json({
      username: user.username,
      userId: user._id,
      email: user.email,
      token: accessToken,
    });
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    throw new HttpError(401, "Refresh token missing");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    clearRefreshCookie(res);
    throw new HttpError(401, "Invalid refresh token");
  }

  const newToken = createRefreshToken({
    userId: String(payload.userId),
    sessionId: String(payload.sessionId),
    jti: crypto.randomBytes(16).toString("hex"),
  });
  const nextExpiry = new Date(Date.now() + REFRESH_COOKIE_MAX_AGE_MS);

  const rotated = await Session.findOneAndUpdate(
    {
      _id: payload.sessionId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        tokenHash: hashRefreshToken(newToken),
        expiresAt: nextExpiry,
        userAgent: req.get("user-agent") || "",
      },
    },
    { returnDocument: "after" },
  );

  if (!rotated) {
    const session = await Session.findById(payload.sessionId);
    clearRefreshCookie(res);
    if (!session) {
      throw new HttpError(401, "Session not found");
    }
    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      throw new HttpError(401, "Session expired");
    }
    await Session.deleteMany({ userId: payload.userId });
    throw new HttpError(401, "Session revoked");
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    clearRefreshCookie(res);
    throw new HttpError(401, "User not found");
  }

  setRefreshCookie(res, newToken);

  res.json({
    username: user.username,
    userId: user._id,
    email: user.email,
    token: createToken({ userId: user._id, email: user.email }),
  });
};

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await Session.deleteOne({ _id: payload.sessionId });
    } catch (err) {
      // ignore invalid or expired tokens; cookie is cleared below
    }
  }
  clearRefreshCookie(res);
  res.json({ message: "Logged out successfully" });
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };