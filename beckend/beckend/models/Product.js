const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Product title is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
  },
  comparePrice: {
    type: Number,
  },
  category: {
    type: [String],
    default: [],
  },
  stock: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isLatest: {
    type: Boolean,
    default: true,
  },
  isMostDemanding: {
    type: Boolean,
    default: false,
  },
  isHighProfit: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "active",
  },
  meeshoLink: {
    type: String,
  },
  flipkartLink: {
    type: String,
  },
  amazonLink: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
