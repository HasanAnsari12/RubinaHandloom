// frontend/src/pages/ProductDetails.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productService";
import "./ProductDetails.css";
import { toast } from "react-toastify";
function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        const fetchedProduct = data.product;

        setProduct(fetchedProduct);

        // First image ko default selected image banao
        setSelectedImage(
          fetchedProduct.images?.[0] ||
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

  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyExists = existingCart.find(
      (item) => item._id === product._id
    );

    if (alreadyExists) {
      toast.info("Already in cart!");
      return;
    }

    existingCart.push({ ...product, quantity });
    localStorage.setItem("cart", JSON.stringify(existingCart));
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyExists = existingCart.find(
      (item) => item._id === product._id
    );

    if (!alreadyExists) {
      existingCart.push({ ...product, quantity });
      localStorage.setItem("cart", JSON.stringify(existingCart));
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

  const handleWishlist = () => {
    const existingWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const alreadyExists = existingWishlist.find(
      (item) => item._id === product._id
    );

    if (alreadyExists) {
      const updatedWishlist = existingWishlist.filter(
        (item) => item._id !== product._id
      );
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      toast.success("Removed from wishlist!");
    } else {
      existingWishlist.push(product);
      localStorage.setItem("wishlist", JSON.stringify(existingWishlist));
      toast.success("Added to wishlist!");
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
    return <h2 className="pd-loading">Loading product...</h2>;
  }

  if (error) {
    return <h2 className="pd-error">{error}</h2>;
  }

  return (
    <div className="pd-page">

    <button
  className="pd-back-btn"
  onClick={() => navigate(-1)}
>
  ← Back
</button>
      <div className="pd-container">
        {/* Left Side - Product Image Gallery */}
        <div className="pd-image-section">
          {/* Main Image */}
          <img
            src={selectedImage}
            alt={product.title}
            className="pd-main-image"
          />

          {/* Thumbnail Images */}
          <div className="pd-thumbnails">
            {product.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.title} ${index + 1}`}
                className={
                  selectedImage === img
                    ? "pd-thumbnail active"
                    : "pd-thumbnail"
                }
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="pd-info-section">
          <span className="pd-category-badge">
            {product.category}
          </span>

          <h1 className="pd-title">{product.title}</h1>

          <div className="pd-price">
            ₹{product.price}
          </div>
          <div className="pd-rating">
  ⭐⭐⭐⭐⭐
  <span>(4.8 Rating)</span>
</div>

          <div className="pd-stock">
            In Stock: {product.stock}
          </div>

          <p className="pd-description">
            {product.description}
          </p>
            <div className="pd-quantity">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="pd-add-to-cart-btn"
            >
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="pd-buy-btn"
            >
              Buy Now
            </button>

            <button
              onClick={handleShareProduct}
              className="pd-share-btn"
            >
              📤 Share Product
            </button>
            
            <button
              onClick={handleWishlist}
              className="pd-wishlist-btn"
            >
              ❤️ Add to Wishlist
            </button>
<div className="pd-features">

  <div>🚚 Free Delivery</div>

  <div>🔒 Secure Checkout</div>

  <div>💎 Premium Quality</div>

</div>
        </div>
      </div>

      {/* Customer Reviews */}
      <section className="pd-reviews">
        <h2>Customer Reviews</h2>

        <div className="pd-reviews-grid">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="pd-review-card"
            >
              <div className="pd-review-stars">
                {"⭐".repeat(review.rating)}
              </div>

              <h4>{review.name}</h4>

              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}

export default ProductDetails;