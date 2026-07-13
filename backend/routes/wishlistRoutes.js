const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

// All wishlist routes require user authentication
router.use(protect);

router
  .route("/")
  .get(getWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

router.delete("/:productId", removeFromWishlist);

module.exports = router;
