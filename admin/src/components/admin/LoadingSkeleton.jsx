import React from "react";
import "./LoadingSkeleton.css";

const LoadingSkeleton = ({ type = "card", count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === "table") {
    return (
      <div className="skeleton-table">
        <div className="skeleton-row header">
          <div className="skeleton-col"></div>
          <div className="skeleton-col"></div>
          <div className="skeleton-col"></div>
          <div className="skeleton-col"></div>
        </div>
        {items.map((_, i) => (
          <div className="skeleton-row" key={i}>
            <div className="skeleton-col line"></div>
            <div className="skeleton-col line"></div>
            <div className="skeleton-col line"></div>
            <div className="skeleton-col line"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className="skeleton-lines">
        {items.map((_, i) => (
          <div className="skeleton-line" key={i}></div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-cards-grid">
      {items.map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-card-icon"></div>
          <div className="skeleton-card-content">
            <div className="skeleton-card-title"></div>
            <div className="skeleton-card-value"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
