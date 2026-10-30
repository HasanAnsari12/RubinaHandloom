import React from "react";
import "./TopSellingProducts.css";

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Crimson Kanchipuram Brocade Saree",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80",
    sales: 142,
    revenue: "₹3,55,000",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Golden Banarasi Zari Silk Saree",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=150&q=80",
    sales: 98,
    revenue: "₹2,45,000",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Midnight Black Georgette Saree",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80",
    sales: 74,
    revenue: "₹1,11,000",
    rating: 4.7,
  },
];

const TopSellingProducts = () => {
  return (
    <div className="top-selling-card">
      <div className="top-selling-header">
        <h3>Top Selling Products</h3>
        <span className="premium-label-badge">Best Sellers</span>
      </div>
      <div className="top-selling-list">
        {MOCK_PRODUCTS.map((prod) => (
          <div key={prod.id} className="top-selling-item">
            <img src={prod.image} alt={prod.name} className="top-selling-img" />
            <div className="top-selling-info">
              <h4>{prod.name}</h4>
              <div className="top-selling-meta">
                <span className="sales-count">{prod.sales} sold</span>
                <span className="rating-span">⭐ {prod.rating}</span>
              </div>
            </div>
            <div className="top-selling-rev">
              <strong>{prod.revenue}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingProducts;
