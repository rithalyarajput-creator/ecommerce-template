const express = require("express");
const router = express.Router();
const {
  createLead,
  getAllLeads,
  updateLeadStatus,
  deleteLead,
} = require("../controllers/leadController");
const { protect, admin } = require("../middleware/auth");

// POST /api/leads  — public (contact form)
router.post("/", createLead);

// GET /api/leads  — admin only
router.get("/", protect, admin, getAllLeads);

// PATCH /api/leads/:id/status  — admin only
router.patch("/:id/status", protect, admin, updateLeadStatus);

// DELETE /api/leads/:id  — admin only
router.delete("/:id", protect, admin, deleteLead);

module.exports = router;
