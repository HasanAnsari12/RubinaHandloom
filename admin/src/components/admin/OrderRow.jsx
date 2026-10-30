import React, { useState, useRef, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import "./OrderRow.css";

const ORDER_STATUS_FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

const OrderRow = ({
  order,
  isSelected,
  onSelectChange,
  onView,
  onStatusChange,
  updating = false,
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

  // Validation transition rules for Order Status dropdown selection
  const getAvailableOrderStatuses = (currentStatus) => {
    if (currentStatus === "Cancelled") return ["Cancelled"];
    if (currentStatus === "Delivered") return ["Delivered"];

    const currentIdx = ORDER_STATUS_FLOW.indexOf(currentStatus);
    if (currentIdx === -1) return ORDER_STATUS_FLOW;

    // Can only move forward, plus allow Cancelled from any active step
    const forwardSteps = ORDER_STATUS_FLOW.slice(currentIdx);
    return [...forwardSteps, "Cancelled"];
  };

  const handleActionMenuClick = (actionName) => {
    setIsMenuOpen(false);
    alert(`Reserved Action Placeholder: [${actionName}] triggered for order ID #${order._id}`);
  };

  const handleStatusSelectChange = async (newVal) => {
    await onStatusChange(order._id, { orderStatus: newVal });
  };

  const formattedId = `#RH-${String(order._id).slice(-6).toUpperCase()}`;

  // Build elegant product summary text
  const getProductsSummaryText = () => {
    const items = order.orderItems || [];
    if (items.length === 0) return "No products";
    const firstProductTitle = items[0].product?.title || "Saree Item";
    if (items.length === 1) return firstProductTitle;
    return `${firstProductTitle} (+${items.length - 1} items)`;
  };

  return (
    <>
      <td className="checkbox-column">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectChange(order._id, e.target.checked)}
        />
      </td>
      <td>
        <span className="order-id-cell-text" onClick={() => onView(order)}>
          {formattedId}
        </span>
      </td>
      <td>
        <div className="order-customer-cell">
          <span className="order-customer-name">{order.user?.name || "Customer Profile"}</span>
          <span className="order-customer-email">{order.user?.email || "N/A"}</span>
        </div>
      </td>
      <td className="order-products-summary-cell">{getProductsSummaryText()}</td>
      <td className="order-amount-cell-text">
        ₹{(order.totalAmount || order.totalPrice || 0).toLocaleString("en-IN")}
      </td>
      <td>
        <StatusBadge status={order.paymentStatus} />
      </td>
      <td>
        <StatusBadge status={order.orderStatus} />
      </td>
      <td className="order-date-cell-text">
        {order.createdAt
          ? new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A"}
      </td>
      <td className="order-actions-cell text-right">
        <div className="order-row-actions-flex">
          <button className="row-action-btn view" onClick={() => onView(order)}>
            View
          </button>
          
          <select
            value={order.orderStatus || "Pending"}
            disabled={updating || order.orderStatus === "Cancelled" || order.orderStatus === "Delivered"}
            onChange={(e) => handleStatusSelectChange(e.target.value)}
            className="row-status-dropdown-select"
          >
            {getAvailableOrderStatuses(order.orderStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Action Menu (Reserved options drop-down dropdown list) */}
          <div className="reserved-menu-container" ref={menuRef}>
            <button className="reserved-menu-trigger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ⋮
            </button>
            {isMenuOpen && (
              <div className="reserved-action-dropdown">
                <button onClick={() => handleActionMenuClick("Print Invoice")}>
                  🖨️ Print Invoice
                </button>
                <button onClick={() => handleActionMenuClick("Download PDF Invoice")}>
                  📥 Download Invoice
                </button>
                <button onClick={() => handleActionMenuClick("Refund Transaction")}>
                  💸 Refund Order
                </button>
                <button onClick={() => handleActionMenuClick("Archive Order Record")}>
                  🗄️ Archive Order
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </>
  );
};

export default OrderRow;
