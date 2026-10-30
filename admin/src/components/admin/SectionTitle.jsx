import React from "react";
import "./SectionTitle.css";

const SectionTitle = ({ title, subtitle, children }) => {
  return (
    <div className="section-title-container">
      <div className="section-title-text">
        <h2 className="section-title-heading">{title}</h2>
        {subtitle && <p className="section-title-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="section-title-actions">{children}</div>}
    </div>
  );
};

export default SectionTitle;
