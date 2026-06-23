// OrderSuccess.jsx
// Math.random() par VS Code warning aa rahi ho to
// simple fixed order number use kar lo.

import { Link, useLocation } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();
  const orderNumber = location.state?.orderId || "ORD-123456";

  return (
    <div className="order-success-page">
      {/* Hero Section */}
      <section className="order-success-hero">
        <div className="success-icon">✅</div>

        <h1>Order Placed Successfully!</h1>

        <p>
          Thank you for choosing our handcrafted sarees.
          Your order has been confirmed and will be prepared
          with care.
        </p>
      </section>

      {/* Success Card */}
      <section className="order-success-container">
        <div className="order-success-card">
          <h2>Your Order is Confirmed</h2>

          <div className="order-number">
            Order Number: <strong>{orderNumber}</strong>
          </div>

          <p className="order-message">
            Our artisans and fulfillment team are preparing
            your order in our signature luxury packaging.
          </p>

          <div className="order-actions">
            <Link
              to="/"
              className="continue-shopping-btn"
            >
              Continue Shopping
            </Link>

            <Link
              to="/orders"
              className="view-orders-btn"
            >
              View Orders
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OrderSuccess;