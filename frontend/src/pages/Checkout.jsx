// frontend/src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const savedAddresses = JSON.parse(localStorage.getItem("addresses")) || [];

    setCartItems(cart);
    setAddresses(savedAddresses);

    // Auto-select first address if available
    if (savedAddresses.length > 0) {
      setSelectedAddress(0);
    }
  }, []);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  const shipping = subtotal > 0 ? 199 : 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (selectedAddress === null || !addresses[selectedAddress]) {
      toast.error("Please select a delivery address.");
      return;
    }

    setIsProcessingPayment(true);
    toast.info("Connecting to payment gateway...");

    // Mock payment processing delay (1.5 seconds)
    setTimeout(() => {
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      const deliveryAddress = addresses[selectedAddress];

      const newOrder = {
        id: "ORD-" + Date.now(),
        date: new Date().toLocaleDateString(),
        status: "Processing",
        total: total,
        items: cartItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
        products: cartItems,
        address: deliveryAddress,
      };

      orders.unshift(newOrder);
      localStorage.setItem("orders", JSON.stringify(orders));
      localStorage.removeItem("cart");

      toast.success("Payment Successful! Order placed. 🎉");
      setIsProcessingPayment(false);
      navigate("/order-success", { state: { orderId: newOrder.id } });
    }, 1500);
  };

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="checkout-header-content">
          <h1 className="checkout-title">Secure Checkout</h1>
          <p className="checkout-subtitle">Complete your order safely and securely.</p>
        </div>
      </header>

      <div className="checkout-trust-bar">
        <div className="trust-item">
          <span className="trust-icon">🔒</span> Secure Checkout
        </div>
        <div className="trust-item">
          <span className="trust-icon">🚚</span> Fast Delivery
        </div>
        <div className="trust-item">
          <span className="trust-icon">🧵</span> Authentic Handloom
        </div>
      </div>

      <div className="checkout-container">
        {/* Address */}
        <div className="checkout-left">
          <h2 className="section-title">Shipping Address</h2>

          {addresses.length === 0 ? (
            <div className="no-address">
              <p>Please add a delivery address before checkout.</p>
              <button
                className="add-address-btn"
                onClick={() => navigate("/account/address")}
              >
                Add Address
              </button>
            </div>
          ) : (
            <div className="address-grid">
              {addresses.map((address, index) => (
                <div
                  key={index}
                  className={`address-box ${
                    selectedAddress === index ? "active-address" : ""
                  }`}
                  onClick={() => setSelectedAddress(index)}
                >
                  <div className="address-header">
                    <span className="radio-indicator"></span>
                    <h3>{address.fullName}</h3>
                  </div>
                  <div className="address-details">
                    <p className="phone-number">{address.phone}</p>
                    <p className="address-lines">
                      {address.house}, {address.area}<br />
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="checkout-right">
          <h2 className="section-title">Order Summary</h2>

          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{shipping}</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div className="checkout-actions">
            <button
              className="payment-btn"
              onClick={handlePlaceOrder}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? "Placing Order..." : "Place Order"}
            </button>

            <button
              className="back-btn"
              onClick={() => navigate("/cart")}
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;