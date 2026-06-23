// frontend/src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
 const navigate = useNavigate();
  // Load cart from localStorage
  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  }, []);

  // Save cart to localStorage
  const updateCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  };

  // Increase quantity
  const increaseQuantity = (productId) => {
    const updatedCart = cartItems.map((item) =>
      item._id === productId
        ? {
            ...item,
            quantity: (item.quantity || 1) + 1,
          }
        : item
    );

    updateCart(updatedCart);
  };

  // Decrease quantity
  const decreaseQuantity = (productId) => {
    const updatedCart = cartItems
      .map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: Math.max(
                1,
                (item.quantity || 1) - 1
              ),
            }
          : item
      );

    updateCart(updatedCart);
  };

  // Remove item
  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(
      (item) => item._id !== productId
    );

    updateCart(updatedCart);
toast.error(
  "item removed frome card."
);  };

  // Calculations
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      item.price * (item.quantity || 1),
    0
  );

  const shipping = subtotal > 0 ? 199 : 0;
  const grandTotal = subtotal + shipping;

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="cart-empty">
          <h1>Your Cart is Empty 🛒</h1>
          <p>
            Explore our premium saree collection and add your favorites.
          </p>
          <Link
            to="/"
            className="continue-shopping-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <section className="cart-container">
        {/* Left Side - Cart Items */}
        <div className="cart-items">
          <h1>Shopping Cart</h1>
          <p className="cart-count">
            {cartItems.length} Item
            {cartItems.length > 1 ? "s" : ""}
          </p>

          {cartItems.map((item) => (
            <div
              key={item._id}
              className="cart-card"
            >
              <img
                src={
                  item.images?.[0] ||
                  item.image ||
                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                }
                alt={item.title}
                className="cart-image"
              />

              <div className="cart-content">
                <h2>{item.title}</h2>
                <p className="cart-category">
                  {item.category}
                </p>
                <p className="cart-price">
                  ₹{item.price}
                </p>

                {/* Quantity Controls */}
                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      decreaseQuantity(item._id)
                    }
                  >
                    −
                  </button>

                  <span>
                    {item.quantity || 1}
                  </span>

                  <button
                    onClick={() =>
                      increaseQuantity(item._id)
                    }
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  className="remove-btn"
                  onClick={() =>
                    removeItem(item._id)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Summary */}
        <div className="cart-summary">
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
            <span>₹{grandTotal}</span>
          </div>

          <Link
            to="/checkout"
            className="checkout-btn"
          >
            Proceed to Checkout
          </Link>

          <Link
            to="/"
            className="continue-shopping-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Cart;