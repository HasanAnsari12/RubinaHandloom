const Order = require("../models/Order");
const User = require("../models/User");

const getCustomersReport = async (startDate, endDate) => {
  const match = { orderStatus: { $ne: "Cancelled" } };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  // 1. Query order collections to find total spending and claims per user
  const spendsAgg = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$user",
        ordersCount: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        couponsUsed: {
          $sum: { $cond: [{ $ne: ["$coupon", null] }, 1, 0] },
        },
      },
    },
  ]);

  const spendsMap = new Map(spendsAgg.map((s) => [s._id ? s._id.toString() : "deleted", s]));

  // 2. Query all customers (role user)
  const users = await User.find({ role: "user", isDeleted: { $ne: true } })
    .select("name email profileImage phone createdAt")
    .sort({ createdAt: -1 });

  const reportRows = users.map((u) => {
    const stats = spendsMap.get(u._id.toString()) || { ordersCount: 0, totalSpent: 0, couponsUsed: 0 };
    return {
      customerId: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      profileImage: u.profileImage,
      ordersCount: stats.ordersCount,
      totalSpent: stats.totalSpent,
      couponsUsed: stats.couponsUsed,
      joinedDate: u.createdAt,
    };
  });

  // Calculate summaries
  const summary = reportRows.reduce(
    (acc, cur) => {
      acc.totalCustomers += 1;
      acc.totalSpentAmount += cur.totalSpent;
      acc.totalOrdersCount += cur.ordersCount;
      if (cur.ordersCount > 1) {
        acc.returningCustomers += 1;
      }
      return acc;
    },
    { totalCustomers: 0, totalSpentAmount: 0, totalOrdersCount: 0, returningCustomers: 0 }
  );

  summary.averageSpend = summary.totalCustomers > 0 ? Number((summary.totalSpentAmount / summary.totalCustomers).toFixed(2)) : 0;

  return {
    rows: reportRows,
    summary,
  };
};

module.exports = {
  getCustomersReport,
};
