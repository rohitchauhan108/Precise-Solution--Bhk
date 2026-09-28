const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

/**
 * Protects routes by requiring a valid JWT sent in the httpOnly "token" cookie.
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin account no longer exists." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Session expired or invalid. Please log in again." });
  }
};

module.exports = { protect };
