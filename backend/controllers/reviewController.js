const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");

// Helper to recalculate and update product average rating & review count in DB
// Recalculates metrics immediately using only Approved and non-deleted reviews.
const updateProductRatingMetrics = async (productId) => {
  const reviews = await Review.find({ product: productId, status: "Approved", isDeleted: { $ne: true } });
  const numReviews = reviews.length;
  const rating = numReviews > 0
    ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / numReviews).toFixed(1))
    : 0;

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
};

// @desc    Get reviews for a product (Customer-facing, Approved only)
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID format",
      });
    }

    const reviews = await Review.find({
      product: productId,
      status: "Approved",
      isDeleted: { $ne: true },
    })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add a review for a product (Default status: Pending)
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const ratingNum = Number(rating);

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product ID, rating, and comment are required",
      });
    }

    // 1. Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID format",
      });
    }

    // 2. Validate rating boundary (1 to 5)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    // 3. Validate Saree Product existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 4. Validate that one user can review one product only (Reject with 409 Conflict)
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      isDeleted: { $ne: true },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: ratingNum,
      comment: comment.trim(),
      status: "Pending", // Default is Pending until moderated
    });

    // Note: Pending review doesn't alter rating metrics yet since we only aggregate Approved reviews
    await updateProductRatingMetrics(productId);

    res.status(201).json({
      success: true,
      message: "Review added successfully and is pending approval",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a review (Self owner only, Immutable comment check)
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Review ID format",
      });
    }

    const review = await Review.findById(id);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Ensure only review owner can update
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a number between 1 and 5",
        });
      }
      review.rating = ratingNum;
    }

    // Customer can edit comment, but admin edits are blocked by policy
    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();

    // Recalculate rating metrics
    await updateProductRatingMetrics(review.product);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a review (Soft Delete support, owner or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Review ID format",
      });
    }

    const review = await Review.findById(id);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Ensure review owner OR admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    const productId = review.product;

    // Perform soft delete
    review.isDeleted = true;
    review.deletedAt = new Date();
    await review.save();

    // Recalculate metrics immediately inside request lifecycle before success response
    await updateProductRatingMetrics(productId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully (soft-deleted)",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all reviews (Admin-only list)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isDeleted: { $ne: true } })
      .populate("user", "name email profileImage phone")
      .populate("product", "title category images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update review status (Admin moderation)
// @route   PATCH /api/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Review ID format",
      });
    }

    const allowedStatuses = ["Pending", "Approved", "Rejected", "Hidden"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const review = await Review.findById(id);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Duplicate verification check
    if (review.status === status) {
      return res.status(409).json({
        success: false,
        message: "Review already has this status.",
      });
    }

    review.status = status;
    await review.save();

    // Recalculate metrics immediately inside request lifecycle before success response
    await updateProductRatingMetrics(review.product);

    res.status(200).json({
      success: true,
      message: `Review status successfully updated to ${status}`,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus,
};
