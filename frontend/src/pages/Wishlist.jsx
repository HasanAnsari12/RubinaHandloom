// frontend/src/pages/Wishlist.jsx

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import "./Wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useAppContext();

  // Remove product from wishlist
  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toast.success("Removed from wishlist!");
    } catch (err) {
      toast.error("Failed to remove item.");
    }
  };

  // Empty Wishlist UI
  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        {/* Compact Page Header */}
        <div className="wishlist-page-header">
          <div className="wishlist-header__left">
            <h1 className="wishlist-header__title">My Wishlist</h1>
            <p className="wishlist-header__sub">
              Your saved favourites, ready whenever you are.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="wishlist-container">
          <div className="wishlist-empty">
            <div className="wishlist-empty__icon" aria-hidden="true">♡</div>
            <h2 className="wishlist-empty__title">Your wishlist is empty</h2>
            <p className="wishlist-empty__sub">
              Explore our collection and save pieces you love.
            </p>
            <Link to="/products" className="wishlist-cta-btn">
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {/* Compact Page Header */}
      <div className="wishlist-page-header">
        <div className="wishlist-header__left">
          <h1 className="wishlist-header__title">
            My Wishlist
            <span className="wishlist-header__count">
              {wishlist.length}
            </span>
          </h1>
          <p className="wishlist-header__sub">
            Your saved favourites, ready whenever you are.
          </p>
        </div>
        <Link to="/products" className="wishlist-cta-btn wishlist-cta-btn--sm">
          Continue Shopping
        </Link>
      </div>

      {/* Wishlist Grid */}
      <div className="wishlist-container">
        <div className="wishlist-grid">
          {wishlist.map((item) => {
            const isOutOfStock = item.stock === 0;
            const isLowStock = item.stock > 0 && item.stock <= 3;
            const hasDiscount = item.discountPrice > 0;

            return (
              <div key={item._id} className="wishlist-card">
                {/* Image */}
                <div className="wishlist-image-wrap">
                  <img
                    src={
                      item.images?.[0]?.url ||
                      item.image ||
                      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={item.title}
                    className="wishlist-image"
                    loading="lazy"
                  />
                  {isOutOfStock && (
                    <span className="wishlist-badge wishlist-badge--oos">Out of Stock</span>
                  )}
                  {!isOutOfStock && isLowStock && (
                    <span className="wishlist-badge wishlist-badge--low">Only {item.stock} left</span>
                  )}
                </div>

                {/* Content */}
                <div className="wishlist-content">
                  {/* Category */}
                  {item.category && (
                    <span className="wishlist-category">{item.category}</span>
                  )}

                  {/* Title */}
                  <h2 className="wishlist-title">{item.title}</h2>

                  {/* Price */}
                  <div className="wishlist-price-row">
                    {hasDiscount ? (
                      <>
                        <span className="wishlist-price wishlist-price--discount">
                          ₹{item.discountPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="wishlist-price wishlist-price--original">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      </>
                    ) : (
                      <span className="wishlist-price">
                        ₹{item.price?.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  {item.stock !== undefined && (
                    <span className={`wishlist-stock${isOutOfStock ? " wishlist-stock--oos" : isLowStock ? " wishlist-stock--low" : ""}`}>
                      {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${item.stock} left` : "In Stock"}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="wishlist-actions">
                    <Link
                      to={`/product/${item._id}`}
                      className="wishlist-btn wishlist-btn--view"
                    >
                      View Product
                    </Link>
                    <button
                      className="wishlist-btn wishlist-btn--remove"
                      onClick={() => handleRemove(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping — directly below grid */}
        <div className="wishlist-footer">
          <Link to="/products" className="wishlist-cta-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;