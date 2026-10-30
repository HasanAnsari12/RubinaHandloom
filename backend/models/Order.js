const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, default: "Customer" },
    phone: { type: String, required: true, trim: true, default: "0000000000" },
    house: { type: String, required: true, trim: true, default: "Pending delivery details" },
    area: { type: String, required: true, trim: true, default: "Pending delivery details" },
    city: { type: String, required: true, trim: true, default: "Pending" },
    state: { type: String, required: true, trim: true, default: "Pending" },
    pincode: { type: String, required: true, trim: true, default: "000000" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
      default: () => ({
        fullName: "Customer",
        phone: "0000000000",
        house: "Pending delivery details",
        area: "Pending delivery details",
        city: "Pending",
        state: "Pending",
        pincode: "000000",
      }),
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Razorpay", "COD"],
      default: "Razorpay",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    shippingCharge: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    isStockDecremented: {
      type: Boolean,
      default: false,
    },
    finalizationLock: {
      type: Date,
      default: null,
    },
    lockToken: {
      type: String,
      default: null,
    },
    reviewRequired: {
      type: Boolean,
      default: false,
    },
    reconciliationReason: {
      type: String,
      default: null,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
      razorpayOrderId: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
