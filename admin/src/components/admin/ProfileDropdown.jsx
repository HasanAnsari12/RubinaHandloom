import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import "./ProfileDropdown.css";

const ProfileDropdown = () => {
  const { currentAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button className="profile-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className="avatar-circle">
          {currentAdmin?.name?.[0]?.toUpperCase() || "A"}
        </div>
        <span className="admin-info-text">
          <span className="admin-name-span">{currentAdmin?.name || "Admin"}</span>
          <span className="admin-role-span">{currentAdmin?.role || "Console"}</span>
        </span>
      </button>

      {isOpen && (
        <div className="profile-menu-dropdown">
          <div className="profile-menu-header">
            <h4>{currentAdmin?.name || "SRK Admin"}</h4>
            <p>{currentAdmin?.email || "admin@srkhandloom.com"}</p>
          </div>
          <ul className="profile-menu-links">
            <li>
              <Link to="/settings" onClick={() => setIsOpen(false)}>
                ⚙️ Settings & Settings
              </Link>
            </li>
            <li>
              <a href="http://localhost:5173" target="_blank" rel="noreferrer">
                🌐 Visit Front Store
              </a>
            </li>
            <li className="logout-li">
              <button className="dropdown-logout-btn" onClick={logout}>
                🚪 Log Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
