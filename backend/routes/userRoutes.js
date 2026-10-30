const express = require("express");
const router = express.Router();

const {
  updateProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateUserStatus,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Customer: Update own profile
router.put("/profile", protect, updateProfile);

// Admin: List all users
router.get("/", protect, admin, getAllUsers);

// Admin: Delete user by ID (soft-delete)
router.delete("/:id", protect, admin, deleteUser);

// Admin: Update user role
router.patch("/:id/role", protect, admin, updateUserRole);

// Admin: Update user status (block/unblock)
router.patch("/:id/status", protect, admin, updateUserStatus);

module.exports = router;