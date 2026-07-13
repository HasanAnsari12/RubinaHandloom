const mongoose = require("mongoose");

// @desc    Validate checkout order placement payload
const validatePlaceOrder = (req, res, next) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  // 1. Shipping Address Validation
  if (!shippingAddress) {
    return res.status(400).json({
      success: false,
      message: "Shipping address details are required",
    });
  }

  const { fullName, phone, house, area, city, state, pincode } = shippingAddress;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ success: false, message: "Recipient's full name is required" });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, message: "Recipient's contact phone number is required" });
  }
  if (phone.trim().length < 10) {
    return res.status(400).json({ success: false, message: "Recipient's phone number must be at least 10 characters long" });
  }
  if (!house || !house.trim()) {
    return res.status(400).json({ success: false, message: "House/Flat number is required" });
  }
  if (!area || !area.trim()) {
    return res.status(400).json({ success: false, message: "Area/Street name is required" });
  }
  if (!city || !city.trim()) {
    return res.status(400).json({ success: false, message: "City name is required" });
  }
  if (!state || !state.trim()) {
    return res.status(400).json({ success: false, message: "State name is required" });
  }
  if (!pincode || !pincode.trim()) {
    return res.status(400).json({ success: false, message: "Pincode is required" });
  }

  // 2. Payment Method Validation
  if (paymentMethod !== undefined) {
    const allowedMethods = ["Razorpay", "COD"];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Must be 'Razorpay' or 'COD'",
      });
    }
  }

  // 3. Coupon Code Validation (if provided)
  if (couponCode !== undefined && couponCode !== null && couponCode !== "") {
    if (typeof couponCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "Coupon code must be a string",
      });
    }
    req.body.couponCode = couponCode.trim().toUpperCase();
  }

  next();
};

// @desc    Validate order cancellation ID format
const validateCancelOrder = (req, res, next) => {
  const { id } = req.params;

  // 4. Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Order ID format",
    });
  }

  next();
};

// @desc    Validate order update statuses (Admin)
const validateUpdateOrderStatus = (req, res, next) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  // 4. Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Order ID format",
    });
  }

  // 5. Validate orderStatus (if provided)
  if (orderStatus !== undefined) {
    const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status value. Allowed: Pending, Processing, Shipped, Delivered, Cancelled",
      });
    }
  }

  // 6. Validate paymentStatus (if provided)
  if (paymentStatus !== undefined) {
    const allowedPaymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status value. Allowed: Pending, Paid, Failed, Refunded",
      });
    }
  }

  if (orderStatus === undefined && paymentStatus === undefined) {
    return res.status(400).json({
      success: false,
      message: "At least orderStatus or paymentStatus is required to update",
    });
  }

  next();
};

module.exports = {
  validatePlaceOrder,
  validateCancelOrder,
  validateUpdateOrderStatus,
};
