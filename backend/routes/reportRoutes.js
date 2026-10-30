const express = require("express");
const router = express.Router();
const { generateReport, getHistory } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// GET /api/admin/reports/history - Retrieve list of past generated exports
router.get("/history", protect, admin, getHistory);

// GET /api/admin/reports/:reportType - Generate or download CSV for specific categories
router.get("/:reportType", protect, admin, generateReport);

module.exports = router;
