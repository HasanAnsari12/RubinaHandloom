import React from "react";
import "./SettingsCard.css";

const SettingsCard = ({ title, description, icon, children, onSave, saving = false, saveLabel = "Save Changes" }) => {
  return (
    <div className="settings-content-card">
      <div className="settings-card-header">
        <div className="settings-card-title-row">
          {icon && <span className="settings-card-icon">{icon}</span>}
          <div>
            <h2 className="settings-card-title">{title}</h2>
            {description && <p className="settings-card-description">{description}</p>}
          </div>
        </div>
        {onSave && (
          <button
            className="settings-save-btn"
            onClick={onSave}
            disabled={saving}
            type="button"
          >
            {saving ? <span className="settings-save-spinner"></span> : "💾"}
            {saving ? "Saving…" : saveLabel}
          </button>
        )}
      </div>
      <div className="settings-card-body">{children}</div>
    </div>
  );
};

export default SettingsCard;
