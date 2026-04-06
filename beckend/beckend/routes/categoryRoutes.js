const express = require("express");
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage } = require("../controllers/categoryController");
const { protect, admin } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getCategories);
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);
router.post("/:id/upload", protect, admin, upload.single("image"), uploadCategoryImage);

module.exports = router;
