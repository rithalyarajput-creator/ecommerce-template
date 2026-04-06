const Category = require("../models/Category");

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
// Response: { success, data: { categories } }
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Admin only
// Request body: { name, image }
// Response: { success, data: { category } }
const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin only
// Request body: { name, image, isActive }
// Response: { success, data: { category } }
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin only
// Response: { success, message }
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const imagePath = `/uploads/${req.file.filename}`;
    const category = await Category.findByIdAndUpdate(req.params.id, { image: imagePath }, { new: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found." });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage };
