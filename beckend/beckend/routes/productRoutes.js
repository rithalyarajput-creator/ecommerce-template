const express = require("express");
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, uploadProductImages } = require("../controllers/productController");
const { protect, admin } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/upload", protect, admin, upload.array("images", 10), uploadProductImages);

module.exports = router;
