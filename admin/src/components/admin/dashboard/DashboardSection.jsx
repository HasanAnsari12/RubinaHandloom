import React from "react";
import "./DashboardSection.css";

const DashboardSection = ({
  title,
  subtitle,
  actions,
  children,
  className = "",
  loading = false,
  empty = false,
  emptyState,
}) => {
  return (
    <section className={`dashboard-section-card ${className}`}>
      {/* Header details */}
      {(title || subtitle || actions) && (
        <div className="dashboard-section-header">
          <div className="header-meta-info">
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="header-actions-deck">{actions}</div>}
        </div>
      )}

      {/* Content panel */}
      <div className="dashboard-section-content">
        {loading ? (
          <div className="section-loading-block">
            <div className="loading-bar-spin"></div>
            <span>Analyzing statistics...</span>
          </div>
        ) : empty ? (
          emptyState || (
            <div className="section-empty-block">
              <span className="empty-emoji">📊</span>
              <h4>No Data Available</h4>
              <p>Try altering date preset filter parameters.</p>
            </div>
          )
        ) : (
          children
        )}
      </div>
    </section>
  );
};

export default DashboardSection;
