const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Coupon = require("../models/Coupon");

/**
 * Reusable analytics aggregations and statistics calculations.
 */

const calculateRevenue = async (startDate, endDate) => {
  const match = { orderStatus: { $ne: "Cancelled" } };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const result = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalDiscounts: { $sum: "$discount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = result[0] || { totalRevenue: 0, totalDiscounts: 0, count: 0 };
  const aov = stats.count > 0 ? Number((stats.totalRevenue / stats.count).toFixed(2)) : 0;

  return {
    revenue: stats.totalRevenue,
    discounts: stats.totalDiscounts,
    count: stats.count,
    aov,
  };
};

const calculateSalesTrend = async (days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const trendData = await Order.aggregate([
    {
      $match: {
        orderStatus: { $ne: "Cancelled" },
        createdAt: { $gte: cutoffDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Format array to be fully compatible with Recharts (with default missing values)
  const map = new Map(trendData.map((d) => [d._id, d]));
  const result = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = map.get(dateStr) || { revenue: 0, orders: 0 };
    result.push({
      date: dateStr,
      revenue: entry.revenue,
      orders: entry.orders,
    });
  }

  return result;
};

const calculateOrderMetrics = async () => {
  const statusDistribution = await Order.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  const distMap = {
    Pending: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  statusDistribution.forEach((item) => {
    if (distMap[item._id] !== undefined) {
      distMap[item._id] = item.count;
    }
  });

  return distMap;
};

const calculateUserMetrics = async () => {
  const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
  const admins = await User.countDocuments({ role: "admin", isDeleted: { $ne: true } });
  const customers = await User.countDocuments({ role: "user", isDeleted: { $ne: true } });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newUsers = await User.countDocuments({
    isDeleted: { $ne: true },
    createdAt: { $gte: startOfMonth },
  });

  // Calculate returning customers (> 1 order count)
  const orderCounts = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $group: { _id: "$user", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  const returningCustomersCount = orderCounts.length;

  // Retrieve top spending customers
  const topSpenders = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$totalAmount" },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
  ]);

  await User.populate(topSpenders, {
    path: "_id",
    select: "name email profileImage phone",
  });

  const topCustomers = topSpenders
    .filter((s) => s._id)
    .map((s) => ({
      _id: s._id._id,
      name: s._id.name,
      email: s._id.email,
      phone: s._id.phone,
      profileImage: s._id.profileImage,
      totalSpent: s.totalSpent,
      ordersCount: s.ordersCount,
    }));

  const recentRegistrations = await User.find({ isDeleted: { $ne: true } })
    .select("name email profileImage createdAt")
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    totalUsers,
    admins,
    customers,
    newUsers,
    returningCustomersCount,
    topCustomers,
    recentRegistrations,
  };
};

const calculateProductMetrics = async () => {
  const totalProducts = await Product.countDocuments({ isDeleted: { $ne: true } });
  const activeProducts = await Product.countDocuments({ status: "Active", isDeleted: { $ne: true } });
  const outOfStock = await Product.countDocuments({ stock: 0, isDeleted: { $ne: true } });
  const lowStock = await Product.countDocuments({
    stock: { $gt: 0, $lte: 5 },
    isDeleted: { $ne: true },
  });

  // Top selling products by order quantity aggregation
  const topSellingAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        soldCount: { $sum: "$orderItems.quantity" },
        revenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.priceAtPurchase"] } },
      },
    },
    { $sort: { soldCount: -1 } },
    { $limit: 10 },
  ]);

  await Product.populate(topSellingAgg, {
    path: "_id",
    select: "title category price images rating numReviews",
  });

  const topSellingProducts = topSellingAgg
    .filter((p) => p._id)
    .map((p) => ({
      _id: p._id._id,
      title: p._id.title,
      category: p._id.category,
      price: p._id.price,
      images: p._id.images,
      rating: p._id.rating,
      numReviews: p._id.numReviews,
      soldCount: p.soldCount,
      revenue: p.revenue,
    }));

  const inventoryAlerts = await Product.find({
    isDeleted: { $ne: true },
    $or: [{ stock: 0 }, { stock: { $gt: 0, $lte: 5 } }],
  })
    .select("title category stock price images status")
    .sort({ stock: 1 })
    .limit(10);

  return {
    totalProducts,
    activeProducts,
    outOfStock,
    lowStock,
    topSellingProducts,
    inventoryAlerts,
  };
};

const calculateReviewMetrics = async () => {
  const activeReviews = await Review.find({ isDeleted: { $ne: true } });
  const approvedReviews = activeReviews.filter((r) => r.status === "Approved");

  const total = activeReviews.length;
  const pending = activeReviews.filter((r) => r.status === "Pending").length;
  
  const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = approvedReviews.length > 0 ? Number((totalRating / approvedReviews.length).toFixed(1)) : 0;

  const starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  approvedReviews.forEach((r) => {
    const star = Math.floor(r.rating);
    if (starDistribution[star] !== undefined) {
      starDistribution[star] += 1;
    }
  });

  // Calculate percentages
  const distPercentages = {};
  for (let key = 1; key <= 5; key++) {
    const count = starDistribution[key];
    distPercentages[key] = approvedReviews.length > 0 ? Math.round((count / approvedReviews.length) * 100) : 0;
  }

  return {
    totalReviews: total,
    pendingReviews: pending,
    averageRating,
    starDistribution: distPercentages,
  };
};

const calculateCouponMetrics = async () => {
  const activeCoupons = await Coupon.countDocuments({ status: "Active", isDeleted: { $ne: true } });
  const expiredCoupons = await Coupon.countDocuments({ status: "Expired", isDeleted: { $ne: true } });
  const disabledCoupons = await Coupon.countDocuments({ status: "Disabled", isDeleted: { $ne: true } });

  const totalRedemptionsAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" }, coupon: { $ne: null } } },
    {
      $group: {
        _id: null,
        totalSavings: { $sum: "$discount" },
        redemptions: { $sum: 1 },
      },
    },
  ]);

  const kpis = totalRedemptionsAgg[0] || { totalSavings: 0, redemptions: 0 };

  const topCouponAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" }, coupon: { $ne: null } } },
    {
      $group: {
        _id: "$coupon",
        count: { $sum: 1 },
        savings: { $sum: "$discount" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  await Coupon.populate(topCouponAgg, {
    path: "_id",
    select: "code title discountType discountValue",
  });

  const topCoupon = topCouponAgg[0] && topCouponAgg[0]._id
    ? {
        code: topCouponAgg[0]._id.code,
        title: topCouponAgg[0]._id.title,
        redemptions: topCouponAgg[0].count,
        savings: topCouponAgg[0].savings,
      }
    : null;

  return {
    active: activeCoupons,
    expired: expiredCoupons,
    disabled: disabledCoupons,
    totalSavings: kpis.totalSavings,
    totalRedemptions: kpis.redemptions,
    topCoupon,
  };
};

module.exports = {
  calculateRevenue,
  calculateSalesTrend,
  calculateOrderMetrics,
  calculateUserMetrics,
  calculateProductMetrics,
  calculateReviewMetrics,
  calculateCouponMetrics,
};
