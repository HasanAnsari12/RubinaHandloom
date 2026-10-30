const express = require("express");
const router = express.Router();
const { getDashboardData } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// GET /api/admin/dashboard - Executive Analytics consolidated payload (Admin only)
router.get("/", protect, admin, getDashboardData);

module.exports = router;
