import React, { useState, useEffect } from "react";
import "./UsersToolbar.css";

const UsersToolbar = ({
  searchQuery = "",
  roleFilter = "",
  statusFilter = "",
  verificationFilter = "",
  sortValue = "newest",
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onVerificationChange,
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
    searchQuery ||
    roleFilter ||
    statusFilter ||
    verificationFilter ||
    sortValue !== "newest";

  return (
    <div className="users-toolbar-container">
      <div className="users-filters-deck">
        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">Customer</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>

        {/* Verification Filter */}
        <select
          value={verificationFilter}
          onChange={(e) => onVerificationChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="">All Verifications</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>

        {/* Sorting */}
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="toolbar-select-filter"
        >
          <option value="newest">Newest Joined</option>
          <option value="oldest">Oldest Joined</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
        </select>

        {/* Refresh Sync */}
        <button className="toolbar-refresh-btn" onClick={onRefresh} disabled={refreshing}>
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
          placeholder="Search name, email, phone..."
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

export default UsersToolbar;
