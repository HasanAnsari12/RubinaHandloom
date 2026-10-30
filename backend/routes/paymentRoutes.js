const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  calculatePricing,
  createOrder,
  verifyPayment,
  handleWebhook,
} = require("../controllers/paymentController");

// Private customer routes
router.post("/calculate-pricing", protect, calculatePricing);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);

// Webhook listener (Public, verified via cryptographic signature)
router.post("/webhook", handleWebhook);

module.exports = router;
