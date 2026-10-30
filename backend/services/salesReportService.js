const Order = require("../models/Order");

const getSalesReport = async (startDate, endDate, groupBy = "Day") => {
  const match = { orderStatus: { $ne: "Cancelled" } };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  // 1. Determine group date format pattern
  let formatString = "%Y-%m-%d"; // Day
  if (groupBy === "Week") formatString = "%Y-W%V";
  else if (groupBy === "Month") formatString = "%Y-%m";
  else if (groupBy === "Year") formatString = "%Y";

  let groupField;
  if (groupBy === "Quarter") {
    groupField = {
      $concat: [
        { $dateToString: { format: "%Y-", date: "$createdAt" } },
        "Q",
        { $toString: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } } },
      ],
    };
  } else {
    groupField = { $dateToString: { format: formatString, date: "$createdAt" } };
  }

  const salesData = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupField,
        ordersCount: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
        discount: { $sum: "$discount" },
        shippingCharge: { $sum: "$shippingCharge" },
        // Calculate mock refunds for orders that are Refunded paymentStatus
        refundsCount: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "Refunded"] }, 1, 0] },
        },
        refundsAmount: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "Refunded"] }, "$totalAmount", 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Map into detailed report rows
  const reportRows = salesData.map((row) => {
    const aov = row.ordersCount > 0 ? Number((row.revenue / row.ordersCount).toFixed(2)) : 0;
    const estimatedTax = Number((row.revenue * 0.05).toFixed(2)); // mock GST 5%
    return {
      dateGroup: row._id,
      ordersCount: row.ordersCount,
      revenue: row.revenue,
      discount: row.discount,
      shippingCharge: row.shippingCharge,
      tax: estimatedTax,
      refundsCount: row.refundsCount,
      refundsAmount: row.refundsAmount,
      aov,
    };
  });

  // Calculate summary totals
  const summary = reportRows.reduce(
    (acc, row) => {
      acc.totalRevenue += row.revenue;
      acc.totalOrders += row.ordersCount;
      acc.totalDiscounts += row.discount;
      acc.totalShipping += row.shippingCharge;
      acc.totalTax += row.tax;
      acc.totalRefunds += row.refundsAmount;
      return acc;
    },
    { totalRevenue: 0, totalOrders: 0, totalDiscounts: 0, totalShipping: 0, totalTax: 0, totalRefunds: 0 }
  );

  summary.averageOrderValue = summary.totalOrders > 0 ? Number((summary.totalRevenue / summary.totalOrders).toFixed(2)) : 0;

  return {
    rows: reportRows,
    summary,
  };
};

module.exports = {
  getSalesReport,
};
