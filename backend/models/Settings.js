const mongoose = require("mongoose");

// ─── Settings Schema (Singleton Document) ─────────────────────────────────────
// Only one document exists. Use Settings.getSingleton() to always get/create it.

const settingsSchema = new mongoose.Schema(
  {
    // ── Store Information ─────────────────────────────────
    store: {
      name: { type: String, default: "SRK Handloom" },
      tagline: { type: String, default: "Premium Handwoven Fabrics" },
      logoUrl: { type: String, default: "" },
      faviconUrl: { type: String, default: "" },
      currency: { type: String, default: "INR" },
      currencySymbol: { type: String, default: "₹" },
      contactEmail: { type: String, default: "asarik782@gmail.com" },
      contactPhone: { type: String, default: "7000438132" },
      address: { type: String, default: "" },
      city: { type: String, default: "Chanderi" },
      state: { type: String, default: "Madhya Pradesh" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },

    // ── Payment Settings ─────────────────────────────────
    payment: {
      razorpayEnabled: { type: Boolean, default: true },
      razorpayKeyId: { type: String, default: "" },
      // Secret is stored but never exposed in GET response
      razorpayKeySecret: { type: String, default: "" },
      codEnabled: { type: Boolean, default: true },
      codCharge: { type: Number, default: 0 },
      codMinOrderAmount: { type: Number, default: 0 },
    },

    // ── Shipping Settings ────────────────────────────────
    shipping: {
      freeShippingEnabled: { type: Boolean, default: true },
      freeShippingThreshold: { type: Number, default: 999 },
      defaultShippingCharge: { type: Number, default: 99 },
      expressShippingEnabled: { type: Boolean, default: false },
      expressShippingCharge: { type: Number, default: 199 },
      estimatedDeliveryDays: { type: Number, default: 7 },
    },

    // ── Tax & GST Settings ───────────────────────────────
    tax: {
      gstEnabled: { type: Boolean, default: false },
      gstPercentage: { type: Number, default: 12 },
      gstInclusive: { type: Boolean, default: true }, // true = price includes GST
      gstin: { type: String, default: "" },
      hsnCode: { type: String, default: "" },
    },

    // ── Email / SMTP Settings ────────────────────────────
    email: {
      smtpHost: { type: String, default: "" },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: "" },
      smtpPass: { type: String, default: "" }, // never returned in GET
      smtpFromName: { type: String, default: "SRK Handloom" },
      smtpFromEmail: { type: String, default: "" },
      smtpSecure: { type: Boolean, default: false },
      orderConfirmationEnabled: { type: Boolean, default: true },
      shippingUpdateEnabled: { type: Boolean, default: true },
      adminOrderAlertEnabled: { type: Boolean, default: true },
    },

    // ── Notification Preferences ─────────────────────────
    notifications: {
      orderPlacedAlert: { type: Boolean, default: true },
      orderCancelledAlert: { type: Boolean, default: true },
      lowStockAlert: { type: Boolean, default: true },
      lowStockThreshold: { type: Number, default: 10 },
      newReviewAlert: { type: Boolean, default: true },
      newUserAlert: { type: Boolean, default: false },
      supportTicketAlert: { type: Boolean, default: true },
    },

    // ── Security Settings ────────────────────────────────
    security: {
      sessionTimeoutMinutes: { type: Number, default: 60 },
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDurationMinutes: { type: Number, default: 15 },
      requireEmailVerification: { type: Boolean, default: true },
      twoFactorEnabled: { type: Boolean, default: false }, // future-ready
      allowedAdminIPs: { type: [String], default: [] },   // future-ready
    },

    // ── Appearance / Theme ───────────────────────────────
    appearance: {
      adminTheme: {
        type: String,
        enum: ["dark", "light", "luxury"],
        default: "dark",
      },
      accentColor: { type: String, default: "#7B1E3A" },
      compactMode: { type: Boolean, default: false },
      sidebarCollapsed: { type: Boolean, default: false },
    },

    // ── Maintenance Mode ─────────────────────────────────
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: "We are currently undergoing maintenance. Please check back soon.",
      },
      allowAdminAccess: { type: Boolean, default: true },
      estimatedDowntime: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// ── Static singleton accessor ─────────────────────────────────────────────────
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
