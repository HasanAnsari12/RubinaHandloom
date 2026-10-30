import React from "react";
import RatingStars from "../RatingStars";
import "./TopProductsTable.css";

const TopProductsTable = ({ products = [], loading = false }) => {
  if (loading) {
    return (
      <div className="table-skeleton-grid animate-pulse">
        <div className="skeleton-row-line"></div>
        <div className="skeleton-row-line"></div>
      </div>
    );
  }

  const getProductImage = (prod) => {
    const placeholder = "/assets/product-placeholder.png";
    return prod.images?.[0] || placeholder;
  };

  return (
    <div className="top-selling-products-table-wrapper">
      <table className="dashboard-metrics-datatable">
        <thead>
          <tr>
            <th>Product Details</th>
            <th>Category</th>
            <th>Units Sold</th>
            <th>Revenue</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="no-records-row">
                No selling logs found for selected dates.
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="top-product-details-cell">
                    <img
                      src={getProductImage(p)}
                      alt={p.title}
                      className="top-product-row-thumb"
                    />
                    <div className="top-product-meta">
                      <strong>{p.title}</strong>
                      <span>₹{Number(p.price).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="top-product-category-lbl">{p.category || "Saree"}</span>
                </td>
                <td>
                  <strong className="sold-units-count-text">{p.soldCount}</strong>
                </td>
                <td>
                  <strong className="revenue-gain-value-text">
                    ₹{Number(p.revenue).toLocaleString("en-IN")}
                  </strong>
                </td>
                <td>
                  <RatingStars rating={p.rating} size="small" showValue={true} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopProductsTable;
