const Order = require("../models/Order");

const getOrdersReport = async (startDate, endDate, subFilters = {}) => {
  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Map sub filters like orderStatus, paymentMethod
  if (subFilters.orderStatus) {
    query.orderStatus = subFilters.orderStatus;
  }
  if (subFilters.paymentMethod) {
    query.paymentMethod = subFilters.paymentMethod;
  }

  const orders = await Order.find(query)
    .populate("user", "name email profileImage")
    .sort({ createdAt: -1 });

  const reportRows = orders.map((o) => ({
    orderId: o._id,
    customerName: o.user?.name || "Deleted User",
    customerEmail: o.user?.email || "N/A",
    subtotal: o.subtotal,
    discount: o.discount,
    shippingCharge: o.shippingCharge,
    totalAmount: o.totalAmount,
    orderStatus: o.orderStatus,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    date: o.createdAt,
  }));

  const summary = reportRows.reduce(
    (acc, cur) => {
      acc.totalVolume += cur.totalAmount;
      acc.count += 1;
      acc.totalDiscounts += cur.discount;
      if (cur.orderStatus === "Cancelled") {
        acc.cancelledCount += 1;
      } else if (cur.orderStatus === "Delivered") {
        acc.deliveredCount += 1;
      }
      return acc;
    },
    { totalVolume: 0, count: 0, totalDiscounts: 0, cancelledCount: 0, deliveredCount: 0 }
  );

  summary.averageOrderValue = summary.count > 0 ? Number((summary.totalVolume / summary.count).toFixed(2)) : 0;

  return {
    rows: reportRows,
    summary,
  };
};

module.exports = {
  getOrdersReport,
};
