// src/components/ProductCard.jsx

import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const hasDiscount = product.discountPrice > 0;
  const hasRating = product.rating > 0;

  const getProductImage = () => {
    const firstImg = product.images?.[0];
    if (typeof firstImg === "string") return firstImg;
    if (firstImg?.url) return firstImg.url;
    if (product.image) return product.image;
    return "/images/saree1.jpg";
  };

  return (
    <div className={`product-card${isOutOfStock ? " product-card--oos" : ""}`}>

      {/* ── Image Zone ── */}
      <div className="product-card__image-wrap">
        <img
          src={getProductImage()}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.getAttribute("data-fallback") !== "true") {
              e.currentTarget.setAttribute("data-fallback", "true");
              e.currentTarget.src = "/images/saree1.jpg";
            }
          }}
        />

        {/* Overlay badges on image */}
        {isOutOfStock && (
          <span className="product-card__badge product-card__badge--oos">Out of Stock</span>
        )}
        {!isOutOfStock && isLowStock && (
          <span className="product-card__badge product-card__badge--low">Only {product.stock} left</span>
        )}
      </div>

      {/* ── Content Zone ── */}
      <div className="product-card__content">

        {/* Category chip */}
        {product.category && (
          <span className="product-card__category">{product.category}</span>
        )}

        {/* Product Name */}
        <h3 className="product-card__title">{product.title}</h3>

        {/* Star Rating */}
        {hasRating && (
          <div className="product-card__rating">
            <span className="product-card__stars" aria-label={`Rating: ${product.rating} out of 5`}>
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
            <span className="product-card__rating-val">({product.rating})</span>
          </div>
        )}

        {/* Price Block */}
        <div className="product-card__price-row">
          {hasDiscount ? (
            <>
              <span className="product-card__price product-card__price--discount">
                ₹{product.discountPrice.toLocaleString("en-IN")}
              </span>
              <span className="product-card__price product-card__price--original">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            </>
          ) : (
            <span className="product-card__price">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && !isOutOfStock && (
          <span className={`product-card__stock${isLowStock ? " product-card__stock--low" : ""}`}>
            {isLowStock ? `Only ${product.stock} left` : "In Stock"}
          </span>
        )}

      </div>

      {/* ── CTA ── */}
      <div className="product-card__cta">
        <Link
          to={`/product/${product.id || product._id}`}
          className={`product-card__btn${isOutOfStock ? " product-card__btn--disabled" : ""}`}
          aria-disabled={isOutOfStock}
          tabIndex={isOutOfStock ? -1 : 0}
        >
          {isOutOfStock ? "Notify Me" : "View Details"}
        </Link>
      </div>

    </div>
  );
}

export default ProductCard;