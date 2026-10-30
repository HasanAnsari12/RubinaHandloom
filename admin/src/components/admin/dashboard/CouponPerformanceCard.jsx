import React from "react";
import "./CouponPerformanceCard.css";

const CouponPerformanceCard = ({ topCoupon = null, loading = false }) => {
  if (loading) {
    return (
      <div className="coupon-perf-skeleton animate-pulse">
        <div className="skeleton-perf-line"></div>
        <div className="skeleton-perf-line"></div>
      </div>
    );
  }

  if (!topCoupon) {
    return (
      <div className="coupon-performance-empty select-none">
        <span>🎟️</span>
        <p>No active coupon redemptions logged</p>
      </div>
    );
  }

  return (
    <div className="coupon-performance-dashboard-card">
      <div className="perf-code-header-row">
        <span className="perf-campaign-badge">Top Campaign</span>
        <strong className="perf-code-text">{topCoupon.code}</strong>
      </div>

      <div className="perf-campaign-title-label">
        <h5>{topCoupon.title}</h5>
      </div>

      <div className="perf-kpi-deck-row">
        <div className="perf-kpi-block-item">
          <span>Claims count</span>
          <strong>{topCoupon.redemptions}</strong>
        </div>
        <div className="perf-kpi-block-item">
          <span>Total Savings</span>
          <strong className="savings-green-value">
            ₹{Number(topCoupon.savings || 0).toLocaleString("en-IN")}
          </strong>
        </div>
        <div className="perf-kpi-block-item">
          <span>Conversion rate</span>
          <strong>—</strong>
        </div>
      </div>
    </div>
  );
};

export default CouponPerformanceCard;
