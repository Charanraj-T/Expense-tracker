const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";
const JWT_ALGORITHMS = ["HS256"];

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      algorithms: JWT_ALGORITHMS,
    });
    if (payload.type !== "access") {
      throw new Error("Wrong token type");
    }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const createToken = (payload) => {
  return jwt.sign({ ...payload, type: "access" }, process.env.JWT_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(
    { ...payload, type: "refresh" },
    process.env.JWT_SECRET_KEY,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );
};

const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET_KEY, {
    algorithms: JWT_ALGORITHMS,
  });
  if (payload.type !== "refresh") {
    throw new Error("Wrong token type");
  }
  return payload;
};

module.exports = {
  verifyToken,
  createToken,
  createRefreshToken,
  verifyRefreshToken,
};