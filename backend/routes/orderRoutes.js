const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// All order endpoints require authentication protection
router.use(protect);

// Customer specific operations
router.post("/", placeOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

// Admin-only dashboard operations
router.get("/", admin, getAllOrders);
router.put("/:id/status", admin, updateOrderStatus);

module.exports = router;
