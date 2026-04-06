const express = require("express");
const router = express.Router();
const { getAllFaqs, createFaq, updateFaq, deleteFaq } = require("../controllers/faqController");
const { protect, admin } = require("../middleware/auth");

router.get("/", getAllFaqs);
router.post("/", protect, admin, createFaq);
router.put("/:id", protect, admin, updateFaq);
router.delete("/:id", protect, admin, deleteFaq);

module.exports = router;
