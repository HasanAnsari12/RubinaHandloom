import React from "react";
import StatusBadge from "../StatusBadge";
import "./RecentOrdersCard.css";

const RecentOrdersCard = ({ orders = [], loading = false }) => {
  if (loading) {
    return (
      <div className="recent-orders-skeleton animate-pulse">
        <div className="skeleton-order-row"></div>
        <div className="skeleton-order-row"></div>
      </div>
    );
  }

  const renderAvatar = (user) => {
    if (user?.profileImage) {
      return <img src={user.profileImage} alt={user.name} className="recent-order-avatar-img" />;
    }
    const letter = user?.name?.[0]?.toUpperCase() || "C";
    return <div className="recent-order-avatar-fallback">{letter}</div>;
  };

  return (
    <div className="recent-orders-card-wrapper">
      {orders.length === 0 ? (
        <div className="recent-orders-empty select-none">
          <span>📦</span>
          <p>No orders processed yet</p>
        </div>
      ) : (
        <div className="recent-orders-list">
          {orders.map((o) => (
            <div key={o._id} className="recent-order-item-row">
              <div className="recent-order-left-flex">
                {renderAvatar(o.user)}
                <div className="recent-order-user-info">
                  <strong>{o.user?.name || "Customer Profile"}</strong>
                  <span>{o.user?.email || "N/A"}</span>
                </div>
              </div>

              <div className="recent-order-middle-amount">
                <strong>₹{Number(o.totalAmount).toLocaleString("en-IN")}</strong>
                <span>AOV Item</span>
              </div>

              <div className="recent-order-right-badge">
                <StatusBadge status={o.orderStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersCard;
