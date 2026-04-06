const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/auth");

// GET /api/products  — public
router.get("/", getAllProducts);

// GET /api/products/:id  — public
router.get("/:id", getProductById);

// POST /api/products  — admin only
router.post("/", protect, admin, createProduct);

// PUT /api/products/:id  — admin only
router.put("/:id", protect, admin, updateProduct);

// DELETE /api/products/:id  — admin only (soft delete)
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
