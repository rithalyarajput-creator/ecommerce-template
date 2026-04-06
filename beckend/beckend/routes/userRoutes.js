const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");

router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users, total: users.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
