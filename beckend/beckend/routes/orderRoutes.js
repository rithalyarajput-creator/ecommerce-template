const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");

// POST /api/orders  — protected user
router.post("/", protect, createOrder);

// GET /api/orders/my-orders  — protected user
// NOTE: this route must be defined before /:id to avoid "my-orders" being treated as an id
router.get("/my-orders", protect, getMyOrders);

// GET /api/orders  — admin only
router.get("/", protect, admin, getAllOrders);

// GET /api/orders/:id  — protected (owner or admin)
router.get("/:id", protect, getOrderById);

// PUT /api/orders/:id/status  — admin only
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
