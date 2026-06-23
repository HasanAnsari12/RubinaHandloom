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

  <img
    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBldC_vhIUCWX0RRIKJOjJEWM1QvtJ7VGLG4BygQBm8Kfdo-Vh55ZHUaZVeS2KfY9fGh4Kr8-UQNGViqd_ohUgOEUz7pFwwtZnt7bL_tBdTqU4RY8Gz2uo7HnDPqqNP0QUtsrBHlwuk9nvciyukhz6P3cmaUk3sh4weXbgsDtEwmF2wPpDgwy8YZL8oMb3FcWPbxD2MpHwcTDDy9G0Oy8gatV7jCnu4QIy9Eg4z58Q69YKY6sX91_XyF-JwZZbsfIsJ9q2bdSELX2k"
    alt="Luxury Saree"
  />

  <div className="hero-text">

    {/* HEADING */}
    <h1>
  Timeless Elegance
  <br />
  Woven With Heritage
</h1>

    {/* SUBTITLE */}
    <p>
  Premium Chanderi, Silk, Cotton &
  Bridal Sarees crafted with timeless
  Indian artistry.
</p>

    {/* BUTTON */}
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
          <img
            src={
              product.images?.[0] ||
              "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
            }
            alt={product.title}
          />

          <div className="card-content">
            <h3>{product.title}</h3>
            <p className="category">{product.category}</p>
            <p className="price">₹{product.price}</p>
            <p className="stock">
              {product.stock} in stock
            </p>
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

      {/* FEATURES SECTION */}
      <section className="features">
        <div className="features-container">
          <div className="feature-box">
            <span className="icon">💎</span>
            <h4>Purity Guaranteed</h4>
            <p>Certified handloom textiles and authentic gold zari.</p>
          </div>

          <div className="feature-box">
            <span className="icon">📜</span>
            <h4>Heritage Artistry</h4>
            <p>Supporting 500+ master weavers across India.</p>
          </div>

          <div className="feature-box">
            <span className="icon">📦</span>
            <h4>Luxury Packaging</h4>
            <p>Sustainably crafted boxes with silk liners.</p>
          </div>

          <div className="feature-box">
            <span className="icon">🌍</span>
            <h4>Global Shipping</h4>
            <p>Insured international delivery to 50+ countries.</p>
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

    <div className="footer-box brand-box">

      <h2 className="footer-logo">
        Rubina Handloom Sarees
      </h2>

      <p className="footer-tagline">
        Timeless Elegance Woven With Heritage
      </p>

      <p>
        Premium Chanderi, Silk & Bridal Sarees
        handcrafted with timeless Indian
        artistry, luxury craftsmanship and
        cultural heritage.
      </p>

    </div>

    <div className="footer-box">
      <h3>Quick Links</h3>

      <a href="/">Home</a>
      <a href="/products">Shop</a>
      <a href="/wishlist">Wishlist</a>
      <a href="/account">My Account</a>
    </div>

    <div className="footer-box">
      <h3>Customer Service</h3>

      <a href="#">Shipping Policy</a>
      <a href="#">Returns & Refunds</a>
      <a href="#">Privacy Policy</a>
      <a href="#">Terms & Conditions</a>
    </div>

    <div className="footer-box">
      <h3>Contact Us</h3>

      <p>📧 support@rubinahandloom.com</p>
      <p>📞 +91 74705 07311</p>
      <p>📍 Chanderi, Madhya Pradesh</p>

      <div className="footer-social">
        <a href="#">📸 Instagram</a>
        <a href="#">📘 Facebook</a>
        <a
          href="https://wa.me/917470507311"
          target="_blank"
          rel="noreferrer"
        >
          💬 WhatsApp
        </a>
      </div>

    </div>

  </div>

  <div className="newsletter">

    <h3>Join Our Newsletter</h3>

    <p>
      Get exclusive offers, bridal collections,
      festive launches and premium discounts.
    </p>

    <div className="newsletter-form">

      <input
        type="email"
        placeholder="Enter your email address"
      />

      <button>
        Subscribe
      </button>

    </div>

  </div>

  <div className="footer-features">

    <div>🚚 Pan India Delivery</div>
    <div>🔒 Secure Payments</div>
    <div>⭐ Premium Quality Assured</div>

  </div>

  <div className="footer-bottom">

    <p>
      © 2026 Rubina Handloom Sarees.
      All Rights Reserved.
    </p>

  </div>

</footer>
    </>
  );
}

export default Home;