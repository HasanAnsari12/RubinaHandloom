import React, { useState, useEffect } from "react";
import OrderTimeline from "./OrderTimeline";
import StatusBadge from "./StatusBadge";
import ProductImage from "./ProductImage";
import LoadingSkeleton from "./LoadingSkeleton";
import "./OrderDetailsDrawer.css";

const ORDER_STATUS_FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

const OrderDetailsDrawer = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  updating = false,
}) => {
  const [localOrderStatus, setLocalOrderStatus] = useState("");
  const [localPaymentStatus, setLocalPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Sync state and simulate drawer loading skeleton for premium UX
  useEffect(() => {
    if (isOpen && order) {
      setLoading(true);
      setLocalOrderStatus(order.orderStatus || "Pending");
      setLocalPaymentStatus(order.paymentStatus || "Pending");

      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // Premium UX skeleton loader duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, order]);

  if (!isOpen) return null;

  // Validation transition rules for Order Status
  const getAvailableOrderStatuses = (currentStatus) => {
    if (currentStatus === "Cancelled") return ["Cancelled"];
    if (currentStatus === "Delivered") return ["Delivered"];

    const currentIdx = ORDER_STATUS_FLOW.indexOf(currentStatus);
    if (currentIdx === -1) return ORDER_STATUS_FLOW;

    // Can only move forward, plus allow Cancelled from any active step
    const forwardSteps = ORDER_STATUS_FLOW.slice(currentIdx);
    return [...forwardSteps, "Cancelled"];
  };

  // Validation transition rules for Payment Status
  const getAvailablePaymentStatuses = (method, currentStatus) => {
    const isCOD = String(method || "").toUpperCase() === "COD";

    if (currentStatus === "Refunded") return ["Refunded"];
    if (currentStatus === "Paid") {
      return isCOD ? ["Paid"] : ["Paid", "Refunded"];
    }
    if (currentStatus === "Failed") {
      return ["Failed", "Pending", "Paid"];
    }

    // Default: Pending / Unpaid
    return isCOD
      ? ["Pending", "Paid"]
      : ["Pending", "Paid", "Failed"];
  };

  const handleOrderChange = async (newVal) => {
    setLocalOrderStatus(newVal);
    await onUpdateStatus(order._id, { orderStatus: newVal });
  };

  const handlePaymentChange = async (newVal) => {
    setLocalPaymentStatus(newVal);
    await onUpdateStatus(order._id, { paymentStatus: newVal });
  };

  const formattedId = order
    ? `#RH-${String(order._id).slice(-6).toUpperCase()}`
    : "";

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <aside className="order-details-drawer">
        <div className="drawer-header">
          <div className="drawer-header-left">
            <h3>Order Details</h3>
            <span className="drawer-order-formatted-id">{formattedId}</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {loading || !order ? (
            <div className="drawer-loading-padding">
              <LoadingSkeleton type="line" count={12} />
            </div>
          ) : (
            <div className="drawer-content-flow">
              {/* Stepper Timeline Tracker */}
              <div className="drawer-section no-border">
                <OrderTimeline currentStatus={order.orderStatus} />
              </div>

              {/* Status Update Controls */}
              <div className="drawer-section status-actions-panel">
                <div className="status-control-group">
                  <label>Order Status</label>
                  <select
                    value={localOrderStatus}
                    disabled={updating || order.orderStatus === "Cancelled" || order.orderStatus === "Delivered"}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    className="drawer-status-select"
                  >
                    {getAvailableOrderStatuses(order.orderStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="status-control-group">
                  <label>Payment Status</label>
                  <select
                    value={localPaymentStatus}
                    disabled={updating || order.paymentStatus === "Refunded"}
                    onChange={(e) => handlePaymentChange(e.target.value)}
                    className="drawer-status-select"
                  >
                    {getAvailablePaymentStatuses(order.paymentMethod, order.paymentStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Contact Card */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Customer Details</h4>
                <div className="customer-info-grid">
                  <div className="info-item">
                    <span>Name</span>
                    <strong>{order.user?.name || "Customer Profile"}</strong>
                  </div>
                  <div className="info-item">
                    <span>Email</span>
                    <strong>{order.user?.email || "N/A"}</strong>
                  </div>
                  <div className="info-item">
                    <span>Phone</span>
                    <strong>{order.shippingAddress?.phone || "N/A"}</strong>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Shipping Address</h4>
                <div className="shipping-address-block">
                  <strong>{order.shippingAddress?.fullName}</strong>
                  <p>{order.shippingAddress?.house}, {order.shippingAddress?.area}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                </div>
              </div>

              {/* Products Itemized Summary */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Saree Items ({order.orderItems?.length || 0})</h4>
                <div className="drawer-product-list">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="drawer-product-row-item">
                      <ProductImage src={item.product?.images?.[0]?.url} alt={item.product?.title} />
                      <div className="drawer-product-info">
                        <h5>{item.product?.title || "Legacy Product"}</h5>
                        <span>
                          ₹{(item.priceAtPurchase || item.product?.price || 0).toLocaleString("en-IN")} × {item.quantity}
                        </span>
                      </div>
                      <div className="drawer-product-row-total">
                        <strong>
                          ₹{((item.priceAtPurchase || item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Actions Placeholder */}
              <div className="drawer-section invoice-placeholder-card">
                <div className="invoice-placeholder-text">
                  <h5>Invoice Actions</h5>
                  <p>Invoices remain disabled placeholders until a PDF generation backend is introduced.</p>
                </div>
                <div className="invoice-buttons-deck">
                  <button className="invoice-btn-disabled" disabled>Print Invoice</button>
                  <button className="invoice-btn-disabled" disabled>Download PDF</button>
                </div>
              </div>

              {/* Payment details and subtotal */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Payment & Pricing</h4>
                <div className="pricing-grid-detail">
                  <div className="price-row">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal?.toLocaleString("en-IN")}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="price-row discount">
                      <span>Discount</span>
                      <span>-₹{order.discount?.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="price-row">
                    <span>Shipping Charge</span>
                    <span>₹{order.shippingCharge?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="price-row divider"></div>
                  <div className="price-row grand-total">
                    <span>Grand Total</span>
                    <strong>₹{order.totalAmount?.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="price-row method-status">
                    <span>Method: {order.paymentMethod}</span>
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                </div>
              </div>

              {/* 1️⃣ Future Enhancement: Audit Trail (Reserved Placeholder) */}
              <div className="drawer-section audit-trail-placeholder-card">
                <div className="audit-header-placeholder">
                  <h4>📜 Audit Trail (Reserved Placeholder)</h4>
                  <span>Admin Logs</span>
                </div>
                <div className="audit-trail-logs-grid">
                  <div className="audit-log-item">
                    <span className="audit-label">Updated By:</span>
                    <span className="audit-val">Super Admin</span>
                  </div>
                  <div className="audit-log-item">
                    <span className="audit-label">Updated At:</span>
                    <span className="audit-val">
                      {new Date().toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="audit-log-item">
                    <span className="audit-label">Transition:</span>
                    <span className="audit-val font-code">
                      {order.orderStatus} ➔ Updated
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw Database ID block at bottom */}
              <div className="drawer-footer-raw-info">
                <span>Database ObjectID:</span>
                <code>{order._id}</code>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default OrderDetailsDrawer;
