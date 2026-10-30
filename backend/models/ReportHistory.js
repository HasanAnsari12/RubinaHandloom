const mongoose = require("mongoose");

const reportHistorySchema = new mongoose.Schema(
  {
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportType: {
      type: String,
      enum: ["Sales", "Orders", "Products", "Customers", "Reviews", "Coupons"],
      required: true,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    fileName: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ["CSV", "PDF", "Excel", "Print"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed", "Processing"],
      default: "Success",
    },
    recordsCount: {
      type: Number,
      default: 0,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: "generatedAt", updatedAt: false },
  }
);

module.exports = mongoose.model("ReportHistory", reportHistorySchema);
