import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <h2>Rubina Handloom</h2>
        <span>Admin Console</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        
        <NavLink to="/products" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🛍️</span> Manage Products
        </NavLink>

        <NavLink to="/products/add" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">➕</span> Add Product
        </NavLink>

        <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📦</span> Manage Orders
        </NavLink>

        <NavLink to="/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">👥</span> User Management
        </NavLink>

        <NavLink to="/upload-csv" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📁</span> CSV Upload
        </NavLink>

        <NavLink to="/categories" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🏷️</span> Categories
        </NavLink>

        <NavLink to="/reviews" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">⭐</span> Reviews Moderation
        </NavLink>

        <NavLink to="/analytics" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📈</span> Analytics
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">⚙️</span> Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
