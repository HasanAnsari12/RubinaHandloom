import React, { useState, useEffect } from "react";
import "./ProductsToolbar.css";

const ProductsToolbar = ({
  searchQuery = "",
  categoryFilter = "",
  stockFilter = "",
  statusFilter = "",
  sortValue = "newest",
  categories = [],
  onSearchChange,
  onCategoryChange,
  onStockChange,
  onStatusChange,
  onSortChange,
  onClearFilters,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local search when query is reset or cleared by parent
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Handle Search Input Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  const hasActiveFilters =
    searchQuery ||
    categoryFilter ||
    stockFilter ||
    statusFilter ||
    sortValue !== "newest";

  return (
    <div className="products-toolbar-container">
      {/* Filters Form Deck */}
      <div className="products-filters-deck">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => onStockChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Stock Levels</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock (≤5)</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="out-of-stock">Out of Stock</option>
          <option value="low-stock">Low Stock</option>
        </select>

        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="newest">Newest Created</option>
          <option value="oldest">Oldest Created</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
        </select>

        {hasActiveFilters && (
          <button className="clear-filters-btn-toolbar" onClick={onClearFilters}>
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Debounced Search Box */}
      <div className="toolbar-search-box-wrapper">
        <span className="toolbar-search-icon">🔍</span>
        <input
          type="text"
          className="toolbar-search-input"
          placeholder="Search products..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button className="clear-search-x-btn" onClick={() => setLocalSearch("")}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductsToolbar;
