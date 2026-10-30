const Order = require("../models/Order");
const Product = require("../models/Product");

const getProductsReport = async (startDate, endDate, subFilters = {}) => {
  const match = { orderStatus: { $ne: "Cancelled" } };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  // 1. Query orderItems aggregation to find sold count and revenue
  const salesAgg = await Order.aggregate([
    { $match: match },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        soldCount: { $sum: "$orderItems.quantity" },
        revenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.priceAtPurchase"] } },
      },
    },
  ]);

  const salesMap = new Map(salesAgg.map((s) => [s._id.toString(), s]));

  // 2. Query all products to construct inventory + sales report rows
  const prodQuery = { isDeleted: { $ne: true } };
  if (subFilters.category) {
    prodQuery.category = subFilters.category;
  }
  if (subFilters.status) {
    prodQuery.status = subFilters.status;
  }

  const products = await Product.find(prodQuery);

  const reportRows = products.map((p) => {
    const saleInfo = salesMap.get(p._id.toString()) || { soldCount: 0, revenue: 0 };
    return {
      productId: p._id,
      title: p.title,
      category: p.category,
      price: p.price,
      stock: p.stock,
      status: p.status,
      unitsSold: saleInfo.soldCount,
      revenue: saleInfo.revenue,
      rating: p.rating,
      numReviews: p.numReviews,
    };
  });

  // Calculate summaries
  const summary = reportRows.reduce(
    (acc, cur) => {
      acc.totalProducts += 1;
      acc.totalSoldUnits += cur.unitsSold;
      acc.totalRevenue += cur.revenue;
      acc.totalStockValue += cur.stock * cur.price;
      if (cur.stock === 0) {
        acc.outOfStockCount += 1;
      }
      return acc;
    },
    { totalProducts: 0, totalSoldUnits: 0, totalRevenue: 0, totalStockValue: 0, outOfStockCount: 0 }
  );

  return {
    rows: reportRows,
    summary,
  };
};

module.exports = {
  getProductsReport,
};
