import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  return (
    <>
      {/* Background overlay on mobile when sidebar is active */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      <aside className={`luxury-sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand Identity Header */}
        <div className="sidebar-brand-header">
          <div className="brand-logo-container">
            <span className="brand-logo-symbol">⚜️</span>
          </div>
          <div className="brand-name-info">
            <h2>SRK</h2>
            <span>Handloom Admin</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="sidebar-menu-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">📊</span>
            <span className="menu-label-span">Dashboard</span>
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">🛍️</span>
            <span className="menu-label-span">Products</span>
          </NavLink>

          <NavLink to="/orders" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">📦</span>
            <span className="menu-label-span">Orders</span>
          </NavLink>

          <NavLink to="/users" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">👥</span>
            <span className="menu-label-span">Users</span>
          </NavLink>

          <NavLink to="/categories" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">🏷️</span>
            <span className="menu-label-span">Categories</span>
          </NavLink>

          <NavLink to="/coupons" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">🎟️</span>
            <span className="menu-label-span">Coupons</span>
          </NavLink>

          <NavLink to="/inventory" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">🏭</span>
            <span className="menu-label-span">Inventory</span>
          </NavLink>

          <NavLink to="/reviews" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">⭐</span>
            <span className="menu-label-span">Reviews</span>
          </NavLink>

          <NavLink to="/analytics" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">📈</span>
            <span className="menu-label-span">Analytics</span>
          </NavLink>

          <NavLink to="/reports" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">📋</span>
            <span className="menu-label-span">Reports</span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => (isActive ? "menu-link-item active" : "menu-link-item")} onClick={onClose}>
            <span className="menu-icon-span">⚙️</span>
            <span className="menu-label-span">Settings</span>
          </NavLink>

          <div className="sidebar-divider"></div>

          <button className="menu-link-item logout-sidebar-btn" onClick={() => { onClose && onClose(); logout(); }}>
            <span className="menu-icon-span">🚪</span>
            <span className="menu-label-span">Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
