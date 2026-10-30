import React, { useState, useEffect } from "react";
import "./OrdersToolbar.css";

const OrdersToolbar = ({
  searchQuery = "",
  orderStatusFilter = "",
  paymentStatusFilter = "",
  paymentMethodFilter = "",
  sortValue = "newest",
  onSearchChange,
  onOrderStatusChange,
  onPaymentStatusChange,
  onPaymentMethodChange,
  onSortChange,
  onClearFilters,
  onRefresh,
  refreshing = false,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local search when parent clears
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search input
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  const hasActiveFilters =
    searchQuery ||
    orderStatusFilter ||
    paymentStatusFilter ||
    paymentMethodFilter ||
    sortValue !== "newest";

  return (
    <div className="orders-toolbar-container">
      <div className="orders-filters-deck">
        {/* Order Status */}
        <select
          value={orderStatusFilter}
          onChange={(e) => onOrderStatusChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Order Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Payment Status */}
        <select
          value={paymentStatusFilter}
          onChange={(e) => onPaymentStatusChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Payment Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>

        {/* Payment Method */}
        <select
          value={paymentMethodFilter}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Methods</option>
          <option value="Razorpay">Razorpay</option>
          <option value="COD">COD</option>
        </select>

        {/* Sort */}
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-high">Amount: High → Low</option>
          <option value="amount-low">Amount: Low → High</option>
        </select>

        {/* Action Buttons */}
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

      {/* Search Input Box */}
      <div className="toolbar-search-box-wrapper">
        <span className="toolbar-search-icon">🔍</span>
        <input
          type="text"
          className="toolbar-search-input"
          placeholder="Search by ID, Customer, Email..."
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

export default OrdersToolbar;
