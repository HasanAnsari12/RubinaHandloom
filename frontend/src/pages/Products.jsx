// src/pages/Products.jsx

import { useMemo, useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { getAllProducts } from "../services/productService";
import "./Products.css";

function Products({ searchTerm = "" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to load products on Products page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // -----------------------------
  // State
  // -----------------------------
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const PRODUCTS_PER_PAGE = 8;

  // -----------------------------
  // Unique Categories
  // -----------------------------
  const categories = [
    "all",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // -----------------------------
  // Filter + Sort
  // -----------------------------
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    const currentSearch = searchTerm || search;

    // Search
    if (currentSearch.trim()) {
      filtered = filtered.filter((product) =>
        product.title?.toLowerCase().includes(currentSearch.toLowerCase()) ||
        product.category?.toLowerCase().includes(currentSearch.toLowerCase()) ||
        product.description?.toLowerCase().includes(currentSearch.toLowerCase())
      );
    }

    // Category Filter
    if (category !== "all") {
      filtered = filtered.filter(
        (product) => product.category === category
      );
    }

    // Sorting
    if (sortBy === "price-low-high") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high-low") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-a-z") {
      filtered.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return filtered;
  }, [products, search, searchTerm, category, sortBy]);

  // -----------------------------
  // Pagination
  // -----------------------------
  const totalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  // -----------------------------
  // Reset page when filter changes
  // -----------------------------
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // -----------------------------
  // UI
  // -----------------------------
  if (loading) {
    return (
      <div className="products-page">
        <div className="container">
          <h2 className="loading" style={{ textAlign: "center", padding: "80px" }}>Loading products...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className="separator">/</span>
          <span className="current">Products</span>
        </nav>

        {/* Page Header */}
        <header className="products-header">
          <h1>All Products</h1>
          <p className="subtitle">
            Curated heritage masterpieces: elegant Chanderi, Kanjivaram, Banarasi, Cotton and Silk sarees.
          </p>
        </header>

        {/* Controls */}
        <div className="products-controls">
          {/* Search */}
          <div
            className="search-wrapper"
            data-active={search.trim().length > 0 ? "true" : "false"}
          >
            <span className="search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search sarees by name, type..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Category Filter */}
          <div
            className="select-wrapper"
            data-active={category !== "all" ? "true" : "false"}
          >
            <span className="select-label">Category</span>
            <select
              value={category}
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div
            className="select-wrapper"
            data-active={sortBy !== "default" ? "true" : "false"}
          >
            <span className="select-label">Sort By</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="default">Default Sorting</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* No Products */}
        {filteredProducts.length === 0 ? (
          <p className="no-products-msg">No products found.</p>
        ) : (
          <>
            {/* Results Meta Row */}
            <div className="results-meta">
              <p className="results-count">
                <span className="results-count__num">{paginatedProducts.length}</span>
                {" "}of{" "}
                <span className="results-count__num">{filteredProducts.length}</span>
                {" "}products
              </p>
              {(search.trim() || category !== "all" || sortBy !== "default") && (
                <span className="filter-active-badge">Filters Active</span>
              )}
            </div>

            {/* Product Grid */}
            <div className="products-grid">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.max(prev - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages)
                    )
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Products;