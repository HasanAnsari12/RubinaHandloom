const Order = require("../models/Order");
const {
  calculateRevenue,
  calculateSalesTrend,
  calculateOrderMetrics,
  calculateUserMetrics,
  calculateProductMetrics,
  calculateReviewMetrics,
  calculateCouponMetrics,
} = require("../services/analyticsService");

// @desc    Retrieve all consolidated business metrics for Admin Dashboard
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardData = async (req, res) => {
  try {
    const { filterRange = "30days" } = req.query;
    
    // 1. Calculate date boundaries based on filter range selection
    let startDate = null;
    const endDate = new Date();
    
    const now = new Date();
    if (filterRange === "today") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (filterRange === "7days") {
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
    } else if (filterRange === "30days") {
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
    } else if (filterRange === "90days") {
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 90);
    } else if (filterRange === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // 2. Fetch pre-calculated data aggregates
    const rangeRevenueStats = await calculateRevenue(startDate, endDate);
    const lifetimeRevenueStats = await calculateRevenue(null, null);

    // Sales trends data by days count
    let trendDays = 30;
    if (filterRange === "today") trendDays = 1;
    else if (filterRange === "7days") trendDays = 7;
    else if (filterRange === "90days") trendDays = 90;
    else if (filterRange === "year") trendDays = 365;
    
    const salesTrend = await calculateSalesTrend(trendDays);
    const orderStatusDistribution = await calculateOrderMetrics();
    const userMetrics = await calculateUserMetrics();
    const productMetrics = await calculateProductMetrics();
    const reviewMetrics = await calculateReviewMetrics();
    const couponMetrics = await calculateCouponMetrics();

    // Fetch latest 10 orders populated with user names and emails
    const recentOrders = await Order.find()
      .populate("user", "name email profileImage")
      .sort({ createdAt: -1 })
      .limit(10);

    // Formulate a compact executive overview KPIs set
    const overview = {
      revenue: rangeRevenueStats.revenue,
      revenueGrowthPercentage: 12.5, // placeholder comparison stats
      lifetimeRevenue: lifetimeRevenueStats.revenue,
      ordersCount: rangeRevenueStats.count,
      averageOrderValue: rangeRevenueStats.aov,
      discountGiven: rangeRevenueStats.discounts,
      usersCount: userMetrics.totalUsers,
      newUsersCount: userMetrics.newUsers,
      productsCount: productMetrics.totalProducts,
      outOfStockCount: productMetrics.outOfStock,
      lowStockCount: productMetrics.lowStock,
      reviewsCount: reviewMetrics.totalReviews,
      pendingReviewsCount: reviewMetrics.pendingReviews,
      averageRating: reviewMetrics.averageRating,
      activeCouponsCount: couponMetrics.active,
      couponRedemptionsCount: couponMetrics.totalRedemptions,
    };

    res.status(200).json({
      success: true,
      overview,
      salesTrend,
      orderStatusDistribution,
      productMetrics,
      userMetrics,
      reviewMetrics,
      couponMetrics,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardData,
};
