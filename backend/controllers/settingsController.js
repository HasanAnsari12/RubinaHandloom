const Settings = require("../models/Settings");
const os = require("os");
const mongoose = require("mongoose");

// Sensitive fields that should never be returned in GET responses
const REDACTED = "[REDACTED]";

const sanitizeSettings = (settings) => {
  const obj = settings.toObject();
  // Redact sensitive credentials from outgoing response
  if (obj.payment?.razorpayKeySecret) obj.payment.razorpayKeySecret = REDACTED;
  if (obj.email?.smtpPass) obj.email.smtpPass = REDACTED;
  return obj;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all settings (singleton document)
// @route   GET /api/admin/settings
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.status(200).json({
      success: true,
      settings: sanitizeSettings(settings),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single settings section
// @route   GET /api/admin/settings/:section
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getSettingsSection = async (req, res) => {
  try {
    const { section } = req.params;
    const settings = await Settings.getSingleton();
    const sanitized = sanitizeSettings(settings);

    if (!sanitized[section]) {
      return res.status(404).json({
        success: false,
        message: `Settings section '${section}' not found.`,
      });
    }

    res.status(200).json({
      success: true,
      section,
      data: sanitized[section],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a settings section
// @route   PUT /api/admin/settings/:section
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateSettingsSection = async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;

    const validSections = [
      "store",
      "payment",
      "shipping",
      "tax",
      "email",
      "notifications",
      "security",
      "appearance",
      "maintenance",
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid settings section: '${section}'.`,
      });
    }

    // Build a $set object that only updates the specific section's fields
    const updateFields = {};
    Object.keys(updateData).forEach((key) => {
      // Skip redacted values — don't overwrite secrets with placeholder text
      if (updateData[key] === REDACTED) return;
      updateFields[`${section}.${key}`] = updateData[key];
    });

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateFields },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated.`,
      settings: sanitizeSettings(settings),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Test SMTP email connection
// @route   POST /api/admin/settings/email/test
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const testEmailConnection = async (req, res) => {
  try {
    const { testEmailAddress } = req.body;
    const settings = await Settings.getSingleton();
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFromName, smtpFromEmail } =
      settings.email;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return res.status(400).json({
        success: false,
        message: "SMTP credentials not configured. Please save settings first.",
      });
    }

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: settings.email.smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"${smtpFromName}" <${smtpFromEmail || smtpUser}>`,
      to: testEmailAddress || smtpUser,
      subject: "✅ SMTP Test — SRK Handloom Admin",
      html: `<p>Your SMTP configuration is working correctly.</p>
             <p>Sent at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>`,
    });

    res.status(200).json({
      success: true,
      message: `Test email sent to ${testEmailAddress || smtpUser}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `SMTP test failed: ${error.message}`,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get system info (About System tab)
// @route   GET /api/admin/settings/system/info
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getSystemInfo = async (req, res) => {
  try {
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMins = Math.floor((uptimeSeconds % 3600) / 60);

    const memoryUsage = process.memoryUsage();
    const totalMemMB = Math.round(os.totalmem() / 1024 / 1024);
    const freeMemMB = Math.round(os.freemem() / 1024 / 1024);
    const usedMemMB = totalMemMB - freeMemMB;

    // Check MongoDB connection state
    const dbState = mongoose.connection.readyState;
    const dbStateLabel = ["Disconnected", "Connected", "Connecting", "Disconnecting"][dbState] || "Unknown";

    res.status(200).json({
      success: true,
      system: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        cpuCores: os.cpus().length,
        totalMemoryMB: totalMemMB,
        usedMemoryMB: usedMemMB,
        freeMemoryMB: freeMemMB,
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        uptimeFormatted: `${uptimeHours}h ${uptimeMins}m`,
        uptimeSeconds: Math.floor(uptimeSeconds),
        dbStatus: dbStateLabel,
        dbName: mongoose.connection.db?.databaseName || "—",
        appVersion: process.env.APP_VERSION || "1.0.0",
        startedAt: new Date(Date.now() - uptimeSeconds * 1000).toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllSettings,
  getSettingsSection,
  updateSettingsSection,
  testEmailConnection,
  getSystemInfo,
};
