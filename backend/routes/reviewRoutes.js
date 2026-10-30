const express = require("express");
const router = express.Router();
const {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public endpoint (any guest can view saree ratings & comments)
router.get("/product/:productId", getProductReviews);

// Private write/update/delete endpoints (requires authenticated token)
router.post("/", protect, addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

// Admin-only reviews moderation routes
router.get("/", protect, admin, getAllReviews);
router.patch("/:id/status", protect, admin, updateReviewStatus);

module.exports = router;
