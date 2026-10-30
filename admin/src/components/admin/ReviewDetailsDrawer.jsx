import React, { useState, useEffect } from "react";
import LoadingSkeleton from "./LoadingSkeleton";
import StatusBadge from "./StatusBadge";
import RatingStars from "./RatingStars";
import "./ReviewDetailsDrawer.css";

const ReviewDetailsDrawer = ({ isOpen, onClose, review }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && review) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // 500ms skeleton loader duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, review]);

  if (!isOpen) return null;

  const renderAvatar = (currentUser) => {
    if (currentUser?.profileImage) {
      return (
        <img
          src={currentUser.profileImage}
          alt={currentUser.name}
          className="drawer-customer-avatar-img"
        />
      );
    }
    const firstLetter = currentUser?.name?.[0]?.toUpperCase() || "C";
    return (
      <div className="drawer-customer-avatar-fallback">
        {firstLetter}
      </div>
    );
  };

  const getProductThumbnail = (prod) => {
    const defaultPlaceholder = "/assets/product-placeholder.png";
    return prod?.images?.[0]?.url || defaultPlaceholder;
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <aside className="review-details-drawer">
        <div className="drawer-header">
          <div className="drawer-header-left">
            <h3>Review Details</h3>
            <span className="drawer-review-formatted-id">Rating: {review?.rating}★</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {loading || !review ? (
            <div className="drawer-loading-padding">
              <LoadingSkeleton type="line" count={11} />
            </div>
          ) : (
            <div className="drawer-content-flow">
              {/* Customer Profile Card */}
              <div className="drawer-section customer-summary-pnl">
                <h4 className="drawer-section-title">Customer</h4>
                <div className="customer-row-flex">
                  {renderAvatar(review.user)}
                  <div className="customer-meta-text">
                    <strong>{review.user?.name || "Customer Profile"}</strong>
                    <p>{review.user?.email || "N/A"}</p>
                    <span>Phone: {review.user?.phone || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Product Reference Card */}
              <div className="drawer-section product-summary-pnl">
                <h4 className="drawer-section-title">Product Assessed</h4>
                <div className="product-row-flex">
                  <img
                    src={getProductThumbnail(review.product)}
                    alt={review.product?.title}
                    className="product-thumbnail-element"
                  />
                  <div className="product-meta-text">
                    <strong>{review.product?.title || "Legacy Product"}</strong>
                    <p>Category: {review.product?.category || "Saree"}</p>
                    <button
                      type="button"
                      className="product-placeholder-nav-link"
                      onClick={() => alert(`Product Link Placeholder: Navigation to product page for ID ${review.product?._id}`)}
                    >
                      Open Product ↗
                    </button>
                  </div>
                </div>
              </div>

              {/* Review Ratings and Comment */}
              <div className="drawer-section review-content-pnl">
                <h4 className="drawer-section-title">Rating & Feedback</h4>
                
                <div className="rating-row-stars-display">
                  <RatingStars rating={review.rating} size="medium" showValue={true} />
                  
                  {/* Verified Purchase Badge Placeholder */}
                  <span className="verified-purchase-badge-pnl">
                    Verified Purchase ✔
                  </span>
                </div>

                <div className="review-comment-card-content">
                  <p>{review.comment}</p>
                </div>
              </div>

              {/* Display Status */}
              <div className="drawer-section status-summary-pnl">
                <div className="status-grid-item">
                  <span>Current Moderation Status</span>
                  <StatusBadge status={review.status} />
                </div>
              </div>

              {/* Activity logs & Timeline */}
              <div className="drawer-section timeline-placeholder-card">
                <h4>📜 Activity Timeline</h4>
                <div className="timeline-coming-soon-banner">
                  <span>Coming Soon</span>
                  <p>Future logs will track administrator approvals and visibility adjustments here.</p>
                </div>
              </div>

              {/* Audit dates details */}
              <div className="drawer-section audit-dates-detail">
                <div className="date-row">
                  <span>Review Created</span>
                  <span>
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="date-row">
                  <span>Last Modified</span>
                  <span>
                    {new Date(review.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Raw Database ID block */}
              <div className="drawer-footer-raw-info">
                <span>Database ObjectID:</span>
                <code>{review._id}</code>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default ReviewDetailsDrawer;
