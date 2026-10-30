const express = require("express");
const router = express.Router();
const {
  getAllSettings,
  getSettingsSection,
  updateSettingsSection,
  testEmailConnection,
  getSystemInfo,
} = require("../controllers/settingsController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// All settings routes are protected and admin-only
router.use(protect, admin);

// GET /api/admin/settings           → All settings (redacted secrets)
router.get("/", getAllSettings);

// GET /api/admin/settings/system/info → System info (node, db, memory)
router.get("/system/info", getSystemInfo);

// POST /api/admin/settings/email/test → Test SMTP connection
router.post("/email/test", testEmailConnection);

// GET /api/admin/settings/:section  → Single section
router.get("/:section", getSettingsSection);

// PUT /api/admin/settings/:section  → Update a section
router.put("/:section", updateSettingsSection);

module.exports = router;
