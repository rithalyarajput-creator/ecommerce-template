const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, admin } = require("../middleware/auth");

// GET /api/categories  — public
router.get("/", getCategories);

// POST /api/categories  — admin only
router.post("/", protect, admin, createCategory);

// PUT /api/categories/:id  — admin only
router.put("/:id", protect, admin, updateCategory);

// DELETE /api/categories/:id  — admin only
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
