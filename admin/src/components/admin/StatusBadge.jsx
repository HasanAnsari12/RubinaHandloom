import React from "react";
import "./StatusBadge.css";

const StatusBadge = ({ status, className = "" }) => {
  const normalized = String(status || "").toLowerCase().trim().replace(/[\s_]+/g, "-");

  const getLabel = () => {
    switch (normalized) {
      case "active":
        return "Active";
      case "low-stock":
        return "Low Stock";
      case "out-of-stock":
        return "Out of Stock";
      case "draft":
        return "Draft";
      case "paid":
        return "Paid";
      case "unpaid":
        return "Unpaid";
      case "pending":
        return "Pending";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status || "Unknown";
    }
  };

  return (
    <span className={`status-badge-generic ${normalized} ${className}`}>
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
