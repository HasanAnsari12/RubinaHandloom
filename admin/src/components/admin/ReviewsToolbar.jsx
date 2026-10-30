import React, { useState, useEffect } from "react";
import "./ReviewsToolbar.css";

const ReviewsToolbar = ({
  searchQuery = "",
  statusFilter = "",
  ratingFilter = "",
  sortValue = "newest",
  onSearchChange,
  onStatusChange,
  onRatingChange,
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
    searchQuery || statusFilter || ratingFilter || sortValue !== "newest";

  return (
    <div className="reviews-toolbar-container">
      <div className="reviews-filters-deck">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Hidden">Hidden</option>
        </select>

        {/* Rating Filter */}
        <select
          value={ratingFilter}
          onChange={(e) => onRatingChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Ratings</option>
          <option value="5">5★ Stars Only</option>
          <option value="4">4★ Stars & Above</option>
          <option value="3">3★ Stars & Above</option>
          <option value="2">2★ Stars & Above</option>
          <option value="1">1★ Star & Above</option>
        </select>

        {/* Sort select */}
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
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
          placeholder="Search customer, email, comment..."
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

export default ReviewsToolbar;
