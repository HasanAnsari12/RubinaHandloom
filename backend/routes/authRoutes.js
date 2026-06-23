const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Route
router.get("/me", protect, getMe);
router.post(
  "/forgot-password",
  forgotPassword
);
router.put(
  "/change-password",
  protect,
  changePassword
);
module.exports = router;