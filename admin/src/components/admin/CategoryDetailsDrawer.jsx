import React, { useState, useEffect } from "react";
import LoadingSkeleton from "./LoadingSkeleton";
import StatusBadge from "./StatusBadge";
import CategoryImage from "./CategoryImage";
import "./CategoryDetailsDrawer.css";

const CategoryDetailsDrawer = ({ isOpen, onClose, category }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && category) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // 500ms skeleton loader duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <aside className="category-details-drawer">
        <div className="drawer-header">
          <div className="drawer-header-left">
            <h3>Category Profile</h3>
            <span className="drawer-category-formatted-slug">/{category?.slug}</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {loading || !category ? (
            <div className="drawer-loading-padding">
              <LoadingSkeleton type="line" count={10} />
            </div>
          ) : (
            <div className="drawer-content-flow">
              {/* Category Image Cover */}
              <div className="drawer-category-cover-panel">
                <CategoryImage src={category.image?.url} alt={category.name} className="drawer-category-thumb-large" />
                <div className="drawer-category-title-text">
                  <h4>{category.name}</h4>
                  <p>Slug: <code>{category.slug}</code></p>
                </div>
              </div>

              {/* Description Card */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Description</h4>
                <p className="drawer-category-description-text">
                  {category.description || "No description provided for this weaving collection."}
                </p>
              </div>

              <div className="drawer-section-divider-line"></div>

              {/* Status and Products Stats */}
              <div className="drawer-section stats-row-panel">
                <div className="stat-item-group">
                  <span>Linked Products</span>
                  <strong>{category.productsCount || 0}</strong>
                </div>
                <div className="stat-item-group">
                  <span>Display Status</span>
                  <StatusBadge status={category.status} />
                </div>
              </div>

              <div className="drawer-section-divider-line"></div>

              {/* Audit Timestamps */}
              <div className="drawer-section audit-dates-grid">
                <div className="audit-row">
                  <span>Created At</span>
                  <span>
                    {new Date(category.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="audit-row">
                  <span>Last Updated</span>
                  <span>
                    {new Date(category.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Raw MongoDB ObjectID at bottom */}
              <div className="drawer-footer-raw-info">
                <span>Database ObjectID:</span>
                <code>{category._id}</code>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default CategoryDetailsDrawer;
