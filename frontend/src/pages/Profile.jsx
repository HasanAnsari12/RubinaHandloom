// frontend/src/pages/Profile.jsx
import { useNavigate, Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="profile-page">
      {/* Compact Header */}
      <header className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-title">My Account</h1>
          <p className="profile-subtitle">Manage your profile and account settings.</p>
        </div>
      </header>

      {/* Profile Layout */}
      <div className="profile-container">
        {/* 30% User Information Panel */}
        <aside className="profile-info-panel">
          <div className="profile-avatar-container">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name || "User Avatar"}
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-initial">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>

          <div className="profile-user-details">
            {user.name && <h2 className="user-name">{user.name}</h2>}
            {user.email && <p className="user-email">{user.email}</p>}
            {user.phone && <p className="user-phone">📞 {user.phone}</p>}
            
            <div className="user-badge-container">
              <span className="user-member-badge">Premium Member</span>
            </div>

            {user.createdAt && (
              <p className="user-join-date">
                Member since: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="profile-actions">
            <Link to="/account/edit" className="profile-action-btn edit-profile">
              Edit Profile
            </Link>
            <Link to="/account/password" className="profile-action-btn change-password">
              Change Password
            </Link>
            <button onClick={handleLogout} className="profile-logout-btn">
              Logout
            </button>
          </div>
        </aside>

        {/* 70% Account Details Panel */}
        <main className="profile-details-panel">
          <section className="details-section">
            <h3 className="details-section-title">Dashboard Overview</h3>
            <div className="profile-dashboard-grid">
              <Link to="/orders" className="dashboard-item-card">
                <div className="item-card-header">
                  <span className="item-card-icon">📦</span>
                  <span className="item-card-count">{orders.length}</span>
                </div>
                <h4>My Orders</h4>
                <p>Track packages and purchase history</p>
              </Link>

              <Link to="/wishlist" className="dashboard-item-card">
                <div className="item-card-header">
                  <span className="item-card-icon">❤️</span>
                  <span className="item-card-count">{wishlist.length}</span>
                </div>
                <h4>Wishlist</h4>
                <p>View items saved for later purchase</p>
              </Link>

              <Link to="/cart" className="dashboard-item-card">
                <div className="item-card-header">
                  <span className="item-card-icon">🛒</span>
                  <span className="item-card-count">{cart.length}</span>
                </div>
                <h4>Shopping Cart</h4>
                <p>Manage items currently ready for checkout</p>
              </Link>
            </div>
          </section>

          <section className="details-section">
            <h3 className="details-section-title">Account Settings</h3>
            <div className="profile-settings-links">
              <Link to="/account/address" className="settings-link-card">
                <div className="settings-link-left">
                  <span className="settings-link-icon">📍</span>
                  <div>
                    <h4>Saved Addresses</h4>
                    <p>Manage delivery addresses for billing and shipping</p>
                  </div>
                </div>
                <span className="arrow-icon">→</span>
              </Link>

              <Link to="/account/edit" className="settings-link-card">
                <div className="settings-link-left">
                  <span className="settings-link-icon">👤</span>
                  <div>
                    <h4>Personal Information</h4>
                    <p>Update account details and phone information</p>
                  </div>
                </div>
                <span className="arrow-icon">→</span>
              </Link>

              <Link to="/account/password" className="settings-link-card">
                <div className="settings-link-left">
                  <span className="settings-link-icon">🔒</span>
                  <div>
                    <h4>Security</h4>
                    <p>Configure password and update security questions</p>
                  </div>
                </div>
                <span className="arrow-icon">→</span>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Profile;
