const express = require("express");
const router = express.Router();

const {
  updateProfile,
  getAllUsers,
  deleteUser,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Customer: Update own profile
router.put("/profile", protect, updateProfile);

// Admin: List all users
router.get("/", protect, admin, getAllUsers);

// Admin: Delete user by ID
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;