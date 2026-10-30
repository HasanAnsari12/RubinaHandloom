import React from "react";
import "./InventoryAlerts.css";

const InventoryAlerts = ({ items = [], loading = false }) => {
  if (loading) {
    return (
      <div className="alerts-skeleton-box animate-pulse">
        <div className="skeleton-alert-item"></div>
        <div className="skeleton-alert-item"></div>
      </div>
    );
  }

  const getProductImage = (prod) => {
    const placeholder = "/assets/product-placeholder.png";
    return prod.images?.[0] || placeholder;
  };

  return (
    <div className="inventory-alerts-list-wrapper">
      {items.length === 0 ? (
        <div className="inventory-healthy-state">
          <span>✅</span>
          <p>Inventory healthy. No low-stock alerts.</p>
        </div>
      ) : (
        <div className="alerts-scroller-deck">
          {items.map((item) => {
            const isOutOfStock = item.stock === 0;
            return (
              <div key={item._id} className={`alert-row-item ${isOutOfStock ? "out" : "low"}`}>
                <img
                  src={getProductImage(item)}
                  alt={item.title}
                  className="alert-item-thumbnail"
                />
                <div className="alert-item-meta-text">
                  <strong>{item.title}</strong>
                  <span>Category: {item.category || "Saree"}</span>
                </div>
                <div className="alert-stock-kpi-badge">
                  {isOutOfStock ? (
                    <span className="stock-alert-tag out-of-stock">Out of Stock</span>
                  ) : (
                    <span className="stock-alert-tag low-stock">{item.stock} Left</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
