import React from "react";
import "./AdminCard.css";

const AdminCard = ({ title, extra, children, footer, className = "" }) => {
  return (
    <div className={`admin-card-container ${className}`}>
      {(title || extra) && (
        <div className="admin-card-header">
          {title && <h3 className="admin-card-title">{title}</h3>}
          {extra && <div className="admin-card-extra">{extra}</div>}
        </div>
      )}
      <div className="admin-card-body">{children}</div>
      {footer && <div className="admin-card-footer">{footer}</div>}
    </div>
  );
};

export default AdminCard;
