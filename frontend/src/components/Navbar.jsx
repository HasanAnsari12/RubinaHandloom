// frontend/src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import "./Navbar.css";

function Navbar({ searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, cartCount, wishlist, logout } = useAppContext();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    // 1. Clear local storage session tokens
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. Clear application context state
    logout();

    // 3. Close menus and redirect to login
    setShowMenu(false);
    setShowMobileMenu(false);
    navigate("/login");
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
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
            {wishlist.length > 0 && <span className="mobile-badge">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="mobile-icon" onClick={() => setShowMobileMenu(false)}>
            🛒
            {cartCount > 0 && <span className="mobile-badge">{cartCount}</span>}
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
            {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="nav-link">
            🛒 Cart
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
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
                👤 {user.name ? user.name.split(" ")[0] : "User"}
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
                    {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
                  </Link>
                  <Link to="/cart" onClick={() => setShowMenu(false)}>
                    🛒 Cart
                    {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
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
            {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" onClick={() => setShowMobileMenu(false)}>
            🛒 Cart
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
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