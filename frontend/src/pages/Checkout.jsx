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
      <button
        className="back-btn"
        onClick={() => navigate("/cart")}
      >
        ← Back To Cart
      </button>

      <div className="checkout-container">
        {/* Address */}
        <div className="checkout-left">
          <h2>📍 Select Delivery Address</h2>

          {addresses.length === 0 ? (
            <div className="no-address">
              <p>Please add a delivery address before checkout.</p>
              <button
                onClick={() => navigate("/account/address")}
              >
                Add Address
              </button>
            </div>
          ) : (
            addresses.map((address, index) => (
              <div
                key={index}
                className={`address-box ${
                  selectedAddress === index ? "active-address" : ""
                }`}
                onClick={() => setSelectedAddress(index)}
              >
                <h3>{address.fullName}</h3>
                <p>{address.phone}</p>
                <p>
                  {address.house}, {address.area}
                </p>
                <p>
                  {address.city}, {address.state}
                </p>
                <p>{address.pincode}</p>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="checkout-right">
          <h2>Order Summary</h2>

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

          <button
            className="payment-btn"
            onClick={handlePlaceOrder}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? "Processing Payment..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;