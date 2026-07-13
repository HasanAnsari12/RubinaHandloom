// frontend/src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import { placeOrder as apiPlaceOrder } from "../services/orderService";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useAppContext();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const savedAddresses = JSON.parse(localStorage.getItem("addresses")) || [];
    setAddresses(savedAddresses);

    // Auto-select first address if available
    if (savedAddresses.length > 0) {
      setSelectedAddress(0);
    }
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  const shipping = subtotal > 0 ? 199 : 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (selectedAddress === null || !addresses[selectedAddress]) {
      toast.error("Please select a delivery address.");
      return;
    }

    setIsProcessingPayment(true);
    toast.info("Processing your order...");

    const deliveryAddress = addresses[selectedAddress];

    // Build the request body for the backend placeOrder route
    const orderData = {
      shippingAddress: {
        fullName: deliveryAddress.fullName || deliveryAddress.name,
        phone: deliveryAddress.phone,
        house: deliveryAddress.house || deliveryAddress.flat || deliveryAddress.addressLine1,
        area: deliveryAddress.area || deliveryAddress.street || deliveryAddress.addressLine2,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode || deliveryAddress.zipCode,
      },
      paymentMethod: "COD", // Defaulting to Cash on Delivery for test connection
    };

    try {
      const response = await apiPlaceOrder(orderData);
      
      if (response.success) {
        // Clear local and database cart state
        await clearCart();
        toast.success("Order placed successfully! 🎉");
        navigate("/order-success", { state: { orderId: response.order._id || response.order.id } });
      } else {
        toast.error(response.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Failed to submit order:", err);
      toast.error(err.response?.data?.message || "Payment or stock verification failed.");
    } finally {
      setIsProcessingPayment(false);
    }
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