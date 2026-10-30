import React, { useState, useEffect, useRef } from "react";
import "./NotificationBell.css";

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "New Order #RH-8419", desc: "Premium Silk Kanchipuram Saree ordered", time: "5 mins ago", read: false },
  { id: 2, title: "Low Stock Alert", desc: "Banarasi Zari Brocade is below 3 units", time: "1 hour ago", read: false },
  { id: 3, title: "New Review Approved", desc: "5-star rating on Crimson Patola Saree", time: "3 hours ago", read: true },
];

const NotificationBell = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="notification-bell-btn" onClick={() => setIsOpen(!isOpen)}>
        <span className="bell-emoji">🔔</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">All caught up!</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`notification-item ${notif.read ? "read" : "unread"}`}>
                  <div className="notification-item-header">
                    <h4>{notif.title}</h4>
                    <span className="notification-time">{notif.time}</span>
                  </div>
                  <p>{notif.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
