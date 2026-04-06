const FAQ = require("../models/FAQ");

const getAllFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, faqs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createFaq = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, faq });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

const updateFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, faq });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

const deleteFaq = async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "FAQ deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getAllFaqs, createFaq, updateFaq, deleteFaq };
