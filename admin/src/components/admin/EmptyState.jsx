import React from "react";
import "./EmptyState.css";

const EmptyState = ({
  icon = "📦",
  title = "No items found",
  desc = "It looks like there are no records available at this time.",
  actionText,
  onAction,
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{desc}</p>
      {actionText && onAction && (
        <button className="empty-state-btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
