const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

const getCouponsReport = async (startDate, endDate, subFilters = {}) => {
  const match = { orderStatus: { $ne: "Cancelled" }, coupon: { $ne: null } };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  // 1. Group orders by coupon to count redemptions and discount savings
  const claimsAgg = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$coupon",
        redemptions: { $sum: 1 },
        savings: { $sum: "$discount" },
      },
    },
  ]);

  const claimsMap = new Map(claimsAgg.map((c) => [c._id.toString(), c]));

  // 2. Query coupons list
  const coupQuery = { isDeleted: { $ne: true } };
  if (subFilters.status) {
    coupQuery.status = subFilters.status;
  }

  const coupons = await Coupon.find(coupQuery);

  const reportRows = coupons.map((c) => {
    const claims = claimsMap.get(c._id.toString()) || { redemptions: 0, savings: 0 };
    return {
      couponId: c._id,
      code: c.code,
      title: c.title,
      discountType: c.discountType,
      discountValue: c.discountValue,
      status: c.status,
      usedCount: claims.redemptions,
      totalSavings: claims.savings,
      usageLimit: c.usageLimit,
      validUntil: c.validUntil,
    };
  });

  const summary = reportRows.reduce(
    (acc, cur) => {
      acc.totalCoupons += 1;
      acc.totalClaimsCount += cur.usedCount;
      acc.totalSavingsAmount += cur.totalSavings;
      if (cur.status === "Active") {
        acc.activeCount += 1;
      }
      return acc;
    },
    { totalCoupons: 0, totalClaimsCount: 0, totalSavingsAmount: 0, activeCount: 0 }
  );

  return {
    rows: reportRows,
    summary,
  };
};

module.exports = {
  getCouponsReport,
};
