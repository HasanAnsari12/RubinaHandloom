const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// All cart routes require user authentication
router.use(protect);

router
  .route("/")
  .get(getCart)
  .post(addToCart)
  .put(updateCartItemQuantity)
  .delete(clearCart);

router.delete("/:productId", removeFromCart);

module.exports = router;
