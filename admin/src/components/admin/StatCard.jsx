import React from "react";
import "./StatCard.css";

const StatCard = ({ title, value, icon, trend, trendValue, subtitle }) => {
  const isPositive = trend === "positive";
  const isNegative = trend === "negative";

  return (
    <div className="luxury-stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon-wrapper">{icon}</div>
      </div>
      
      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
        {(trendValue || subtitle) && (
          <div className="stat-card-footer">
            {trendValue && (
              <span className={`stat-card-trend-badge ${trend}`}>
                {isPositive ? "▲" : isNegative ? "▼" : "•"} {trendValue}
              </span>
            )}
            {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
