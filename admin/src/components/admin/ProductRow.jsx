import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import StatusBadge from "./StatusBadge";
import "./ProductRow.css";

const ProductRow = ({ product, isSelected, onSelectChange, onDelete, onView }) => {
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

  const getStatus = (stock) => {
    if (stock === 0) return "out-of-stock";
    if (stock <= 5) return "low-stock";
    return "active";
  };

  const handleActionMenuClick = (actionName) => {
    setIsMenuOpen(false);
    alert(`Reserved Action Placeholder: [${actionName}] triggered for product "${product.title}"`);
  };

  return (
    <>
      <td className="checkbox-column">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectChange(product._id, e.target.checked)}
        />
      </td>
      <td>
        <div className="product-table-identity">
          <ProductImage src={product.images?.[0]?.url || product.images?.[0]} alt={product.title} />
          <div className="product-title-detail">
            <span className="product-title-text" onClick={() => onView && onView(product)}>
              {product.title}
            </span>
            <span className="product-id-sub">ID: {product._id?.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      </td>
      <td className="product-category-cell">{product.category}</td>
      <td className="product-price-cell">₹{(product.price || 0).toLocaleString("en-IN")}</td>
      <td className="product-stock-cell">
        <span className={`stock-number-text ${product.stock <= 5 ? "warning-stock" : ""}`}>
          {product.stock} units
        </span>
      </td>
      <td>
        <StatusBadge status={getStatus(product.stock)} />
      </td>
      <td className="product-date-cell">
        {product.createdAt
          ? new Date(product.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A"}
      </td>
      <td className="product-actions-cell text-right">
        <div className="action-buttons-flex">
          <button className="row-action-btn view" onClick={() => onView && onView(product)}>
            View
          </button>
          <Link to={`/products/edit/${product._id}`} className="row-action-btn edit">
            Edit
          </Link>
          <button className="row-action-btn delete" onClick={() => onDelete(product)}>
            Delete
          </button>

          {/* Premium Dropdown Option Menu for Reserved Placeholders */}
          <div className="reserved-menu-container" ref={menuRef}>
            <button className="reserved-menu-trigger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ⋮
            </button>
            {isMenuOpen && (
              <div className="reserved-action-dropdown">
                <button onClick={() => handleActionMenuClick("Duplicate Product")}>
                  📋 Duplicate Saree
                </button>
                <button onClick={() => handleActionMenuClick("Archive Product")}>
                  📥 Archive Product
                </button>
                <button onClick={() => handleActionMenuClick("Preview Saree Page")}>
                  👁️ Preview Live
                </button>
                <button onClick={() => handleActionMenuClick("Export Product Metadata")}>
                  📤 Export CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </>
  );
};

export default ProductRow;
