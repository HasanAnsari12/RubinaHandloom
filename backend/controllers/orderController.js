const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address details are required",
      });
    }

    // 1. Fetch user's cart and populate product properties
    const cart = await Cart.findOne({ user: req.user._id }).populate("cartItems.product");
    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    // 2. Validate product existence, stock bounds, and compute subtotal
    for (const item of cart.cartItems) {
      const product = item.product;

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One or more products in your cart no longer exist in our store",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.title}. Only ${product.stock} items left.`,
        });
      }

      // Authoritative pricing: respect discountPrice if active, otherwise use standard price
      const unitPrice =
        product.discountPrice && product.discountPrice > 0
          ? Number(product.discountPrice)
          : Number(product.price);

      subtotal += unitPrice * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: unitPrice,
      });
    }

    // 3. Process and validate optional Coupon application
    let discount = 0;
    let couponId = null;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isDeleted: { $ne: true } });
      
      if (!coupon || coupon.status !== "Active" || coupon.validUntil < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired coupon code",
        });
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "This coupon's usage limit has been reached",
        });
      }

      if (subtotal < coupon.minimumOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${coupon.minimumOrderAmount} is required for this coupon`,
        });
      }

      if (coupon.discountType === "Percentage") {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maximumDiscountAmount) {
          discount = Math.min(discount, coupon.maximumDiscountAmount);
        }
      } else if (coupon.discountType === "Flat") {
        discount = coupon.discountValue;
      }

      discount = Math.min(discount, subtotal); // discount cannot exceed subtotal
      couponId = coupon._id;
    }

    // 4. Calculate shipping charge (Free Shipping: ₹0)
    const shippingCharge = 0;
    const totalAmount = subtotal - discount + shippingCharge;

    // 5. Decrement inventory stock count atomically with rollback to prevent negative inventory
    const decrementedProducts = [];
    try {
      for (const item of cart.cartItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(
            `Insufficient stock for ${item.product.title || "product"}. Order could not be fulfilled.`
          );
        }

        decrementedProducts.push({
          productId: item.product._id,
          quantity: item.quantity,
        });
      }
    } catch (stockError) {
      // Rollback any successfully decremented items
      for (const rollbackItem of decrementedProducts) {
        await Product.findByIdAndUpdate(rollbackItem.productId, {
          $inc: { stock: rollbackItem.quantity },
        });
      }

      return res.status(400).json({
        success: false,
        message: stockError.message,
      });
    }

    // 6. Increment coupon used counter
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }

    // 7. Initialize Order document
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "Razorpay",
      paymentStatus: "Pending",
      orderStatus: "Processing",
      subtotal,
      discount,
      shippingCharge,
      totalAmount,
      coupon: couponId,
      isStockDecremented: true,
    });

    // 8. Truncate user's cart array (checkout complete)
    cart.cartItems = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private (Owner or Admin)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authorization: Only owner or admin can inspect this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order details",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel an active order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Owner Only)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authorization: Only order owner can cancel their order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Constraint: Prevent cancelling delivered or dispatched orders
    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel an order that has already been delivered",
      });
    }

    if (order.orderStatus === "Shipped") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel an order that has already been shipped",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Increment stocks back to catalog inventory ONLY if inventory was actually decremented
    const shouldRestock =
      order.isStockDecremented === true ||
      (order.isStockDecremented === undefined &&
        (order.paymentStatus === "Paid" || order.paymentMethod === "COD"));

    if (shouldRestock) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
      order.isStockDecremented = false;
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders (Dashboard admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order and payment status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Order status update logic and stock adjustment if order is cancelled
    if (orderStatus) {
      const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
      if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status value",
        });
      }

      // If status is updated to Cancelled, return stock back to inventory ONLY if it was decremented
      if (orderStatus === "Cancelled" && order.orderStatus !== "Cancelled") {
        const shouldRestock =
          order.isStockDecremented === true ||
          (order.isStockDecremented === undefined &&
            (order.paymentStatus === "Paid" || order.paymentMethod === "COD"));

        if (shouldRestock) {
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity },
            });
          }
          order.isStockDecremented = false;
        }
      }
      // If status was Cancelled and is updated back to active, verify and deduct stock
      else if (order.orderStatus === "Cancelled" && orderStatus !== "Cancelled") {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (!product || product.stock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Cannot restore order status. Insufficient stock for product: ${product ? product.title : 'Unknown'}.`,
            });
          }
        }
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        }
        order.isStockDecremented = true;
      }

      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      const allowedPaymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status value",
        });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
