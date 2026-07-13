import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../services/productService";
import "./Home.css";

function Home({ searchTerm }) {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data.products || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <h2 className="loading">Loading products...</h2>;
  }

  if (error) {
    return <h2 className="error">{error}</h2>;
  }
// Home.jsx search filtering
const filteredProducts = products.filter((product) => {
  // Search Filter (agar searchTerm empty ho to sab products dikhen)
  const matchesSearch =
    !searchTerm ||
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase());

  // Category Filter (case-insensitive)
  const matchesCategory =
    selectedCategory === "All" ||
    product.category
      ?.toLowerCase()
      .includes(selectedCategory.toLowerCase());

  // Price Filter
  let matchesPrice = true;

  if (selectedPrice === "Under 2000") {
    matchesPrice = product.price < 2000;
  } else if (selectedPrice === "2000-5000") {
    matchesPrice =
      product.price >= 2000 &&
      product.price <= 5000;
  } else if (selectedPrice === "5000-10000") {
    matchesPrice =
      product.price > 5000 &&
      product.price <= 10000;
  } else if (selectedPrice === "Above 10000") {
    matchesPrice = product.price > 10000;
  }

  // Final Result
  return (
    matchesSearch &&
    matchesCategory &&
    matchesPrice
  );
});
const categories = [
  "All",
  "Banarasi",
  "Kanjivaram",
  "Bridal",
  "Cotton",
  "Silk",
];
const priceRanges = [
  "All",
  "Under 2000",
  "2000-5000",
  "5000-10000",
  "Above 10000",
];

  return (
    <>
      {/* HERO SECTION */}
     <section className="hero">
        <div className="hero-text">
          {/* HEADING */}
          <h1>
            Timeless Elegance
            <br />
            Woven With Heritage
          </h1>

          {/* SUBTITLE */}
          <p>
            Premium Chanderi, Silk, Cotton & Bridal Sarees crafted with timeless
            Indian artistry.
          </p>

          {/* BUTTONS */}
          <div className="hero-buttons">
            <button
              onClick={() => {
                document
                  .getElementById("featured-collection")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Shop Collection
            </button>

            <button
              className="outline-btn"
              onClick={() => {
                document
                  .querySelector(".story")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Explore Heritage
            </button>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBldC_vhIUCWX0RRIKJOjJEWM1QvtJ7VGLG4BygQBm8Kfdo-Vh55ZHUaZVeS2KfY9fGh4Kr8-UQNGViqd_ohUgOEUz7pFwwtZnt7bL_tBdTqU4RY8Gz2uo7HnDPqqNP0QUtsrBHlwuk9nvciyukhz6P3cmaUk3sh4weXbgsDtEwmF2wPpDgwy8YZL8oMb3FcWPbxD2MpHwcTDDy9G0Oy8gatV7jCnu4QIy9Eg4z58Q69YKY6sX91_XyF-JwZZbsfIsJ9q2bdSELX2k"
            alt="Luxury Saree"
          />
        </div>
      </section>


      {/* FEATURED COLLECTION */}
      {/* FEATURED COLLECTION */}
<section
  className="products"
  id="featured-collection"
>
  {/* Category Filters */}
  <div
    style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginBottom: "20px",
    }}
  >
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        style={{
          padding: "10px 18px",
          border: "none",
          borderRadius: "30px",
          cursor: "pointer",
          background:
            selectedCategory === category
              ? "#7b0f1a"
              : "#f3f3f3",
          color:
            selectedCategory === category
              ? "#fff"
              : "#333",
          fontWeight: "600",
        }}
      >
        {category}
      </button>
    ))}
  </div>

  {/* Price Filters */}
  <div
    style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginBottom: "30px",
    }}
  >
    {priceRanges.map((range) => (
      <button
        key={range}
        onClick={() => setSelectedPrice(range)}
        style={{
          padding: "10px 18px",
          border: "none",
          borderRadius: "30px",
          cursor: "pointer",
          background:
            selectedPrice === range
              ? "#111"
              : "#f3f3f3",
          color:
            selectedPrice === range
              ? "#fff"
              : "#333",
          fontWeight: "600",
        }}
      >
        {range === "All" ? "All Prices" : range}
      </button>
    ))}
  </div>

  <h2>Featured Collection</h2>

  <p className="subtitle">
    Handpicked premium sarees from our latest collection.
  </p>

  <div className="grid">
    {filteredProducts.map((product) => (
      <Link
        key={product._id}
        to={`/product/${product._id}`}
        className="product-link"
      >
        <div className="card">
          <div className="card-image-wrapper" style={{ position: "relative" }}>
            <img
              src={
                product.images?.[0] ||
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
              }
              alt={product.title}
            />
            {product.price > 5000 && (
              <span className="bestseller-badge">Bestseller</span>
            )}
          </div>

          <div className="card-content">
            <span className="category">{product.category}</span>
            <h3>{product.title}</h3>

            {product.rating > 0 && (
              <div className="card-rating">
                <span className="stars">{"★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating))}</span>
                <span className="rating-val">({product.rating})</span>
              </div>
            )}

            <div className="price-container">
              {product.discountPrice > 0 ? (
                <>
                  <span className="discount-price">₹{product.discountPrice}</span>
                  <span className="original-price struck">₹{product.price}</span>
                </>
              ) : (
                <span className="price">₹{product.price}</span>
              )}
            </div>

            <div className="card-footer">
              <span className={`stock-status ${product.stock === 0 ? "out-of-stock" : product.stock <= 3 ? "low-stock" : "in-stock"}`}>
                {product.stock === 0 ? "Out of Stock" : product.stock <= 3 ? `Only ${product.stock} left` : "In Stock"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>

</section>

      {/* BRIDAL SECTION */}
     <section className="bridal-section">
  <div className="bg-layer">

    {/* SAME IMAGE */}
    <img
      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSCci17qkYBO9j55uvYLzF8K1yCrLwk5c7xgS8G8gyniV4j44ttV5XJ2z9CsZduGWfqQfuZJVyN5MwBLCup6UzBID7Sw5psIGQXJmWaC1IAZpfji6dKpB6m_6DJEJ-k4r7FISsOpt9qhzOKWclfpjmx0Vx9WKZ66CbZGva3y3jk_OjuJzL2-UBguPb-iOTb4xZiINUBzWcCJXWHrSj7dVbsgFdvbdPOd5G41VGo-wkOwaqSq8huFroIhAvVDhvQyfsqXV8pmjnrG8"
      alt="Bridal Saree"
    />

    <div className="overlay"></div>
  </div>

  <div className="content">

    {/* SMALL TEXT */}
    <span>ROYAL WEDDING COLLECTION</span>

    {/* HEADING */}
    <h2>
      Crafted for Brides, <br />
      Inspired by Tradition
    </h2>

    {/* DESCRIPTION */}
    <p>
      Celebrate your special moments with our luxurious handloom Chanderi sarees.
      Designed with timeless elegance, rich heritage, and graceful craftsmanship,
      every saree reflects the beauty of Indian tradition and modern sophistication.
    </p>

    {/* BUTTON */}
    <button
      onClick={() => {
        const section =
          document.getElementById(
            "bridal-collection"
          );

        section?.scrollIntoView({
          behavior: "smooth",
        });
      }}
    >
      Explore Bridal Collection
    </button>

  </div>
</section>

      {/* FEATURES SECTION (Trust Bar) */}
      <section className="features">
        <div className="features-container">
          <div className="feature-box">
            <span className="icon">🚚</span>
            <h4>Free Shipping</h4>
            <p>Pan India delivery on all collections.</p>
          </div>

          <div className="feature-box">
            <span className="icon">🔒</span>
            <h4>Secure Payment</h4>
            <p>100% encrypted safe transactions.</p>
          </div>

          <div className="feature-box">
            <span className="icon">🔄</span>
            <h4>Easy Returns</h4>
            <p>Hassle-free returns & refunds policy.</p>
          </div>

          <div className="feature-box">
            <span className="icon">🧵</span>
            <h4>Authentic Handloom</h4>
            <p>Supporting 500+ master weavers across India.</p>
          </div>
        </div>
      </section>


      {/* STORY SECTION */}
      {/* STORY SECTION */}
<section className="story">
  <div className="story-container">

    {/* LEFT SIDE CONTENT */}
    <div className="story-text">
      <div className="box">

        <span>AUTHENTIC HANDLOOM HERITAGE</span>

        <h2>
          Bringing Timeless Handloom <br />
          Elegance to Every Woman
        </h2>

        <p>
          Rubina Handloom Saree is dedicated to preserving the beauty of authentic
          Indian handloom craftsmanship. Our collection features carefully selected
          Chanderi and traditional sarees that combine royal elegance with modern
          sophistication.
        </p>

        <p>
          Every saree reflects the artistry, dedication, and cultural heritage of
          skilled Indian weavers. From festive celebrations to weddings and special
          occasions, our sarees are designed to make every woman feel graceful,
          confident, and beautifully connected to tradition.
        </p>

        <p className="quote">
          "Every thread carries the legacy of Indian craftsmanship and timeless beauty."
        </p>

        {/* BUTTON */}
        <button
          onClick={() => {
            const extraText =
              document.getElementById("extra-story");

            if (
              extraText.style.display === "none"
            ) {
              extraText.style.display = "block";
            } else {
              extraText.style.display = "none";
            }
          }}
        >
          Read Our Heritage
        </button>
        

        {/* EXPANDED STORY */}
        <div
          id="extra-story"
          style={{
            display: "none",
            marginTop: "25px",
            lineHeight: "1.9",
            color: "#555",
            fontSize: "17px",
          }}
        >
          <p>
            At Rubina Handloom Saree, we believe handloom is more than fashion —
            it is a symbol of Indian culture, tradition, and artistry. Our mission
            is to bring premium-quality handloom sarees to women who appreciate
            elegance, authenticity, and timeless craftsmanship.
          </p>

          <p>
            We work to celebrate the beauty of Chanderi weaving by offering sarees
            that are lightweight, luxurious, and rich in detail. Every collection
            is inspired by India’s heritage while embracing modern style and grace.
          </p>

          <p>
            Through our journey, we proudly support skilled artisans and preserve
            the traditions of Indian weaving for future generations.
          </p>
        </div>

      </div>
    </div>

    {/* RIGHT SIDE IMAGE */}
    <div className="story-image">
      <div className="image-box">

        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_VB--lGDdyo6QIkoy1mdf-A6ObzdRgGgsk4wWn9cxXwCsei5TuSYqxzIt83w2QzqZNHczJyGbk9d5pPgcjYyVpt7wgIpdDYl2Ft-M42mIh9OiFhP5lRExDi9xh2hP38ZTamrnRub_BRaSW6Gm1Xwjaaz5FHJNd3-i7ohDmjCcFfnJpKZPBWHzoM51RoJ4pMiuaQpfjB8YjFnBTd6PlVHmxDAtjefZhtluq7b8Jp8ODvCXSBG-CZyh0f32arA8wwoBIT7iSbshaPA"
          alt="Our Story"
        />

        <div className="border-box"></div>

      </div>
    </div>

  </div>
</section>
{/* FLOATING WHATSAPP BUTTON */}

<a
  href="https://wa.me/917470507311"
  target="_blank"
  rel="noopener noreferrer"
  className="whatsapp-float"
>
  💬
</a>
      {/* FOOTER */}
      <footer className="footer">

  <div className="footer-container">

    {/* Column 1 — Brand */}
    <div className="footer-box brand-box">
      <h2 className="footer-logo">Rubina Handloom Sarees</h2>
      <p className="footer-tagline">Timeless Elegance Woven With Heritage</p>
      <p className="footer-desc">
        Premium Chanderi, Silk &amp; Bridal Sarees handcrafted with authentic Indian artistry.
      </p>
      <div className="footer-social">
        {/* Instagram */}
        <a href="#" aria-label="Instagram">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
        {/* Facebook */}
        <a href="#" aria-label="Facebook">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        {/* WhatsApp */}
        <a href="https://wa.me/917470507311" target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </div>

    {/* Column 2 — Quick Links */}
    <div className="footer-box">
      <h3>Quick Links</h3>
      <a href="/">Home</a>
      <a href="/products">Shop</a>
      <a href="/wishlist">Wishlist</a>
      <a href="/account">My Account</a>
    </div>

    {/* Column 3 — Customer Support */}
    <div className="footer-box">
      <h3>Customer Support</h3>
      <a href="#">Shipping Policy</a>
      <a href="#">Returns &amp; Refunds</a>
      <a href="#">Privacy Policy</a>
      <a href="#">Terms &amp; Conditions</a>
    </div>

    {/* Column 4 — Contact */}
    <div className="footer-box">
      <h3>Contact</h3>
      <div className="footer-contact-item">
        <span className="footer-contact-icon">✉</span>
        <span>support@rubinahandloom.com</span>
      </div>
      <div className="footer-contact-item">
        <span className="footer-contact-icon">☎</span>
        <span>+91 74705 07311</span>
      </div>
      <div className="footer-contact-item">
        <span className="footer-contact-icon">⊙</span>
        <span>Chanderi, Madhya Pradesh</span>
      </div>
    </div>

  </div>

  <div className="footer-bottom">
    © 2026 Rubina Handloom Sarees. All Rights Reserved.
  </div>

</footer>

    </>
  );
}

export default Home;