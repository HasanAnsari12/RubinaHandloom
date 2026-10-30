// frontend/src/pages/Cart.jsx
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import "./Cart.css";

function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useAppContext();

  // Increase quantity
  const increaseQuantity = async (productId) => {
    const item = cart.find((i) => i._id === productId);
    if (item) {
      try {
        await updateQuantity(productId, (item.quantity || 1) + 1);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update quantity.");
      }
    }
  };

  // Decrease quantity
  const decreaseQuantity = async (productId) => {
    const item = cart.find((i) => i._id === productId);
    if (item) {
      try {
        await updateQuantity(productId, Math.max(1, (item.quantity || 1) - 1));
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update quantity.");
      }
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.error("Item removed from cart.");
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  // Calculations
  const shipping = 0;
  const grandTotal = cartTotal + shipping;

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="cart-page">
        {/* Compact Header */}
        <div className="cart-page-header">
          <div className="cart-header__left">
            <h1 className="cart-header__title">Shopping Cart</h1>
            <p className="cart-header__sub">
              Review your selected sarees before checkout.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="cart-body">
          <div className="cart-empty">
            <div className="cart-empty__icon" aria-hidden="true">🛒</div>
            <h2 className="cart-empty__title">Your cart is empty</h2>
            <p className="cart-empty__sub">
              Explore our premium saree collection and add your favourites.
            </p>
            <Link to="/products" className="cart-cta-btn">
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Compact Header */}
      <div className="cart-page-header">
        <div className="cart-header__left">
          <h1 className="cart-header__title">
            Shopping Cart
            <span className="cart-header__count">{cart.length}</span>
          </h1>
          <p className="cart-header__sub">
            Review your selected sarees before checkout.
          </p>
        </div>
        <Link to="/products" className="cart-cta-btn cart-cta-btn--sm">
          Continue Shopping
        </Link>
      </div>

      {/* Main Layout: 70% Items / 30% Summary */}
      <div className="cart-body">
        <div className="cart-layout">
          {/* Left — Cart Items (70%) */}
          <div className="cart-items">
            {cart.map((item) => {
              const itemTotal = item.price * (item.quantity || 1);
              const isLowStock = item.stock > 0 && item.stock <= 3;
              const isOutOfStock = item.stock === 0;

              return (
                <div key={item._id} className="cart-card">
                  {/* Product Image */}
                  <div className="cart-image-wrap">
                    <img
                      src={
                        (typeof item.images?.[0] === "string" ? item.images[0] : item.images?.[0]?.url) ||
                        item.image ||
                        "/images/saree1.jpg"
                      }
                      alt={item.title}
                      className="cart-image"
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.getAttribute("data-fallback") !== "true") {
                          e.currentTarget.setAttribute("data-fallback", "true");
                          e.currentTarget.src = "/images/saree1.jpg";
                        }
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="cart-content">
                    {/* Category */}
                    {item.category && (
                      <span className="cart-category">{item.category}</span>
                    )}

                    {/* Title */}
                    <h2 className="cart-title">{item.title}</h2>

                    {/* Price */}
                    <p className="cart-price">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </p>

                    {/* Stock status */}
                    {item.stock !== undefined && (
                      <span className={`cart-stock${isOutOfStock ? " cart-stock--oos" : isLowStock ? " cart-stock--low" : ""}`}>
                        {isOutOfStock
                          ? "Out of Stock"
                          : isLowStock
                          ? `Only ${item.stock} left`
                          : "In Stock"}
                      </span>
                    )}

                    {/* Bottom row: quantity + item total + remove */}
                    <div className="cart-card-footer">
                      <div className="quantity-controls">
                        <button
                          className="qty-btn"
                          onClick={() => decreaseQuantity(item._id)}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="qty-val">{item.quantity || 1}</span>
                        <button
                          className="qty-btn"
                          onClick={() => increaseQuantity(item._id)}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>

                      <span className="cart-item-total">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </span>

                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right — Order Summary (30%) */}
          <div className="cart-summary">
            <h2 className="cart-summary__title">Order Summary</h2>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal ({cart.length} item{cart.length > 1 ? "s" : ""})</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="summary-shipping">
                  {shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}
                </span>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            <p className="summary-tax-note">Inclusive of all taxes</p>

            <Link to="/checkout" className="cart-checkout-btn">
              Proceed to Checkout
            </Link>

            <Link to="/products" className="cart-continue-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;