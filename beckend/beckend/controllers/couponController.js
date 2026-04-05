const Coupon = require("../models/Coupon");

// GET all coupons (admin)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// CREATE coupon (admin)
const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

// UPDATE coupon (admin)
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: coupon });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

// DELETE coupon (admin)
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// VALIDATE coupon (frontend — public)
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Coupon code required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });

    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate))
      return res.status(400).json({ success: false, message: "Coupon not started yet" });
    if (coupon.endDate && now > new Date(coupon.endDate))
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    if (coupon.minOrder && orderAmount < coupon.minOrder)
      return res.status(400).json({ success: false, message: `Min order ₹${coupon.minOrder} required` });
    if (coupon.totalLimit && coupon.usedCount >= coupon.totalLimit)
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });

    // Calculate discount
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.round((orderAmount * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    } else {
      discount = coupon.value;
    }
    if (discount > orderAmount) discount = orderAmount;

    res.json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discount,
        finalAmount: orderAmount - discount,
      }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
