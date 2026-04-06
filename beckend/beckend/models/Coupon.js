const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ["percentage", "flat"],
    default: "percentage",
  },
  value: {
    type: Number,
    required: [true, "Coupon value is required"],
  },
  minOrder: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
  },
  totalLimit: {
    type: Number,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
