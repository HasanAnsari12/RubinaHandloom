const mongoose = require("mongoose");

// Tracks every stock change with reason, delta, and admin author
const stockAdjustmentSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Admin who performed the adjustment
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Reason category for the adjustment
    reason: {
      type: String,
      enum: [
        "Manual Correction",
        "Damage / Loss",
        "Return Received",
        "Supplier Restock",
        "Bulk Update",
        "Initial Stock",
        "System Adjustment",
        "Other",
      ],
      default: "Manual Correction",
    },

    // Optional freeform note
    note: {
      type: String,
      default: "",
      trim: true,
    },

    // Stock BEFORE this adjustment
    previousStock: {
      type: Number,
      required: true,
      default: 0,
    },

    // How many units were added (+) or removed (-)
    delta: {
      type: Number,
      required: true, // positive = added, negative = removed
    },

    // Stock AFTER this adjustment
    newStock: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt = time of adjustment
  }
);

// Index for fast product-level timeline queries
stockAdjustmentSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model("StockAdjustment", stockAdjustmentSchema);
