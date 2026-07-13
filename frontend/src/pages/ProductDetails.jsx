// frontend/src/pages/ProductDetails.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productService";
import "./ProductDetails.css";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const { cart, wishlist, addToCart, addToWishlist, removeFromWishlist } = useAppContext();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        const fetchedProduct = data.product;

        setProduct(fetchedProduct);

        // First image ko default selected image banao
        setSelectedImage(
          fetchedProduct.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load product details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const alreadyExists = cart.find(
      (item) => item._id === product._id
    );

    if (alreadyExists) {
      toast.info("Already in cart!");
      return;
    }

    try {
      await addToCart(product, quantity);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart.");
    }
  };

  const handleBuyNow = async () => {
    const alreadyExists = cart.find(
      (item) => item._id === product._id
    );

    if (!alreadyExists) {
      try {
        await addToCart(product, quantity);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to add to cart.");
        return;
      }
    }
    navigate("/checkout");
  };

  const handleShareProduct = async () => {
    const productUrl = window.location.href;
    const shareData = {
      title: product.title,
      text: `Check out this beautiful saree: ${product.title}`,
      url: productUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);
        alert("Product link copied to clipboard!");
      } catch (err) {
        console.log("Clipboard error:", err);
        alert("Unable to copy link.");
      }
    }
  };

  const handleWishlist = async () => {
    const alreadyExists = wishlist.find(
      (item) => item._id === product._id
    );

    try {
      if (alreadyExists) {
        await removeFromWishlist(product._id);
        toast.success("Removed from wishlist!");
      } else {
        await addToWishlist(product);
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error("Failed to update wishlist.");
    }
  };

  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      rating: 5,
      comment:
        "Absolutely stunning saree. The fabric quality is exceptional and the craftsmanship is beautiful.",
    },
    {
      id: 2,
      name: "Anjali Verma",
      rating: 4,
      comment:
        "Elegant design and premium feel. Perfect for weddings and festive occasions.",
    },
    {
      id: 3,
      name: "Neha Kapoor",
      rating: 5,
      comment:
        "Exceeded my expectations. Rich colors and luxurious texture.",
    },
  ];

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-state-wrap">
          <h2 className="pd-loading">Loading product...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pd-page">
        <div className="pd-state-wrap">
          <h2 className="pd-error">{error}</h2>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const hasDiscount = product.discountPrice > 0;
  const hasRating = product.rating > 0;

  return (
    <div className="pd-page">

      {/* ── Page Header: Back Navigation ── */}
      <div className="pd-page-header">
        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className="pd-breadcrumb__sep">/</span>
          <a href="/products">Products</a>
          <span className="pd-breadcrumb__sep">/</span>
          <span className="pd-breadcrumb__current">{product.title}</span>
        </nav>
      </div>

      {/* ── Main Product Layout ── */}
      <div className="pd-container">

        {/* Left — Image Gallery */}
        <div className="pd-image-section">
          <div className="pd-main-image-wrap">
            <img
              src={selectedImage}
              alt={product.title}
              className="pd-main-image"
            />
            {isOutOfStock && (
              <span className="pd-image-badge pd-image-badge--oos">Out of Stock</span>
            )}
            {!isOutOfStock && isLowStock && (
              <span className="pd-image-badge pd-image-badge--low">Only {product.stock} left</span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="pd-thumbnails">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`${product.title} view ${index + 1}`}
                  className={selectedImage === img.url ? "pd-thumbnail active" : "pd-thumbnail"}
                  onClick={() => setSelectedImage(img.url)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right — Product Information */}
        <div className="pd-info-section">

          {/* 1. Category */}
          {product.category && (
            <span className="pd-category-badge">{product.category}</span>
          )}

          {/* 2. Title */}
          <h1 className="pd-title">{product.title}</h1>

          {/* 3. Rating — real data from product.rating */}
          {hasRating && (
            <div className="pd-rating">
              <span className="pd-rating__stars" aria-label={`Rating: ${product.rating} out of 5`}>
                {"★".repeat(Math.round(product.rating))}
                {"☆".repeat(5 - Math.round(product.rating))}
              </span>
              <span className="pd-rating__val">{product.rating} / 5</span>
            </div>
          )}

          {/* 4. Price */}
          <div className="pd-price-row">
            {hasDiscount ? (
              <>
                <span className="pd-price pd-price--discount">
                  ₹{product.discountPrice.toLocaleString("en-IN")}
                </span>
                <span className="pd-price pd-price--original">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </>
            ) : (
              <span className="pd-price">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* 5. Stock Status */}
          <div className="pd-stock-row">
            {isOutOfStock ? (
              <span className="pd-stock pd-stock--oos">Out of Stock</span>
            ) : isLowStock ? (
              <span className="pd-stock pd-stock--low">⚡ Only {product.stock} left</span>
            ) : (
              <span className="pd-stock pd-stock--in">✓ In Stock ({product.stock} available)</span>
            )}
          </div>

          {/* 6. Description */}
          <p className="pd-description">{product.description}</p>

          <div className="pd-divider" />

          {/* 7. Quantity Stepper */}
          <div className="pd-quantity-row">
            <span className="pd-quantity-label">Quantity</span>
            <div className="pd-quantity">
              <button
                className="pd-qty-btn"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >−</button>
              <span className="pd-qty-val">{quantity}</span>
              <button
                className="pd-qty-btn"
                onClick={() => setQuantity(q => q + 1)}
                aria-label="Increase quantity"
              >+</button>
            </div>
          </div>

          {/* 8. Primary Actions */}
          <div className="pd-action-group">
            <button
              onClick={handleAddToCart}
              className="pd-btn pd-btn--cart"
              disabled={isOutOfStock}
            >
              🛒 Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="pd-btn pd-btn--buy"
              disabled={isOutOfStock}
            >
              Buy Now
            </button>
          </div>

          {/* 9. Secondary Actions */}
          <div className="pd-secondary-actions">
            <button onClick={handleWishlist} className="pd-btn pd-btn--wishlist">
              ♡ Wishlist
            </button>
            <button onClick={handleShareProduct} className="pd-btn pd-btn--share">
              ↗ Share
            </button>
          </div>

          {/* 10. Trust Features */}
          <div className="pd-features">
            <div className="pd-feature-item">
              <span className="pd-feature-icon">🚚</span>
              <span>Free Delivery</span>
            </div>
            <div className="pd-feature-item">
              <span className="pd-feature-icon">🔒</span>
              <span>Secure Checkout</span>
            </div>
            <div className="pd-feature-item">
              <span className="pd-feature-icon">💎</span>
              <span>Premium Quality</span>
            </div>
          </div>

        </div>
      </div>

      {/* Customer Reviews */}
      <section className="pd-reviews">
        <h2 className="pd-reviews__title">Customer Reviews</h2>
        <div className="pd-reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="pd-review-card">
              <div className="pd-review-stars" aria-label={`${review.rating} stars`}>
                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
              </div>
              <h4 className="pd-review-name">{review.name}</h4>
              <p className="pd-review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default ProductDetails;