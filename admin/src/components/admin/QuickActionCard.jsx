import React from "react";
import { useNavigate } from "react-router-dom";
import "./QuickActionCard.css";

const QuickActionCard = ({ title, icon, path, onAction, description }) => {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (path) {
      navigate(path);
    } else if (onAction) {
      onAction();
    }
  };

  return (
    <button className="luxury-quick-action-btn" onClick={handleActionClick}>
      <div className="quick-action-icon-circle">{icon}</div>
      <div className="quick-action-text-info">
        <h4 className="quick-action-heading">{title}</h4>
        {description && <p className="quick-action-desc">{description}</p>}
      </div>
    </button>
  );
};

export default QuickActionCard;
