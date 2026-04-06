const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

const getAllProducts = async (req, res) => {
  try {
    const query = {};
    const activeParam = req.query.isActive;
    if (!activeParam || activeParam === "true") query.isActive = true;
    else if (activeParam === "false") query.isActive = false;

    if (req.query.category) query.category = { $in: [req.query.category] };
    if (req.query.search) query.title = { $regex: req.query.search, $options: "i" };
    if (req.query.featured === "true") query.isFeatured = true;
    if (req.query.latest === "true") query.isLatest = true;
    if (req.query.mostDemanding === "true") query.isMostDemanding = true;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.status(200).json({ success: true, data: products, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/products/:id/upload — upload images for a product
const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded." });

    const imagePaths = req.files.map(f => `/uploads/${f.filename}`);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: imagePaths } } },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, uploadProductImages };
