import React from "react";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";
import "./Topbar.css";

const Topbar = ({ onMenuToggle }) => {
  return (
    <header className="luxury-topbar">
      <div className="topbar-left-section">
        <button className="mobile-menu-toggle-btn" onClick={onMenuToggle} aria-label="Toggle Sidebar">
          ☰
        </button>
        <SearchBar />
      </div>

      <div className="topbar-right-section">
        <ThemeToggle />
        <NotificationBell />
        <div className="divider-line"></div>
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Topbar;
