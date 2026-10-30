import React, { useState, useRef, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import "./UserRow.css";

const UserRow = ({
  user,
  isSelected,
  onSelectChange,
  onView,
  onRoleChange,
  onStatusChange,
  onDelete,
}) => {
  const { currentAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Self protection checks
  const isSelf = currentAdmin?._id === user._id || currentAdmin?.id === user._id;

  useEffect(() => {
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleActionMenuClick = (actionName) => {
    setIsMenuOpen(false);
    alert(`Reserved Action Placeholder: [${actionName}] triggered for user "${user.name}"`);
  };

  const renderAvatar = () => {
    if (user.profileImage) {
      return (
        <img
          src={user.profileImage}
          alt={user.name}
          className="user-row-avatar-img"
        />
      );
    }
    const firstLetter = user.name?.[0]?.toUpperCase() || "U";
    return (
      <div className="user-row-avatar-fallback">
        {firstLetter}
      </div>
    );
  };

  const getStatus = () => {
    return user.isBlocked ? "blocked" : "active";
  };

  const formattedId = `#USR-${String(user._id).slice(-6).toUpperCase()}`;

  return (
    <>
      <td className="checkbox-column">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectChange(user._id, e.target.checked)}
        />
      </td>
      <td>
        <div className="user-row-identity">
          {renderAvatar()}
          <div className="user-row-title-detail">
            <span className="user-row-name-text" onClick={() => onView(user)}>
              {user.name}
            </span>
            <span className="user-row-id-sub">{formattedId}</span>
          </div>
        </div>
      </td>
      <td className="user-row-email-cell">{user.email}</td>
      <td className="user-row-phone-cell">{user.phone || "—"}</td>
      <td>
        <StatusBadge status={user.role} />
      </td>
      <td>
        <StatusBadge status={getStatus()} />
      </td>
      <td>
        <span className={`email-row-verif-badge ${user.isVerified ? "verified" : "unverified"}`}>
          {user.isVerified ? "🟢 Verified" : "🔴 Unverified"}
        </span>
      </td>
      <td className="user-row-joined-cell">
        {user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </td>
      <td className="user-row-actions-cell text-right">
        <div className="user-row-actions-flex">
          {/* View Drawer trigger */}
          <button className="row-action-btn view" onClick={() => onView(user)}>
            View
          </button>

          {/* Change Role Trigger */}
          <div className={`action-tooltip-wrapper ${isSelf ? "has-tooltip" : ""}`} data-tooltip="You cannot change your own role.">
            <select
              value={user.role}
              disabled={isSelf}
              onChange={(e) => onRoleChange(user._id, e.target.value)}
              className="row-role-dropdown-select"
            >
              <option value="user">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Block / Unblock trigger */}
          <div className={`action-tooltip-wrapper ${isSelf ? "has-tooltip" : ""}`} data-tooltip="You cannot block yourself.">
            <button
              className={`row-action-btn block-btn ${user.isBlocked ? "blocked" : "active"}`}
              onClick={() => onStatusChange(user._id, !user.isBlocked)}
              disabled={isSelf}
            >
              {user.isBlocked ? "Unblock" : "Block"}
            </button>
          </div>

          {/* Soft delete trigger */}
          <div className={`action-tooltip-wrapper ${isSelf ? "has-tooltip" : ""}`} data-tooltip="You cannot delete your own account.">
            <button
              className="row-action-btn delete"
              onClick={() => onDelete(user)}
              disabled={isSelf}
            >
              Delete
            </button>
          </div>

          {/* Action Menu (Reserved options drop-down list) */}
          <div className="reserved-menu-container" ref={menuRef}>
            <button className="reserved-menu-trigger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ⋮
            </button>
            {isMenuOpen && (
              <div className="reserved-action-dropdown">
                <button onClick={() => handleActionMenuClick("Reset Password")}>
                  🔑 Reset Password
                </button>
                <button onClick={() => handleActionMenuClick("Login As User")}>
                  👤 Login As User
                </button>
                <button onClick={() => handleActionMenuClick("Export User Data")}>
                  📥 Export User
                </button>
                <button onClick={() => handleActionMenuClick("View Activity Log")}>
                  📜 Activity Log
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </>
  );
};

export default UserRow;
