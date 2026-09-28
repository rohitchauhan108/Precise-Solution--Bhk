const Admin = require("../models/Admin");
const { sendTokenCookie, clearTokenCookie } = require("../utils/tokenCookie");

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    sendTokenCookie(res, admin._id);

    return res.status(200).json({
      success: true,
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong during login." });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({ success: true, message: "Logged out." });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  // req.admin is set by the `protect` middleware
  return res.status(200).json({
    success: true,
    admin: { id: req.admin._id, email: req.admin.email },
  });
};

module.exports = { login, logout, getMe };
