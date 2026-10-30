const Review = require("../models/Review");

const getReviewsReport = async (startDate, endDate, subFilters = {}) => {
  const query = { isDeleted: { $ne: true } };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (subFilters.status) {
    query.status = subFilters.status;
  }
  if (subFilters.rating) {
    query.rating = Number(subFilters.rating);
  }

  const reviews = await Review.find(query)
    .populate("user", "name email")
    .populate("product", "title")
    .sort({ createdAt: -1 });

  const reportRows = reviews.map((r) => ({
    reviewId: r._id,
    productTitle: r.product?.title || "Deleted Product",
    customerName: r.user?.name || "Anonymous",
    customerEmail: r.user?.email || "N/A",
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    date: r.createdAt,
  }));

  const summary = reportRows.reduce(
    (acc, cur) => {
      acc.totalReviews += 1;
      acc.ratingSum += cur.rating;
      if (cur.status === "Approved") {
        acc.approvedCount += 1;
      } else if (cur.status === "Pending") {
        acc.pendingCount += 1;
      }
      return acc;
    },
    { totalReviews: 0, ratingSum: 0, approvedCount: 0, pendingCount: 0 }
  );

  summary.averageRating = summary.totalReviews > 0 ? Number((summary.ratingSum / summary.totalReviews).toFixed(1)) : 0;

  return {
    rows: reportRows,
    summary,
  };
};

module.exports = {
  getReviewsReport,
};
