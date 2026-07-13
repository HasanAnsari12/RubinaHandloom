import { useAuth } from "../../hooks/useAuth";
import "./Topbar.css";

const Topbar = () => {
  const { currentAdmin, logout } = useAuth();

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <span className="topbar-welcome">System Active</span>
      </div>

      <div className="topbar-right">
        {currentAdmin && (
          <div className="admin-profile-info">
            <span className="admin-avatar">👤</span>
            <span className="admin-name">{currentAdmin.name}</span>
          </div>
        )}
        <button className="logout-btn" onClick={logout}>
          Logout 🚪
        </button>
      </div>
    </header>
  );
};

export default Topbar;
