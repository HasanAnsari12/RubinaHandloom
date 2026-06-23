const Product = require("../models/Product");
const User = require("../models/User");

// Try to load Order model safely
let Order;

try {
  Order = require("../models/Order");
} catch (error) {
  Order = null;
}

const getDashboardStats = async (req, res) => {
  try {
    // Products
    const totalProducts =
      await Product.countDocuments();

    // Users
    const totalUsers =
      await User.countDocuments();

    // Default values
    let totalOrders = 0;
    let revenue = 0;

    // Only calculate if Order model exists
    if (
      Order &&
      typeof Order.countDocuments === "function"
    ) {
      totalOrders =
        await Order.countDocuments();

      const orders = await Order.find();

      revenue = orders.reduce(
        (sum, order) =>
          sum + (order.totalPrice || 0),
        0
      );
    }

    res.status(200).json({
      totalProducts,
      totalOrders,
      totalUsers,
      revenue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};