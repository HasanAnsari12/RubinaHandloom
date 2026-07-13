const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  checkResetToken,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { validateForgotPassword, validateResetPassword } = require("../validators/authValidator");

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many password reset requests. Please try again after 15 minutes.",
  },
});

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

router.post("/forgot-password", forgotPasswordLimiter, validateForgotPassword, forgotPassword);
router.get("/reset-password/:token", checkResetToken);
router.post("/reset-password/:token", validateResetPassword, resetPassword);

// Protected Route
router.get("/me", protect, getMe);
router.put(
  "/change-password",
  protect,
  changePassword
);
module.exports = router;