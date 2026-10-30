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

  const categoryMappings = {
    "Chanderi Silk": ["chanderi silk", "chanderi"],
    "Cotton Silk": ["cotton silk"],
    "Pattu Silk": ["pattu silk"],
    "Tissue": ["tissue"],
    "Antique Entice": ["antique entice"],
    "Bridal": ["bridal"],
  };

  const categories = [
    "All",
    "Chanderi Silk",
    "Cotton Silk",
    "Pattu Silk",
    
    "Entice Tissue",
    "Bridal",
  ];

  const priceRanges = [
    "All",
    "Under 2000",
    "2000-5000",
    "5000-10000",
    "Above 10000",
  ];

  // Home.jsx search filtering
  const filteredProducts = products.filter((product) => {
    // Search Filter (agar searchTerm empty ho to sab products dikhen)
    const matchesSearch =
      !searchTerm ||
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category Filter (case-insensitive with safe display mapping)
    const matchesCategory =
      selectedCategory === "All" ||
      (categoryMappings[selectedCategory]
        ? categoryMappings[selectedCategory].some(
            (mapped) =>
              product.category?.toLowerCase() === mapped ||
              product.category?.toLowerCase().includes(mapped)
          )
        : product.category
            ?.toLowerCase()
            .includes(selectedCategory.toLowerCase()));

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
            Premium Chanderi Silk Sarees & Suits,Bridal Sarees crafted with timeless
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
            src="/images/hero-blue-chanderi-saree.png"
            alt="Woman wearing blue Chanderi silk saree with golden border and floral motifs"
            style={{ objectFit: "contain", objectPosition: "center top" }}
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
        onClick={() => setSelectedCategory(selectedCategory === category ? "All" : category)}
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
                product.images?.[0]?.url ||
                (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
                product.image ||
                "/images/saree1.jpg"
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

    {/* Red Saree Pallu - User Supplied Photograph */}
    <img
      src="/images/bridal-red-saree-pallu.jpg"
      alt="Red silk saree with golden pallu and intricate wave border patterns"
      style={{ objectFit: "cover", objectPosition: "center" }}
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
          SRK Handloom is dedicated to preserving the beauty of authentic
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
            At SRK Handloom, we believe handloom is more than fashion —
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
  href="https://wa.me/917000438132"
  target="_blank"
  rel="noopener noreferrer"
  className="whatsapp-float"
  aria-label="Chat with SRK Handloom on WhatsApp"
>
  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
</a>
      {/* FOOTER */}
      <footer className="footer">

  <div className="footer-container">

    {/* Column 1 — Brand */}
    <div className="footer-box brand-box">
      <h2 className="footer-logo">SRK Handloom</h2>
      <p className="footer-tagline">Timeless Elegance Woven With Heritage</p>
      <p className="footer-desc">
        Premium Chanderi, Silk &amp; Bridal Sarees handcrafted with authentic Indian artistry.
      </p>
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
        <span>asarik782@gmail.com</span>
      </div>
      <div className="footer-contact-item">
        <span className="footer-contact-icon">☎</span>
        <span>+91 7000438132</span>
      </div>
      <div className="footer-contact-item">
        <span className="footer-contact-icon">⊙</span>
        <span> Baher Sahar Ward no. 16 Chanderi Dist Ashok Nagar, Madhya Pradesh</span>
      </div>

      {/* Social Media Brand Icons */}
      <div className="footer-social" style={{ marginTop: "16px" }}>
        {/* Instagram */}
        <a
          href="https://www.instagram.com/luxuriouse_boutique?exln=MTBvdnlwMGJ1M3J5bQ=="
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit SRK Handloom on Instagram"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>

        {/* YouTube */}
        <a
          href="https://youtube.com/@srk_handloom?si=WdMk0xoIxg0WVgnQ"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit SRK Handloom on YouTube"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>

        {/* X (formerly Twitter) */}
        <a
          href="https://x.com/hathdraha"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit SRK Handloom on X"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/917000438132"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with SRK Handloom on WhatsApp"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        {/* Pinterest */}
        <a
          href="https://pin.it/6YdTY3unI"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit SRK Handloom on Pinterest"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0a12 12 0 0 0-4.37 23.18c-.07-.94-.13-2.39.03-3.42l1.16-4.94s-.29-.6-.29-1.48c0-1.39.81-2.43 1.81-2.43.85 0 1.26.64 1.26 1.41 0 .86-.55 2.14-.83 3.33-.24 1 .5 1.82 1.48 1.82 1.78 0 3.15-1.88 3.15-4.58 0-2.4-1.72-4.07-4.18-4.07-2.85 0-4.52 2.14-4.52 4.35 0 .86.33 1.79.74 2.29.08.1.09.19.07.29-.08.31-.25 1.03-.29 1.17-.05.19-.16.23-.37.14-1.38-.64-2.24-2.66-2.24-4.28 0-3.48 2.53-6.68 7.3-6.68 3.83 0 6.81 2.73 6.81 6.38 0 3.81-2.4 6.88-5.73 6.88-1.12 0-2.17-.58-2.53-1.27l-.69 2.63c-.25.96-.92 2.16-1.37 2.89A12 12 0 1 0 12 0z"/>
          </svg>
        </a>
      </div>
    </div>

  </div>

  <div className="footer-bottom">
    © 2026 SRK Handloom. All Rights Reserved.
  </div>

</footer>

    </>
  );
}

export default Home;