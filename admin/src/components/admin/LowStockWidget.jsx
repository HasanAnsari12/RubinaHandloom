import React from "react";
import "./LowStockWidget.css";

const MOCK_LOW_STOCK = [
  {
    id: 1,
    name: "Magenta Banarasi Brocade Saree",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=150&q=80",
    stock: 2,
  },
  {
    id: 2,
    name: "Indigo Blue Linen Handloom Saree",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80",
    stock: 1,
  },
];

const LowStockWidget = () => {
  const handleRestockClick = (id, name) => {
    alert(`Restock request triggered for ${name} (ID: ${id})`);
  };

  return (
    <div className="low-stock-card">
      <div className="low-stock-header">
        <h3>Low Stock Alerts</h3>
        <span className="danger-badge">Critical</span>
      </div>
      <div className="low-stock-list">
        {MOCK_LOW_STOCK.map((item) => (
          <div key={item.id} className="low-stock-item">
            <img src={item.image} alt={item.name} className="low-stock-img" />
            <div className="low-stock-info">
              <h4>{item.name}</h4>
              <p className="low-stock-count-text">
                Only <strong className="danger-count">{item.stock} units</strong> left
              </p>
            </div>
            <button className="restock-action-btn" onClick={() => handleRestockClick(item.id, item.name)}>
              Restock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockWidget;
