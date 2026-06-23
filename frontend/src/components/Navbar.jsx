// frontend/src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

function Navbar({ searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Hamburger Menu Icon (Mobile Only) */}
        <button
          className="hamburger-menu"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        {/* Logo */}
        <Link to="/" className="logo" onClick={() => setShowMobileMenu(false)}>
          RUBINA
        </Link>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search Sarees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-box"
        />

        {/* Mobile Quick Icons (Mobile Only) */}
        <div className="mobile-quick-icons">
          <Link to="/wishlist" className="mobile-icon" onClick={() => setShowMobileMenu(false)}>
            ❤️
          </Link>
          <Link to="/cart" className="mobile-icon" onClick={() => setShowMobileMenu(false)}>
            🛒
          </Link>
          <Link to={user ? "/account" : "/login"} className="mobile-icon" onClick={() => setShowMobileMenu(false)}>
            👤
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="nav-links desktop-only">
          <Link to="/products" className="nav-link">
            Shop
          </Link>
          <Link to="/wishlist" className="nav-link">
            ❤️ Wishlist
          </Link>
          <Link to="/cart" className="nav-link">
            🛒 Cart
          </Link>
          <Link to="/orders" className="nav-link">
            📦 Orders
          </Link>

          {user && user.role === "admin" && (
            <Link to="/admin" className="nav-link admin-link">
              🛡️ Admin
            </Link>
          )}

          {user ? (
            <div style={{ position: "relative" }}>
              <button
                className="user-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                👤 {user.name.split(" ")[0]}
              </button>

              {showMenu && (
                <div className="dropdown">
                  <Link to="/account" onClick={() => setShowMenu(false)}>
                    👤 My Account
                  </Link>
                  <Link to="/orders" onClick={() => setShowMenu(false)}>
                    📦 My Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setShowMenu(false)}>
                    ❤️ Wishlist
                  </Link>
                  <Link to="/cart" onClick={() => setShowMenu(false)}>
                    🛒 Cart
                  </Link>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar / Dropdown Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setShowMobileMenu(false)}>
            Home
          </Link>
          <Link to="/products" onClick={() => setShowMobileMenu(false)}>
            Shop Collection
          </Link>
          <Link to="/wishlist" onClick={() => setShowMobileMenu(false)}>
            ❤️ Wishlist
          </Link>
          <Link to="/cart" onClick={() => setShowMobileMenu(false)}>
            🛒 Cart
          </Link>
          <Link to="/orders" onClick={() => setShowMobileMenu(false)}>
            📦 Orders
          </Link>
          
          {user && user.role === "admin" && (
            <Link to="/admin" onClick={() => setShowMobileMenu(false)} className="mobile-admin-link">
              🛡️ Admin Dashboard
            </Link>
          )}

          {user ? (
            <>
              <Link to="/account" onClick={() => setShowMobileMenu(false)}>
                👤 My Account
              </Link>
              <button className="mobile-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setShowMobileMenu(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;