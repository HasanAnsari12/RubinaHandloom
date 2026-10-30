import React from "react";
import "./RecentUsersCard.css";

const RecentUsersCard = ({ users = [], loading = false }) => {
  if (loading) {
    return (
      <div className="recent-users-skeleton animate-pulse">
        <div className="skeleton-user-row"></div>
        <div className="skeleton-user-row"></div>
      </div>
    );
  }

  const renderAvatar = (user) => {
    if (user?.profileImage) {
      return <img src={user.profileImage} alt={user.name} className="recent-user-avatar-img" />;
    }
    const letter = user?.name?.[0]?.toUpperCase() || "C";
    return <div className="recent-user-avatar-fallback">{letter}</div>;
  };

  return (
    <div className="recent-users-card-wrapper">
      {users.length === 0 ? (
        <div className="recent-users-empty select-none">
          <span>👥</span>
          <p>No customers registered yet</p>
        </div>
      ) : (
        <div className="recent-users-list">
          {users.map((u) => (
            <div key={u._id} className="recent-user-item-row">
              <div className="recent-user-left-flex">
                {renderAvatar(u)}
                <div className="recent-user-meta-info">
                  <strong>{u.name || "Customer Profile"}</strong>
                  <span>{u.email || "N/A"}</span>
                </div>
              </div>

              <div className="recent-user-right-date">
                <span>Joined</span>
                <strong>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "—"}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentUsersCard;
