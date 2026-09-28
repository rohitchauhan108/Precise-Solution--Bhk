const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const signToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Sets the JWT as an httpOnly cookie on the response.
 * In production (cross-domain frontend/backend) we need SameSite=None + Secure
 * so the browser will send the cookie on cross-origin requests over HTTPS.
 * In local development, frontend and backend are same-site (e.g. both on
 * localhost, different ports), so Lax + non-secure works over plain HTTP.
 */
const sendTokenCookie = (res, adminId) => {
  const token = signToken(adminId);
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: MAX_AGE_MS,
    path: "/",
  });

  return token;
};

const clearTokenCookie = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
};

module.exports = { signToken, sendTokenCookie, clearTokenCookie, COOKIE_NAME };
