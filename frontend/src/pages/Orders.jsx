// frontend/src/pages/Orders.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState(""); // "details" or "track"

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getMyOrders();
        if (response.success) {
          setOrders(response.orders || []);
        }
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOpenModal = (order, type) => {
    setSelectedOrder(order);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setModalType("");
  };

  if (loading) {
    return (
      <div className="orders-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <header className="orders-header">
          <div className="orders-header-content">
            <div className="orders-header-top">
              <button className="orders-back-btn-header" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <h1 className="orders-title">My Orders (0)</h1>
            </div>
            <p className="orders-subtitle">Track and manage your purchases.</p>
          </div>
        </header>
        <div className="orders-container">
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>Start shopping to see your orders.</p>
            <Link to="/" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div className="orders-header-content">
          <div className="orders-header-top">
            <button className="orders-back-btn-header" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <h1 className="orders-title">My Orders ({orders.length})</h1>
          </div>
          <p className="orders-subtitle">Track and manage your purchases.</p>
        </div>
      </header>

      {/* Orders Container */}
      <div className="orders-container">
        <div className="orders-grid">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta-info">
                    <span className="order-number-label">Order ID</span>
                    <h3 className="order-id-value">{order._id}</h3>
                    <span className="order-date-value">{dateStr}</span>
                  </div>
                  <div className="order-status-badges">
                    <span className={`order-status-badge ${order.orderStatus?.toLowerCase() || "processing"}`}>
                      {order.orderStatus}
                    </span>
                    {order.paymentStatus && (
                      <span className={`payment-status-badge ${order.paymentStatus.toLowerCase()}`}>
                        {order.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline Product Previews */}
                <div className="order-card-products">
                  {(order.orderItems || []).map((item, idx) => {
                    const product = item.product || {};
                    return (
                      <div key={idx} className="card-product-item">
                        <img
                          src={product.images?.[0]?.url || product.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80"}
                          alt={product.title}
                          className="card-product-img"
                        />
                        <div className="card-product-info">
                          <h4>{product.title || "Handloom Saree"}</h4>
                          <div className="card-product-pricing">
                            <span className="card-product-qty">Qty: {item.quantity || 1}</span>
                            <span className="card-product-price">₹{(item.priceAtPurchase || product.price || 0).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="order-card-footer">
                  <div className="order-card-total">
                    <span className="total-label">Total Amount</span>
                    <span className="total-value">₹{(order.totalAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="order-card-actions">
                    <button
                      onClick={() => handleOpenModal(order, "details")}
                      className="view-details-action-btn"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleOpenModal(order, "track")}
                      className="track-order-action-btn"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Modal Overlay */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={handleCloseModal}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>{modalType === "track" ? "Track Order" : "Order Details"}</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="order-modal-content">
              <p className="order-ref">Order Reference: <strong>{selectedOrder._id}</strong></p>
              <p className="order-date-ref">Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")}</p>
              
              {modalType === "details" ? (
                <div className="modal-details-view">
                  <div className="modal-products-list">
                    <h3>Products</h3>
                    {(selectedOrder.orderItems || []).map((item, idx) => {
                      const product = item.product || {};
                      return (
                        <div key={idx} className="modal-product-item">
                          <img
                            src={product.images?.[0]?.url || product.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80"}
                            alt={product.title}
                            className="modal-product-img"
                          />
                          <div className="modal-product-info">
                            <h4>{product.title || "Handloom Saree"}</h4>
                            <p>Price: ₹{(item.priceAtPurchase || product.price || 0).toLocaleString("en-IN")}</p>
                            <p>Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedOrder.shippingAddress && (
                    <div className="modal-address-block">
                      <h3>📍 Shipping Address</h3>
                      <p><strong>{selectedOrder.shippingAddress.fullName}</strong></p>
                      <p>{selectedOrder.shippingAddress.phone}</p>
                      <p>{selectedOrder.shippingAddress.house}, {selectedOrder.shippingAddress.area}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                    </div>
                  )}

                  <div className="modal-total-summary">
                    <p>Status: <span className={`order-status-badge ${selectedOrder.orderStatus?.toLowerCase() || "processing"}`}>{selectedOrder.orderStatus}</span></p>
                    <p className="modal-grand-total">Grand Total: <strong>₹{(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}</strong></p>
                  </div>
                </div>
              ) : (
                <div className="modal-tracking-view">
                  <div className="tracking-timeline">
                    <div className="timeline-step completed">
                      <div className="step-bullet">✓</div>
                      <div className="step-info">
                        <h4>Order Placed</h4>
                        <p>We have received your order.</p>
                      </div>
                    </div>
                    
                    <div className={`timeline-step ${selectedOrder.orderStatus === "Processing" || selectedOrder.orderStatus === "Shipped" || selectedOrder.orderStatus === "Delivered" ? "completed active" : ""}`}>
                      <div className="step-bullet">✓</div>
                      <div className="step-info">
                        <h4>Processing</h4>
                        <p>Artisans are packaging your sarees.</p>
                      </div>
                    </div>

                    <div className={`timeline-step ${selectedOrder.orderStatus === "Shipped" || selectedOrder.orderStatus === "Delivered" ? "completed" : ""}`}>
                      <div className="step-bullet">✓</div>
                      <div className="step-info">
                        <h4>Shipped</h4>
                        <p>Saree package is dispatched via courier.</p>
                      </div>
                    </div>

                    <div className={`timeline-step ${selectedOrder.orderStatus === "Delivered" ? "completed" : ""}`}>
                      <div className="step-bullet">✓</div>
                      <div className="step-info">
                        <h4>Delivered</h4>
                        <p>Enjoy your handcrafted Rubina Handloom saree!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="order-modal-footer">
              <button className="close-action-btn" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;