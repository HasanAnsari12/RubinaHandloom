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
        <button
          className="orders-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div className="orders-empty">
          <h2>No Orders Yet 📦</h2>
          <p>Start shopping to see your orders.</p>
          <Link
            to="/"
            className="view-order-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <button
        className="orders-back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Hero Section */}
      <section className="orders-hero">
        <h1>My Orders</h1>
        <p>Track your handcrafted saree purchases and delivery updates.</p>
      </section>

      {/* Orders List */}
      <section className="orders-container">
        {orders.map((order) => (
          <div
            key={order.id}
            className="order-card"
          >
            <div className="order-header">
              <div>
                <div className="order-number">Order Number</div>
                <h2>{order.id}</h2>
                <p>{order.date}</p>
              </div>
              <span
                className={`order-status ${order.status.toLowerCase()}`}
              >
                {order.status}
              </span>
            </div>

            <div className="order-details">
              <div>
                <strong>Items:</strong> {order.items}
              </div>
              <div>
                <strong>Total:</strong> ₹{order.total}
              </div>
            </div>

            <div className="order-actions">
              <button
                onClick={() => handleOpenModal(order, "details")}
                className="view-order-btn-action"
              >
                View Details
              </button>

              <button
                onClick={() => handleOpenModal(order, "track")}
                className="track-order-btn"
              >
                Track Order
              </button>
            </div>
          </div>
        ))}
      </section>

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
                    <p>Status: <span className={`order-status ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span></p>
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