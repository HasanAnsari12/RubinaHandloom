const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory,
} = require("../controllers/categoryController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public endpoints
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin-only write/edit endpoints
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
