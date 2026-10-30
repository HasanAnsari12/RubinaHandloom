import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import CouponBadge from "./CouponBadge";
import {
  isUnlimitedCoupon,
  calculateRemainingUses,
  calculateUsagePercentage,
  getUsageColor,
  calculateExpiryDays,
  formatDiscount,
  formatCouponValidity,
  isNearlyExhausted,
} from "../../utils/couponUtils";
import "./CouponRow.css";

const CouponRow = ({
  coupon,
  isSelected,
  onSelectChange,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onDuplicate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    toast.success(`Coupon code copied. ${coupon.code}`);
  };

  const handleActionMenuClick = (actionName) => {
    setIsMenuOpen(false);
    if (actionName === "Duplicate Coupon") {
      onDuplicate(coupon);
    } else {
      alert(`Reserved Action Placeholder: [${actionName}] triggered for coupon code ${coupon.code}`);
    }
  };

  // Calc usage percentages
  const isUnlimited = isUnlimitedCoupon(coupon.usageLimit);
  const usagePercentage = calculateUsagePercentage(coupon.usedCount, coupon.usageLimit);
  const usageColor = getUsageColor(usagePercentage);
  const nearlyExhausted = isNearlyExhausted(coupon.usedCount, coupon.usageLimit);

  // Expiry days indicators
  const daysLeft = calculateExpiryDays(coupon.validUntil);
  const isExpired = daysLeft < 0;

  const renderExpiryBadge = () => {
    if (isExpired) {
      return <span className="expiry-indicator-dot expired">🔴 Expired</span>;
    }
    return <span className="expiry-indicator-dot active">🟢 {daysLeft} Days Left</span>;
  };

  const currentStatus = coupon.status || "Draft";

  return (
    <>
      <td className="checkbox-column">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectChange(coupon._id, e.target.checked)}
        />
      </td>
      <td>
        <div className="coupon-code-row-flex">
          <span className="coupon-code-span-cell" onClick={() => onView(coupon)}>
            {coupon.code}
          </span>
          <button
            className="copy-clipboard-mini-btn"
            onClick={handleCopyCode}
            title="Copy coupon code"
          >
            📋
          </button>
        </div>
      </td>
      <td>
        <div className="coupon-title-cell-flex">
          <strong className="coupon-title-strong" onClick={() => onView(coupon)}>
            {coupon.title}
          </strong>
          {coupon.description && (
            <span className="coupon-desc-cell-subtext">{coupon.description}</span>
          )}
        </div>
      </td>
      <td>
        <span className="discount-badge-cell">
          {formatDiscount(coupon.discountType, coupon.discountValue)}
        </span>
      </td>
      <td>
        <span className="min-order-cell-text">₹{coupon.minimumOrderAmount}</span>
      </td>
      <td>
        {isUnlimited ? (
          <span className="unlimited-uses-row-badge">Unlimited</span>
        ) : (
          <div className="row-usage-kpi-block">
            <div className="usage-row-text">
              <span>{coupon.usedCount} / {coupon.usageLimit}</span>
              {nearlyExhausted && <span className="warning-ex-lbl">Nearly Full</span>}
            </div>
            <div className="row-usage-bar-track">
              <div
                className="row-usage-bar-fill"
                style={{ width: `${usagePercentage}%`, backgroundColor: usageColor }}
              ></div>
            </div>
          </div>
        )}
      </td>
      <td>
        <CouponBadge status={currentStatus} />
      </td>
      <td>
        <div className="validity-row-details">
          <span>{formatCouponValidity(coupon.validFrom, coupon.validUntil)}</span>
          <div className="validity-indicator-tag">{renderExpiryBadge()}</div>
        </div>
      </td>
      <td className="coupon-row-date-cell">
        {coupon.createdAt
          ? new Date(coupon.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </td>
      <td className="coupon-row-actions-cell text-right">
        <div className="coupon-row-actions-flex">
          {/* View Drawer trigger */}
          <button className="row-action-btn view" onClick={() => onView(coupon)}>
            View
          </button>

          {/* Edit Modal trigger */}
          <button className="row-action-btn edit" onClick={() => onEdit(coupon)}>
            Edit
          </button>

          {/* Toggle manual disable/enable */}
          {currentStatus === "Disabled" ? (
            <button
              className="row-action-btn toggle-status-btn enable"
              onClick={() => onToggleStatus(coupon._id, "Active")}
            >
              Enable
            </button>
          ) : (
            <button
              className="row-action-btn toggle-status-btn disable"
              onClick={() => onToggleStatus(coupon._id, "Disabled")}
            >
              Disable
            </button>
          )}

          {/* Delete triggers */}
          <button className="row-action-btn delete" onClick={() => onDelete(coupon)}>
            Delete
          </button>

          {/* Dropdown Menu (Reserved features placeholders) */}
          <div className="reserved-menu-container" ref={menuRef}>
            <button className="reserved-menu-trigger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ⋮
            </button>
            {isMenuOpen && (
              <div className="reserved-action-dropdown">
                <button onClick={() => handleActionMenuClick("Duplicate Coupon")}>
                  👥 Duplicate Coupon
                </button>
                <button onClick={() => handleActionMenuClick("Export Coupon")}>
                  📥 Export Coupon
                </button>
                <button onClick={() => handleActionMenuClick("Export CSV")}>
                  📄 Export CSV
                </button>
                <button onClick={() => handleActionMenuClick("Coupon Analytics")}>
                  📈 Coupon Analytics
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </>
  );
};

export default CouponRow;
