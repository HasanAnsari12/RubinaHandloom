import React from "react";
import "./SettingsSidebar.css";
import { SETTINGS_TABS } from "../../../constants/SettingsConstants";

const SettingsSidebar = ({ activeTab, onTabChange }) => {
  return (
    <aside className="settings-sidebar">
      <div className="settings-sidebar-header">
        <span className="settings-sidebar-icon">⚙️</span>
        <span className="settings-sidebar-title">Settings</span>
      </div>
      <nav className="settings-sidebar-nav">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`settings-tab-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => onTabChange(tab.key)}
            type="button"
          >
            <span className="settings-tab-icon">{tab.icon}</span>
            <span className="settings-tab-label">{tab.label}</span>
            {activeTab === tab.key && <span className="settings-tab-active-indicator"></span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
