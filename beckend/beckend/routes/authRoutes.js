const express = require("express");
const router = express.Router();
const { register, login, getMe, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/setup-admin — one-time admin creation (uses secret key)
router.post("/setup-admin", async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;
    if (secret !== process.env.JWT_SECRET) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    let user = await User.findOne({ email });
    if (user) {
      user.role = "admin";
      await user.save();
      return res.json({ success: true, message: "Role updated to admin", email: user.email });
    }
    user = await User.create({ name, email, password, role: "admin" });
    res.status(201).json({ success: true, message: "Admin created", email: user.email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me
router.get("/me", protect, getMe);

// POST /api/auth/logout
router.post("/logout", protect, logout);

module.exports = router;
