import React, { useState, useEffect } from "react";
import LoadingSkeleton from "./LoadingSkeleton";
import StatusBadge from "./StatusBadge";
import "./UserDetailsDrawer.css";

const UserDetailsDrawer = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(true);

  // Sync state and simulate drawer loading skeleton for premium UX
  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const formattedId = user
    ? `#USR-${String(user._id).slice(-6).toUpperCase()}`
    : "";

  const renderAvatar = (currentUser) => {
    if (currentUser?.profileImage) {
      return (
        <img
          src={currentUser.profileImage}
          alt={currentUser.name}
          className="drawer-user-avatar-img"
        />
      );
    }
    const firstLetter = currentUser?.name?.[0]?.toUpperCase() || "U";
    return (
      <div className="drawer-user-avatar-fallback">
        {firstLetter}
      </div>
    );
  };

  const getStatus = (currentUser) => {
    return currentUser?.isBlocked ? "blocked" : "active";
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <aside className="user-details-drawer">
        <div className="drawer-header">
          <div className="drawer-header-left">
            <h3>User Account</h3>
            <span className="drawer-user-formatted-id">{formattedId}</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {loading || !user ? (
            <div className="drawer-loading-padding">
              <LoadingSkeleton type="line" count={12} />
            </div>
          ) : (
            <div className="drawer-content-flow">
              {/* Header profile summary card */}
              <div className="drawer-profile-summary-header">
                {renderAvatar(user)}
                <div className="drawer-profile-text">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                  <span>{user.phone || "No phone registered"}</span>
                </div>
              </div>

              {/* Section 1: Role, Status, and Email Verification badges */}
              <div className="drawer-section badges-row-panel">
                <div className="badge-item-group">
                  <span>System Role</span>
                  <StatusBadge status={user.role} />
                </div>
                <div className="badge-item-group">
                  <span>Logins Status</span>
                  <StatusBadge status={getStatus(user)} />
                </div>
                <div className="badge-item-group">
                  <span>Email Verification</span>
                  <span className={`email-verif-badge-pnl ${user.isVerified ? "verified" : "unverified"}`}>
                    {user.isVerified ? "🟢 Verified" : "🔴 Not Verified"}
                  </span>
                </div>
              </div>

              {/* Section 2: Address Block */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Billing & Shipping Address</h4>
                {user.shippingAddress ? (
                  <div className="drawer-address-block">
                    <strong>{user.shippingAddress?.fullName}</strong>
                    <p>{user.shippingAddress?.house}, {user.shippingAddress?.area}</p>
                    <p>{user.shippingAddress?.city}, {user.shippingAddress?.state} - {user.shippingAddress?.pincode}</p>
                    <p>{user.shippingAddress?.country || "India"}</p>
                  </div>
                ) : (
                  <p className="no-address-registered">No address registered on this profile yet.</p>
                )}
              </div>

              {/* Section 3: Statistics (Placeholders) */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Artisan & Customer Activity</h4>
                <div className="activity-stats-grid">
                  <div className="activity-stat-box">
                    <strong>0</strong>
                    <span>Orders</span>
                  </div>
                  <div className="activity-stat-box">
                    <strong>0</strong>
                    <span>Wishlist Items</span>
                  </div>
                  <div className="activity-stat-box">
                    <strong>0</strong>
                    <span>Reviews Left</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Audit & Dates details */}
              <div className="drawer-section dates-details-grid">
                <div className="date-row">
                  <span>Joined Date</span>
                  <span>
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="date-row">
                  <span>Last Updated</span>
                  <span>
                    {new Date(user.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="date-row">
                  <span>Last Login</span>
                  <span className="last-login-stub-txt">Never Logged In</span>
                </div>
              </div>

              {/* Raw Database ID block at bottom */}
              <div className="drawer-footer-raw-info">
                <span>Database ObjectID:</span>
                <code>{user._id}</code>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default UserDetailsDrawer;
