const Product = require("../models/Product");

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
// Query params: category, search, featured, latest, mostDemanding, isActive
const getAllProducts = async (req, res) => {
  try {
    const query = {};

    // Default to only active products unless explicitly passed
    const activeParam = req.query.isActive;
    if (activeParam === undefined || activeParam === "true" || activeParam === "") {
      query.isActive = true;
    } else if (activeParam === "false") {
      query.isActive = false;
    }
    // if activeParam === "all", skip the isActive filter

    // Category filter
    if (req.query.category) {
      query.category = { $in: [req.query.category] };
    }

    // Text search on title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }

    // Boolean flag filters
    if (req.query.featured === "true") {
      query.isFeatured = true;
    }
    if (req.query.latest === "true") {
      query.isLatest = true;
    }
    if (req.query.mostDemanding === "true") {
      query.isMostDemanding = true;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Admin only
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin only
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Soft-delete product (set isActive: false)
// @route   DELETE /api/products/:id
// @access  Admin only
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
