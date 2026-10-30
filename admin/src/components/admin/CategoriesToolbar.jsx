import React, { useState, useEffect } from "react";
import "./CategoriesToolbar.css";

const CategoriesToolbar = ({
  searchQuery = "",
  statusFilter = "",
  sortValue = "newest",
  onSearchChange,
  onStatusChange,
  onSortChange,
  onClearFilters,
  onRefresh,
  refreshing = false,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  const hasActiveFilters =
    searchQuery || statusFilter || sortValue !== "newest";

  return (
    <div className="categories-toolbar-container">
      <div className="categories-filters-deck">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Hidden">Hidden</option>
        </select>

        {/* Sorting options */}
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
          <option value="products-desc">Most Products</option>
          <option value="products-asc">Least Products</option>
        </select>

        {/* Refresh Sync */}
        <button
          className="toolbar-refresh-btn"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <span className="refresh-spinner"></span>
              Refreshing...
            </>
          ) : (
            <>🔄 Refresh</>
          )}
        </button>

        {hasActiveFilters && (
          <button className="clear-filters-btn-toolbar" onClick={onClearFilters}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="toolbar-search-box-wrapper">
        <span className="toolbar-search-icon">🔍</span>
        <input
          type="text"
          className="toolbar-search-input"
          placeholder="Search name, slug, description..."
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

export default CategoriesToolbar;
