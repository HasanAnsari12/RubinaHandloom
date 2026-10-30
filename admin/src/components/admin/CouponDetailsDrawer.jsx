import React, { useState, useEffect } from "react";
import LoadingSkeleton from "./LoadingSkeleton";
import CouponBadge from "./CouponBadge";
import {
  isUnlimitedCoupon,
  calculateRemainingUses,
  calculateUsagePercentage,
  getUsageColor,
  getCouponCountdown,
  calculateExpiryDays,
  formatDiscount,
  formatCouponValidity,
} from "../../utils/couponUtils";
import "./CouponDetailsDrawer.css";

const CouponDetailsDrawer = ({ isOpen, onClose, coupon }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && coupon) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // 500ms skeleton load duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, coupon]);

  if (!isOpen) return null;

  const currentStatus = coupon?.status || "Draft";

  // Calculate usage parameters
  const isUnlimited = isUnlimitedCoupon(coupon?.usageLimit);
  const remaining = calculateRemainingUses(coupon?.usageLimit, coupon?.usedCount);
  const usagePercentage = calculateUsagePercentage(coupon?.usedCount, coupon?.usageLimit);
  const usageBarColor = getUsageColor(usagePercentage);

  // Expiry days and color mapping
  const daysLeft = calculateExpiryDays(coupon?.validUntil);
  const countdownText = getCouponCountdown(coupon?.validUntil, coupon?.validFrom);

  let expiryColorClass = "expiry-gray"; // expired
  if (daysLeft >= 30) {
    expiryColorClass = "expiry-green";
  } else if (daysLeft >= 7) {
    expiryColorClass = "expiry-orange";
  } else if (daysLeft >= 0) {
    expiryColorClass = "expiry-red";
  }

  // Visual Timeline progress states
  const getTimelineClass = (step) => {
    if (currentStatus === "Disabled") return "timeline-step muted";

    const steps = ["Draft", "Scheduled", "Active", "Expired"];
    const currentIdx = steps.indexOf(currentStatus);
    const stepIdx = steps.indexOf(step);

    if (currentIdx === stepIdx) return "timeline-step active";
    if (stepIdx < currentIdx) return "timeline-step completed";
    return "timeline-step pending";
  };

  const getScopeBadge = () => {
    const scope = coupon?.applicableOn || "All Products";
    if (scope === "Categories") return "📂 Categories";
    if (scope === "Products") return "🛍 Products";
    return "🌍 All Products";
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <aside className="coupon-details-drawer">
        <div className="drawer-header">
          <div className="drawer-header-left">
            <h3>Campaign Details</h3>
            <span className="drawer-coupon-code">{coupon?.code}</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close Drawer">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {loading || !coupon ? (
            <div className="drawer-loading-padding">
              <LoadingSkeleton type="line" count={12} />
            </div>
          ) : (
            <div className="drawer-content-flow">
              {/* Status Header */}
              <div className="drawer-section status-summary-pnl">
                <div className="status-grid-item">
                  <span>Moderation Status</span>
                  <CouponBadge status={currentStatus} />
                </div>
              </div>

              {/* Title & Description */}
              <div className="drawer-section campaign-overview-pnl">
                <h4 className="drawer-section-title">Overview</h4>
                <div className="campaign-overview-card">
                  <h5 className="campaign-title-label">{coupon.title}</h5>
                  <p className="campaign-desc-text">
                    {coupon.description || "No description provided for this coupon campaign."}
                  </p>
                </div>
              </div>

              {/* Coupon Scope & Eligibility Details */}
              <div className="drawer-section scope-eligibility-pnl">
                <h4 className="drawer-section-title">Campaign Scope & Eligibility</h4>
                <div className="scope-details-grid">
                  <div className="scope-meta-item">
                    <span className="scope-meta-label">Applicable On</span>
                    <span className="scope-meta-badge">{getScopeBadge()}</span>
                  </div>
                  <div className="scope-meta-item">
                    <span className="scope-meta-label">Stackable Coupon</span>
                    <span className="scope-meta-badge select-none">
                      {coupon.isStackable ? "Yes ✅" : "No ❌"}
                    </span>
                  </div>
                  <div className="scope-meta-item">
                    <span className="scope-meta-label">Eligibility Rules</span>
                    <span className="scope-meta-badge select-none">
                      All Customers 👥
                    </span>
                  </div>
                  <div className="scope-meta-item">
                    <span className="scope-meta-label">Per Customer Limit</span>
                    <span className="scope-meta-value-text">
                      {coupon.usagePerCustomer || 1} Uses
                    </span>
                  </div>
                </div>
              </div>

              {/* Discount details */}
              <div className="drawer-section discount-details-pnl">
                <h4 className="drawer-section-title">Discount Configuration</h4>
                <div className="discount-kpi-grid">
                  <div className="discount-kpi-box">
                    <span>Discount Type</span>
                    <strong>{coupon.discountType}</strong>
                  </div>
                  <div className="discount-kpi-box">
                    <span>Value</span>
                    <strong className="primary-color-text">
                      {formatDiscount(coupon.discountType, coupon.discountValue)}
                    </strong>
                  </div>
                  <div className="discount-kpi-box">
                    <span>Min Order Value</span>
                    <strong>₹{coupon.minimumOrderAmount}</strong>
                  </div>
                  <div className="discount-kpi-box">
                    <span>Max Discount Cap</span>
                    <strong>
                      {coupon.discountType === "Percentage" && coupon.maximumDiscountAmount
                        ? `₹${coupon.maximumDiscountAmount}`
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Usage & Redemptions Progress */}
              <div className="drawer-section usage-redemptions-pnl">
                <h4 className="drawer-section-title">Usage & Redemptions</h4>
                {isUnlimited ? (
                  <div className="unlimited-uses-row">
                    <span className="unlimited-badge-label">Unlimited Uses</span>
                    <span className="unlimited-uses-count">Redeemed {coupon.usedCount} times</span>
                  </div>
                ) : (
                  <div className="progress-fraction-bar-wrapper">
                    <div className="progress-header-row">
                      <span>Redeemed {coupon.usedCount} of {coupon.usageLimit} uses</span>
                      <strong style={{ color: usageBarColor }}>{usagePercentage}%</strong>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${usagePercentage}%`, backgroundColor: usageBarColor }}
                      ></div>
                    </div>
                    <div className="progress-footer-row">
                      <span>{remaining} Remaining</span>
                      {remaining < (coupon.usageLimit * 0.1) && remaining > 0 && (
                        <span className="nearly-exhausted-alert-tag">⚠️ Nearly Exhausted</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Expiry countdown and dates */}
              <div className="drawer-section validity-schedule-pnl">
                <h4 className="drawer-section-title">Validity & Countdown</h4>
                <div className="validity-countdown-card-flex">
                  <span className={`countdown-status-indicator-tag ${expiryColorClass}`}>
                    {countdownText}
                  </span>
                  <div className="validity-dates-summary">
                    <div className="date-block">
                      <span>Starts From</span>
                      <strong>
                        {new Date(coupon.validFrom).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </div>
                    <div className="date-block">
                      <span>Expires On</span>
                      <strong>
                        {new Date(coupon.validUntil).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Timeline Checklist */}
              <div className="drawer-section visual-timeline-pnl">
                <h4 className="drawer-section-title">Campaign Timeline</h4>
                <div className="timeline-steps-track">
                  <div className={getTimelineClass("Draft")}>
                    <div className="step-circle">1</div>
                    <span>Draft</span>
                  </div>
                  <div className="step-line-bar"></div>
                  <div className={getTimelineClass("Scheduled")}>
                    <div className="step-circle">2</div>
                    <span>Scheduled</span>
                  </div>
                  <div className="step-line-bar"></div>
                  <div className={getTimelineClass("Active")}>
                    <div className="step-circle">3</div>
                    <span>Active</span>
                  </div>
                  <div className="step-line-bar"></div>
                  <div className={getTimelineClass("Expired")}>
                    <div className="step-circle">4</div>
                    <span>Expired</span>
                  </div>
                </div>
              </div>

              {/* Usage History Placeholders */}
              <div className="drawer-section usage-history-pnl">
                <h4 className="drawer-section-title">Usage History</h4>
                <div className="usage-history-placeholder-card">
                  <h5>📋 Claims History</h5>
                  <div className="usage-history-coming-soon-banner">
                    <span>Coming Soon</span>
                    <p>Transaction records containing Order IDs, Customer names, and claim discounts will log here.</p>
                  </div>
                </div>
              </div>

              {/* Analytics Placeholders */}
              <div className="drawer-section analytics-placeholder-pnl">
                <h4 className="drawer-section-title">Redemptions Analytics</h4>
                <div className="analytics-mini-widgets-grid">
                  <div className="analytics-mini-box">
                    <span>Revenue Generated</span>
                    <strong>—</strong>
                  </div>
                  <div className="analytics-mini-box">
                    <span>Discount Value</span>
                    <strong>—</strong>
                  </div>
                  <div className="analytics-mini-box">
                    <span>Conversion Rate</span>
                    <strong>—</strong>
                  </div>
                </div>
              </div>

              {/* Audit logs */}
              <div className="drawer-section audit-dates-detail">
                <div className="date-row">
                  <span>Record Created</span>
                  <span>
                    {new Date(coupon.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="date-row">
                  <span>Last Modified</span>
                  <span>
                    {new Date(coupon.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Database ObjectID raw */}
              <div className="drawer-footer-raw-info">
                <span>Database ObjectID:</span>
                <code>{coupon._id}</code>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default CouponDetailsDrawer;
