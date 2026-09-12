const crypto = require("node:crypto");

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
});

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getCookieOptions());
};

module.exports = {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_MS,
  hashRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
};