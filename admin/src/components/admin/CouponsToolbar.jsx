import React, { useState, useEffect } from "react";
import "./CouponsToolbar.css";

const CouponsToolbar = ({
  searchQuery = "",
  statusFilter = "",
  discountTypeFilter = "",
  datePresetFilter = "",
  sortValue = "newest",
  onSearchChange,
  onStatusChange,
  onDiscountTypeChange,
  onDatePresetChange,
  onSortChange,
  onClearFilters,
  onRefresh,
  onAddCoupon,
  refreshing = false,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  const hasActiveFilters =
    searchQuery ||
    statusFilter ||
    discountTypeFilter ||
    datePresetFilter ||
    sortValue !== "newest";

  return (
    <div className="coupons-toolbar-container">
      <div className="coupons-filters-deck">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Disabled">Disabled</option>
        </select>

        {/* Discount Type Filter */}
        <select
          value={discountTypeFilter}
          onChange={(e) => onDiscountTypeChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Discount Types</option>
          <option value="Percentage">Percentage</option>
          <option value="Flat">Flat</option>
        </select>

        {/* Date Presets Filter */}
        <select
          value={datePresetFilter}
          onChange={(e) => onDatePresetChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">No Date Preset</option>
          <option value="active-today">Active Today</option>
          <option value="expiring-week">Expiring This Week</option>
          <option value="expiring-month">Expiring This Month</option>
          <option value="expired">Expired Campaigns</option>
        </select>

        {/* Sorting Dropdown */}
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="discount-high">Highest Discount</option>
          <option value="discount-low">Lowest Discount</option>
          <option value="used-high">Most Used</option>
          <option value="used-low">Least Used</option>
        </select>

        {/* Refresh Sync */}
        <button
          className="toolbar-refresh-btn"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh Coupon List"
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

      {/* Right side: Search and Add Button */}
      <div className="toolbar-right-actions-deck">
        <div className="toolbar-search-box-wrapper">
          <span className="toolbar-search-icon">🔍</span>
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Search code, title..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button className="clear-search-x-btn" onClick={() => setLocalSearch("")}>
              ✕
            </button>
          )}
        </div>

        <button className="add-coupon-header-btn" onClick={onAddCoupon}>
          + Create Coupon
        </button>
      </div>
    </div>
  );
};

export default CouponsToolbar;
