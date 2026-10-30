const express = require("express");
const router = express.Router();
const {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public/Customer Coupon Validation endpoint
router.post("/validate", protect, validateCoupon);

// Admin-only Coupons Management CRUD endpoints
router.get("/", protect, admin, getCoupons);
router.get("/:id", protect, admin, getCouponById);
router.post("/", protect, admin, createCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.patch("/:id/status", protect, admin, updateCouponStatus);
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
