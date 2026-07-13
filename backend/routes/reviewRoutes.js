const express = require("express");
const router = express.Router();
const {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// Public endpoint (any guest can view saree ratings & comments)
router.get("/product/:productId", getProductReviews);

// Private write/update/delete endpoints (requires authenticated token)
router.post("/", protect, addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
