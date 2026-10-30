import React from "react";
import StatCard from "./StatCard";
import "./CouponStats.css";

const CouponStats = ({
  total = 0,
  draft = 0,
  scheduled = 0,
  active = 0,
  disabled = 0,
  expired = 0,
  totalRedemptions = 0,
  averageDiscountText = "—",
  averageRedemptionRateText = "—",
  highestUsedCouponText = "—",
}) => {
  return (
    <div className="coupon-stats-deck-container">
      {/* Metrics Cards Grid */}
      <div className="coupon-stats-grid-five">
        <StatCard title="Total Coupons" value={total} icon="🎟️" subtitle="offers catalog" />
        <StatCard title="Active Campaigns" value={active} icon="🟢" trend="positive" subtitle="live for clients" />
        <StatCard title="Scheduled" value={scheduled} icon="📅" subtitle="upcoming events" />
        <StatCard title="Total Redemptions" value={totalRedemptions} icon="🛍️" trend="positive" subtitle="checkout applications" />
        <StatCard title="Average Discount" value={averageDiscountText} icon="🪙" subtitle="across all types" />
      </div>

      <div className="coupon-stats-grid-row-secondary">
        {/* Left: Cased Status Totals */}
        <div className="stats-mini-summary-card">
          <h4 className="mini-card-title">Campaign Distribution</h4>
          <div className="mini-summary-stats-flex">
            <div className="mini-stat-item">
              <span className="mini-stat-label">Draft</span>
              <strong className="mini-stat-value">{draft}</strong>
            </div>
            <div className="mini-stat-item">
              <span className="mini-stat-label">Disabled</span>
              <strong className="mini-stat-value danger-text">{disabled}</strong>
            </div>
            <div className="mini-stat-item">
              <span className="mini-stat-label">Expired</span>
              <strong className="mini-stat-value warning-text">{expired}</strong>
            </div>
          </div>
        </div>

        {/* Right: Average Redemption Rate & Top Performer */}
        <div className="stats-performance-kpi-card">
          <div className="performance-kpi-column">
            <span className="kpi-label">Average Redemption Rate</span>
            <strong className="kpi-value">{averageRedemptionRateText}</strong>
            <span className="kpi-subtext">excludes unlimited usage</span>
          </div>
          <div className="performance-kpi-divider"></div>
          <div className="performance-kpi-column">
            <span className="kpi-label">Highest Used Campaign</span>
            <strong className="kpi-value code-font">{highestUsedCouponText}</strong>
            <span className="kpi-subtext">most checkout claims</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponStats;
