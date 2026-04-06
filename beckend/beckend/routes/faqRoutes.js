const express = require("express");
const router = express.Router();
const { getAllFaqs, createFaq, updateFaq, deleteFaq } = require("../controllers/faqController");
const { protect, admin } = require("../middleware/auth");

router.get("/", getAllFaqs);
// Public: FAQs to show on homepage (showOnHome: true & isActive: true)
router.get("/active", async (req, res) => {
  try {
    const FAQ = require("../models/FAQ");
    const faqs = await FAQ.find({ isActive: true, showOnHome: true }).sort({ order: 1 });
    res.json({ success: true, faqs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.post("/", protect, admin, createFaq);
router.put("/:id", protect, admin, updateFaq);
router.delete("/:id", protect, admin, deleteFaq);

module.exports = router;
