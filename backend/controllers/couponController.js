const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");

// Helper to auto-update coupon status based on dates (Draft and Disabled are sticky)
const syncCouponStatus = async (coupon) => {
  if (!coupon || coupon.isDeleted) return coupon;
  if (coupon.status === "Disabled" || coupon.status === "Draft") {
    return coupon;
  }

  const now = new Date();
  let calculatedStatus = coupon.status;

  if (now > coupon.validUntil) {
    calculatedStatus = "Expired";
  } else if (now >= coupon.validFrom) {
    calculatedStatus = "Active";
  } else {
    calculatedStatus = "Scheduled";
  }

  if (coupon.status !== calculatedStatus) {
    coupon.status = calculatedStatus;
    await coupon.save();
  }
  return coupon;
};

// @desc    Get all coupons (Admin only, handles auto status sync)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });

    // Sync status dynamically for all queried coupons
    const syncedCoupons = await Promise.all(coupons.map((c) => syncCouponStatus(c)));

    res.status(200).json({
      success: true,
      count: syncedCoupons.length,
      coupons: syncedCoupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get coupon details by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon || coupon.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const synced = await syncCouponStatus(coupon);

    res.status(200).json({
      success: true,
      coupon: synced,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
      status,
      applicableOn,
      applicableProducts,
      applicableCategories,
      isStackable,
      usagePerCustomer,
    } = req.body;

    if (!code || !title || !discountType || !discountValue || !validFrom || !validUntil) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    // 1. Uniqueness check
    const existing = await Coupon.findOne({ code: normalizedCode, isDeleted: { $ne: true } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // 2. Validate Dates: validUntil must be after validFrom
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    if (untilDate <= fromDate) {
      return res.status(422).json({
        success: false,
        message: "Validation Error: Expiry date (validUntil) must be after start date (validFrom).",
      });
    }

    // 3. Discount validations
    const val = Number(discountValue);
    if (discountType === "Percentage") {
      if (val < 1 || val > 100) {
        return res.status(422).json({
          success: false,
          message: "Validation Error: Percentage discount must be between 1% and 100%.",
        });
      }
    } else if (discountType === "Flat") {
      if (val <= 0) {
        return res.status(422).json({
          success: false,
          message: "Validation Error: Flat discount amount must be greater than 0.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type. Must be Percentage or Flat.",
      });
    }

    // 4. Usage limit validations (Allow null/blank for unlimited, reject <= 0)
    let parsedUsageLimit = null;
    if (usageLimit !== undefined && usageLimit !== null && usageLimit !== "") {
      const limit = Number(usageLimit);
      if (isNaN(limit) || limit <= 0) {
        return res.status(422).json({
          success: false,
          message: "Validation Error: Usage limit must be a positive integer greater than 0, or empty for unlimited.",
        });
      }
      parsedUsageLimit = limit;
    }

    // Determine initial status based on transition rules
    let initialStatus = status || "Draft";
    if (initialStatus !== "Draft") {
      const now = new Date();
      if (now > untilDate) {
        initialStatus = "Expired";
      } else if (now >= fromDate) {
        initialStatus = "Active";
      } else {
        initialStatus = "Scheduled";
      }
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      title: title.trim(),
      description: description || "",
      discountType,
      discountValue: val,
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscountAmount: discountType === "Percentage" ? (Number(maximumDiscountAmount) || null) : null,
      usageLimit: parsedUsageLimit,
      validFrom: fromDate,
      validUntil: untilDate,
      status: initialStatus,
      applicableOn: applicableOn || "All Products",
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      isStackable: isStackable === true,
      usagePerCustomer: Number(usagePerCustomer) || 1,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
      status,
      applicableOn,
      applicableProducts,
      applicableCategories,
      isStackable,
      usagePerCustomer,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon || coupon.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const normalizedCode = code ? code.trim().toUpperCase() : coupon.code;

    // 1. Uniqueness check if code changes
    if (code && normalizedCode !== coupon.code) {
      const existing = await Coupon.findOne({ code: normalizedCode, isDeleted: { $ne: true } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Coupon code already exists",
        });
      }
      coupon.code = normalizedCode;
    }

    // 2. Validate Dates
    const fromDate = validFrom ? new Date(validFrom) : coupon.validFrom;
    const untilDate = validUntil ? new Date(validUntil) : coupon.validUntil;
    if (untilDate <= fromDate) {
      return res.status(422).json({
        success: false,
        message: "Validation Error: Expiry date (validUntil) must be after start date (validFrom).",
      });
    }

    // 3. Discount validations
    const type = discountType || coupon.discountType;
    const val = discountValue !== undefined ? Number(discountValue) : coupon.discountValue;
    if (type === "Percentage") {
      if (val < 1 || val > 100) {
        return res.status(422).json({
          success: false,
          message: "Validation Error: Percentage discount must be between 1% and 100%.",
        });
      }
    } else if (type === "Flat") {
      if (val <= 0) {
        return res.status(422).json({
          success: false,
          message: "Validation Error: Flat discount amount must be greater than 0.",
        });
      }
    }

    // 4. Usage limit validations (Allow null/blank for unlimited, reject <= 0)
    if (usageLimit !== undefined) {
      if (usageLimit === null || usageLimit === "") {
        coupon.usageLimit = null;
      } else {
        const limit = Number(usageLimit);
        if (isNaN(limit) || limit <= 0) {
          return res.status(422).json({
            success: false,
            message: "Validation Error: Usage limit must be a positive integer greater than 0, or empty for unlimited.",
          });
        }
        coupon.usageLimit = limit;
      }
    }

    coupon.title = title !== undefined ? title.trim() : coupon.title;
    coupon.description = description !== undefined ? description : coupon.description;
    coupon.discountType = type;
    coupon.discountValue = val;
    coupon.minimumOrderAmount = minimumOrderAmount !== undefined ? Number(minimumOrderAmount) : coupon.minimumOrderAmount;
    coupon.maximumDiscountAmount = type === "Percentage" ? (maximumDiscountAmount !== undefined ? maximumDiscountAmount : coupon.maximumDiscountAmount) : null;
    coupon.validFrom = fromDate;
    coupon.validUntil = untilDate;
    coupon.applicableOn = applicableOn !== undefined ? applicableOn : coupon.applicableOn;
    coupon.applicableProducts = applicableProducts !== undefined ? applicableProducts : coupon.applicableProducts;
    coupon.applicableCategories = applicableCategories !== undefined ? applicableCategories : coupon.applicableCategories;
    coupon.isStackable = isStackable !== undefined ? isStackable === true : coupon.isStackable;
    coupon.usagePerCustomer = usagePerCustomer !== undefined ? Number(usagePerCustomer) : coupon.usagePerCustomer;

    if (status) {
      coupon.status = status;
    }

    await coupon.save();
    const synced = await syncCouponStatus(coupon);

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: synced,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update coupon status manually (Enable / Disable)
// @route   PATCH /api/coupons/:id/status
// @access  Private/Admin
const updateCouponStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["Draft", "Active", "Disabled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status parameter. Must be Draft, Active, or Disabled",
      });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon || coupon.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    if (coupon.status === status) {
      return res.status(409).json({
        success: false,
        message: `Coupon status is already ${status}`,
      });
    }

    coupon.status = status;
    await coupon.save();
    
    // Auto sync if enabled (Active/Draft sync rules)
    const synced = await syncCouponStatus(coupon);

    res.status(200).json({
      success: true,
      message: `Coupon has been successfully set to ${status}`,
      coupon: synced,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a coupon (Soft Delete)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon || coupon.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // soft delete operations
    coupon.isDeleted = true;
    coupon.deletedAt = new Date();
    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully (soft-deleted)",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Validate a coupon code (Customer Checkout Validation)
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const orderAmount = Number(subtotal) || 0;
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isDeleted: { $ne: true } });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Sync status dynamically (catches Expired/Active logs)
    const synced = await syncCouponStatus(coupon);

    if (synced.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: `This coupon is currently ${synced.status.toLowerCase()}`,
      });
    }

    if (synced.usageLimit && synced.usedCount >= synced.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This coupon's usage limit has been reached",
      });
    }

    if (orderAmount < synced.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${synced.minimumOrderAmount} is required for this coupon`,
      });
    }

    let discount = 0;
    if (synced.discountType === "Percentage") {
      discount = (orderAmount * synced.discountValue) / 100;
      if (synced.maximumDiscountAmount) {
        discount = Math.min(discount, synced.maximumDiscountAmount);
      }
    } else {
      discount = synced.discountValue;
    }

    discount = Math.min(discount, orderAmount);

    res.status(200).json({
      success: true,
      message: "Coupon validated successfully",
      coupon: {
        _id: synced._id,
        code: synced.code,
        title: synced.title,
        discountType: synced.discountType,
        discountValue: synced.discountValue,
        discountAmount: discount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
  validateCoupon,
};
