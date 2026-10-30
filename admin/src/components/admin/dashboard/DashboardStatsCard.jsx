import React from "react";
import "./DashboardStatsCard.css";

const DashboardStatsCard = ({
  title = "Metric",
  value = "0",
  icon = "📈",
  trend = "", // "positive" | "negative" | "neutral"
  trendValue = "",
  subtitle = "",
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="dashboard-stats-card skeleton-loading">
        <div className="skeleton-title"></div>
        <div className="skeleton-value"></div>
        <div className="skeleton-subtitle"></div>
      </div>
    );
  }

  const isPositive = trend === "positive";
  const isNegative = trend === "negative";

  return (
    <div className="dashboard-stats-card">
      <div className="stats-card-top-row">
        <span className="stats-card-title">{title}</span>
        <div className="stats-card-icon-circle">{icon}</div>
      </div>

      <div className="stats-card-value-display">
        <h3>{value}</h3>
        {trendValue && (
          <span className={`stats-card-trend-badge ${trend}`}>
            {isPositive && "↑"}
            {isNegative && "↓"}
            {trendValue}
          </span>
        )}
      </div>

      {subtitle && <p className="stats-card-subtitle">{subtitle}</p>}
    </div>
  );
};

export default DashboardStatsCard;
