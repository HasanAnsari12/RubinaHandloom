import React from "react";
import "./ActivityTimeline.css";

const MOCK_ACTIVITIES = [
  { id: 1, type: "order-created", title: "New Order Placed", desc: "Order #RH-9022 for ₹12,499 by Saqib", time: "10 mins ago", icon: "📦" },
  { id: 2, type: "order-delivered", title: "Order Delivered Successfully", desc: "Order #RH-8931 has been marked delivered", time: "45 mins ago", icon: "✅" },
  { id: 3, type: "user-registered", title: "New Artisan Registered", desc: "Hasan Ansari created a seller profile", time: "2 hours ago", icon: "👤" },
  { id: 4, type: "review-added", title: "New Customer Review", desc: "A review was added to Royal Banarasi saree", time: "4 hours ago", icon: "⭐" },
  { id: 5, type: "coupon-used", title: "Coupon Applied", desc: "FESTIVE25 applied on checkout totaling ₹8,000", time: "5 hours ago", icon: "🎟️" },
  { id: 6, type: "product-updated", title: "Inventory Updated", desc: "Stock of Crimson Patola updated to 12 units", time: "1 day ago", icon: "🔄" },
];

const ActivityTimeline = () => {
  return (
    <div className="timeline-card">
      <div className="timeline-header">
        <h3>Recent Activity Timeline</h3>
        <span className="timeline-refresh-icon">🔄</span>
      </div>
      <div className="timeline-list">
        {MOCK_ACTIVITIES.map((act) => (
          <div key={act.id} className="timeline-item">
            <div className="timeline-left">
              <div className={`timeline-icon-dot ${act.type}`}>{act.icon}</div>
              <div className="timeline-vertical-connector"></div>
            </div>
            
            <div className="timeline-right">
              <div className="timeline-item-meta">
                <h4>{act.title}</h4>
                <span className="timeline-time">{act.time}</span>
              </div>
              <p className="timeline-desc">{act.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
