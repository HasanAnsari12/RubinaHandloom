import React, { useState, useRef, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import RatingStars from "./RatingStars";
import { REVIEW_TRANSITIONS } from "../../constants/ReviewStatusConstants";
import "./ReviewRow.css";

const ReviewRow = ({
  review,
  isSelected,
  onSelectChange,
  onView,
  onStatusChange,
  onDelete,
}) => {
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

  const handleActionMenuClick = (actionName) => {
    setIsMenuOpen(false);
    alert(`Reserved Action Placeholder: [${actionName}] triggered for review ID #${review._id}`);
  };

  const renderAvatar = () => {
    if (review.user?.profileImage) {
      return (
        <img
          src={review.user.profileImage}
          alt={review.user.name}
          className="review-row-avatar-img"
        />
      );
    }
    const firstLetter = review.user?.name?.[0]?.toUpperCase() || "C";
    return (
      <div className="review-row-avatar-fallback">
        {firstLetter}
      </div>
    );
  };

  const getCommentPreview = () => {
    const text = review.comment || "";
    if (text.length <= 80) return text;
    return `${text.slice(0, 80)}...`;
  };

  const currentStatus = review.status || "Pending";
  const allowedNext = REVIEW_TRANSITIONS[currentStatus] || [];

  return (
    <>
      <td className="checkbox-column">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectChange(review._id, e.target.checked)}
        />
      </td>
      <td>
        <div className="review-row-customer-flex">
          {renderAvatar()}
          <div className="customer-row-details">
            <span className="customer-row-name" onClick={() => onView(review)}>
              {review.user?.name || "Customer Profile"}
            </span>
            <span className="customer-row-email">{review.user?.email || "N/A"}</span>
          </div>
        </div>
      </td>
      <td>
        <span className="review-row-product-title">
          {review.product?.title || "Legacy Product"}
        </span>
      </td>
      <td>
        <RatingStars rating={review.rating} size="small" />
      </td>
      <td className="review-row-comment-preview-cell">
        {getCommentPreview()}
      </td>
      <td>
        <StatusBadge status={currentStatus} />
      </td>
      <td className="review-row-date-cell">
        {review.createdAt
          ? new Date(review.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </td>
      <td className="review-row-actions-cell text-right">
        <div className="review-row-actions-flex">
          {/* View Drawer trigger */}
          <button className="row-action-btn view" onClick={() => onView(review)}>
            View
          </button>

          {/* Quick Approve trigger */}
          {allowedNext.includes("Approved") && (
            <button
              className="row-action-btn quick-approve-btn"
              onClick={() => onStatusChange(review._id, "Approved")}
            >
              Approve
            </button>
          )}

          {/* Quick Reject trigger */}
          {allowedNext.includes("Rejected") && (
            <button
              className="row-action-btn quick-reject-btn"
              onClick={() => onStatusChange(review._id, "Rejected")}
            >
              Reject
            </button>
          )}

          {/* Quick Hide trigger */}
          {allowedNext.includes("Hidden") && (
            <button
              className="row-action-btn quick-hide-btn"
              onClick={() => onStatusChange(review._id, "Hidden")}
            >
              Hide
            </button>
          )}

          {/* Delete review trigger */}
          <button className="row-action-btn delete" onClick={() => onDelete(review)}>
            Delete
          </button>

          {/* Action Menu (Reserved options drop-down list) */}
          <div className="reserved-menu-container" ref={menuRef}>
            <button className="reserved-menu-trigger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ⋮
            </button>
            {isMenuOpen && (
              <div className="reserved-action-dropdown">
                <button onClick={() => handleActionMenuClick("Export Review")}>
                  📥 Export
                </button>
                <button onClick={() => handleActionMenuClick("View Product Page")}>
                  🏷️ View Product
                </button>
                <button onClick={() => handleActionMenuClick("Report Abuse")}>
                  🚫 Report Abuse
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </>
  );
};

export default ReviewRow;
