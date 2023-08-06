const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  let token;
  let decoded;
  try {
    token = req.headers.authorization.split(" ")[1];
    if (token) {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    }
    if (decoded) {
      res.locals.token = decoded;
      next();
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const createToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  return token;
};

module.exports = { verifyToken, createToken };
