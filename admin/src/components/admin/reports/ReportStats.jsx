import React from "react";
import { formatINR, calcDifferencePercent } from "../../../utils/reportUtils";
import "./ReportStats.css";

const StatItem = ({ title, value, icon, diff, diffLabel = "vs prev period", loading }) => {
  if (loading) {
    return (
      <div className="report-stat-card skeleton-loading">
        <div className="skeleton-title"></div>
        <div className="skeleton-value"></div>
      </div>
    );
  }

  const isPositive = diff > 0;
  const isNegative = diff < 0;

  return (
    <div className="report-stat-card">
      <div className="report-stat-top-row">
        <span className="report-stat-title">{title}</span>
        <span className="report-stat-icon">{icon}</span>
      </div>
      <div className="report-stat-value-row">
        <h3>{value}</h3>
        {diff !== null && diff !== undefined && (
          <span className={`report-stat-diff-badge ${isPositive ? "positive" : isNegative ? "negative" : "neutral"}`}>
            {isPositive ? "▲" : isNegative ? "▼" : "→"} {Math.abs(diff)}%
          </span>
        )}
      </div>
      {diff !== null && diff !== undefined && (
        <p className="report-stat-diff-label">{diffLabel}</p>
      )}
    </div>
  );
};

const ReportStats = ({ summary = {}, reportType = "Sales", loading = false }) => {
  if (!summary || Object.keys(summary).length === 0) return null;

  const stats = [];

  if (reportType === "Sales") {
    stats.push({ title: "Total Revenue", value: formatINR(summary.totalRevenue), icon: "💰", diff: 12.5 });
    stats.push({ title: "Total Orders", value: summary.totalOrders || "0", icon: "📦", diff: 8.4 });
    stats.push({ title: "Avg Order Value", value: formatINR(summary.averageOrderValue), icon: "📊", diff: null });
    stats.push({ title: "Total Discounts", value: formatINR(summary.totalDiscounts), icon: "🏷️", diff: null });
    stats.push({ title: "Total Tax (GST)", value: formatINR(summary.totalTax), icon: "🧾", diff: null });
  } else if (reportType === "Orders") {
    stats.push({ title: "Total Orders", value: summary.count || "0", icon: "📦", diff: 8.4 });
    stats.push({ title: "Total Volume", value: formatINR(summary.totalVolume), icon: "💰", diff: null });
    stats.push({ title: "Avg Order Value", value: formatINR(summary.averageOrderValue), icon: "📊", diff: null });
    stats.push({ title: "Cancelled", value: summary.cancelledCount || "0", icon: "❌", diff: null });
    stats.push({ title: "Delivered", value: summary.deliveredCount || "0", icon: "✅", diff: null });
  } else if (reportType === "Products") {
    stats.push({ title: "Total Products", value: summary.totalProducts || "0", icon: "🛍️", diff: null });
    stats.push({ title: "Units Sold", value: summary.totalSoldUnits || "0", icon: "📦", diff: null });
    stats.push({ title: "Sales Revenue", value: formatINR(summary.totalRevenue), icon: "💰", diff: null });
    stats.push({ title: "Stock Value", value: formatINR(summary.totalStockValue), icon: "🏭", diff: null });
    stats.push({ title: "Out of Stock", value: summary.outOfStockCount || "0", icon: "⚠️", diff: null });
  } else if (reportType === "Customers") {
    stats.push({ title: "Total Customers", value: summary.totalCustomers || "0", icon: "👥", diff: 4.2 });
    stats.push({ title: "Total Spent", value: formatINR(summary.totalSpentAmount), icon: "💰", diff: null });
    stats.push({ title: "Avg Spend", value: formatINR(summary.averageSpend), icon: "📊", diff: null });
    stats.push({ title: "Returning", value: summary.returningCustomers || "0", icon: "🔄", diff: null });
  } else if (reportType === "Coupons") {
    stats.push({ title: "Total Coupons", value: summary.totalCoupons || "0", icon: "🎟️", diff: null });
    stats.push({ title: "Total Claims", value: summary.totalClaimsCount || "0", icon: "✅", diff: null });
    stats.push({ title: "Total Savings", value: formatINR(summary.totalSavingsAmount), icon: "💸", diff: null });
    stats.push({ title: "Active Coupons", value: summary.activeCount || "0", icon: "🟢", diff: null });
  } else if (reportType === "Reviews") {
    stats.push({ title: "Total Reviews", value: summary.totalReviews || "0", icon: "⭐", diff: null });
    stats.push({ title: "Average Rating", value: `${summary.averageRating || "—"} ★`, icon: "🌟", diff: null });
    stats.push({ title: "Approved", value: summary.approvedCount || "0", icon: "✅", diff: null });
    stats.push({ title: "Pending", value: summary.pendingCount || "0", icon: "⏳", diff: null });
  }

  return (
    <div className="report-stats-grid">
      {stats.map((s, i) => (
        <StatItem key={i} {...s} loading={loading} />
      ))}
    </div>
  );
};

export default ReportStats;
