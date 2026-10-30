import React from "react";
import "./CouponBadge.css";

const CouponBadge = ({ status = "Draft" }) => {
  const isManual = status === "Draft" || status === "Disabled";
  const statusLower = status.toLowerCase();

  return (
    <div className={`coupon-badge-container badge-color-${statusLower}`}>
      <span className="coupon-status-text">{status}</span>
      <span className="coupon-source-label">{isManual ? "Manual" : "Auto"}</span>
    </div>
  );
};

export default CouponBadge;
