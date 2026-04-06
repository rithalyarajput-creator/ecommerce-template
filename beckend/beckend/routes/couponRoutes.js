const express = require("express");
const router = express.Router();
const {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");
const { protect, admin } = require("../middleware/auth");

// POST /api/coupons/validate  — public
// NOTE: defined before /:id routes to avoid conflict
router.post("/validate", validateCoupon);

// GET /api/coupons  — admin only
router.get("/", protect, admin, getAllCoupons);

// POST /api/coupons  — admin only
router.post("/", protect, admin, createCoupon);

// PUT /api/coupons/:id  — admin only
router.put("/:id", protect, admin, updateCoupon);

// DELETE /api/coupons/:id  — admin only
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
