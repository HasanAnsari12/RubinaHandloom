// frontend/src/pages/Wishlist.jsx

import { useEffect, useState } from "react";
import "./Wishlist.css";
import { Link, useNavigate } from "react-router-dom";

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
const navigate = useNavigate();


  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist =
      JSON.parse(localStorage.getItem("wishlist")) || [];

    setWishlistItems(savedWishlist);
  }, []);

  // Remove product from wishlist
  const handleRemove = (productId) => {
    const updatedWishlist = wishlistItems.filter(
      (item) => item._id !== productId
    );

    // Update localStorage
    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );

    // Update state
    setWishlistItems(updatedWishlist);

    alert("Removed from wishlist!");
  };

  // Empty Wishlist UI
  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">

        <button
  className="back-btn"
  onClick={() => navigate(-1)}
>
  ← Back
</button>
        <section className="wishlist-hero">
          <h1>My Wishlist</h1>
          <p>
            Save your most loved sarees and revisit them anytime.
          </p>
        </section>

        <section className="wishlist-container">
          <div className="wishlist-empty">
            <h2>Your wishlist is empty ❤️</h2>
            <p>
              Start exploring our premium saree collection.
            </p>

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

  return (
    <div className="wishlist-page">
      <button
  className="back-btn"
  onClick={() => navigate(-1)}
>
  ←  Back 
</button>
      {/* Hero Section */}
      <section className="wishlist-hero">
        <h1>My Wishlist</h1>
        <p>
          Save your most loved sarees and revisit them anytime.
        </p>

        <span className="wishlist-count">
          {wishlistItems.length} Item
          {wishlistItems.length > 1 ? "s" : ""}
        </span>
      </section>

      {/* Wishlist Grid */}
      <section className="wishlist-container">
        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="wishlist-card"
            >
              <img
                src={
                  item.images?.[0] ||
                  item.image ||
                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                }
                alt={item.title}
                className="wishlist-image"
              />

              <div className="wishlist-content">
                <h2>{item.title}</h2>

                <p className="wishlist-price">
                  ₹{item.price}
                </p>

                <div className="wishlist-actions">
                  {/* View Product */}
                  <Link
                    to={`/product/${item._id}`}
                    className="move-to-cart-btn"
                  >
                    View Product
                  </Link>

                  {/* Remove */}
                  <button
                    className="remove-btn"
                    onClick={() =>
                      handleRemove(item._id)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="wishlist-footer">
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

export default Wishlist;