import React from "react";
import "./OrderTimeline.css";

const STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

const OrderTimeline = ({ currentStatus }) => {
  const normalized = String(currentStatus || "").trim();

  if (normalized === "Cancelled") {
    return (
      <div className="order-timeline-cancelled-banner">
        <span className="cancelled-symbol">🚫</span>
        <div className="cancelled-banner-text">
          <h4>Order Cancelled</h4>
          <p>This order has been voided. All associated stock items were returned back to inventory.</p>
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(normalized);

  return (
    <div className="order-timeline-stepper-container">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        
        let stepClass = "step-upcoming";
        if (isCompleted) stepClass = "step-completed";
        else if (isActive) stepClass = "step-active";

        return (
          <div key={step} className={`timeline-step-node ${stepClass}`}>
            <div className="step-marker-ring">
              {isCompleted ? "✓" : idx + 1}
            </div>
            <span className="step-label-text">{step}</span>
            {idx < STEPS.length - 1 && (
              <div className="step-line-divider"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
