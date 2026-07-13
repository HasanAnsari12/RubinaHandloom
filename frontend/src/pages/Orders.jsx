// frontend/src/pages/Orders.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState(""); // "details" or "track"

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const handleOpenModal = (order, type) => {
    setSelectedOrder(order);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setModalType("");
  };

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
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta-info">
                  <span className="order-number-label">Order ID</span>
                  <h3 className="order-id-value">{order.id}</h3>
                  <span className="order-date-value">{order.date}</span>
                </div>
                <div className="order-status-badges">
                  <span className={`order-status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
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
                {(order.products || []).map((product, idx) => (
                  <div key={idx} className="card-product-item">
                    <img
                      src={product.images?.[0] || product.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80"}
                      alt={product.title}
                      className="card-product-img"
                    />
                    <div className="card-product-info">
                      <h4>{product.title}</h4>
                      <div className="card-product-pricing">
                        <span className="card-product-qty">Qty: {product.quantity || 1}</span>
                        <span className="card-product-price">₹{product.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="order-card-total">
                  <span className="total-label">Total Amount</span>
                  <span className="total-value">₹{order.total}</span>
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
          ))}
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
              <p className="order-ref">Order Reference: <strong>{selectedOrder.id}</strong></p>
              <p className="order-date-ref">Placed on: {selectedOrder.date}</p>
              
              {modalType === "details" ? (
                <div className="modal-details-view">
                  <div className="modal-products-list">
                    <h3>Products</h3>
                    {(selectedOrder.products || []).map((product, idx) => (
                      <div key={idx} className="modal-product-item">
                        <img
                          src={product.images?.[0] || product.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80"}
                          alt={product.title}
                          className="modal-product-img"
                        />
                        <div className="modal-product-info">
                          <h4>{product.title}</h4>
                          <p>Price: ₹{product.price}</p>
                          <p>Qty: {product.quantity || 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedOrder.address && (
                    <div className="modal-address-block">
                      <h3>📍 Shipping Address</h3>
                      <p><strong>{selectedOrder.address.fullName}</strong></p>
                      <p>{selectedOrder.address.phone}</p>
                      <p>{selectedOrder.address.house}, {selectedOrder.address.area}</p>
                      <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
                    </div>
                  )}

                  <div className="modal-total-summary">
                    <p>Status: <span className={`order-status-badge ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span></p>
                    <p className="modal-grand-total">Grand Total: <strong>₹{selectedOrder.total}</strong></p>
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
                    
                    <div className={`timeline-step ${selectedOrder.status === "Processing" || selectedOrder.status === "Shipped" || selectedOrder.status === "Delivered" ? "completed active" : ""}`}>
                      <div className="step-bullet">✓</div>
                      <div className="step-info">
                        <h4>Processing</h4>
                        <p>Artisans are packaging your sarees.</p>
                      </div>
                    </div>

                    <div className={`timeline-step ${selectedOrder.status === "Shipped" || selectedOrder.status === "Delivered" ? "completed" : ""}`}>
                      <div className="step-bullet">✓</div>
                      <div className="step-info">
                        <h4>Shipped</h4>
                        <p>Saree package is dispatched via courier.</p>
                      </div>
                    </div>

                    <div className={`timeline-step ${selectedOrder.status === "Delivered" ? "completed" : ""}`}>
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