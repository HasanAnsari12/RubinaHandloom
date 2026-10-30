import React from "react";
import "./DashboardFilters.css";

const DashboardFilters = ({
  filterRange = "30days",
  onFilterChange,
  onRefresh,
  refreshing = false,
}) => {
  const presets = [
    { key: "today", label: "Today" },
    { key: "7days", label: "7 Days" },
    { key: "30days", label: "30 Days" },
    { key: "90days", label: "90 Days" },
    { key: "year", label: "This Year" },
  ];

  return (
    <div className="dashboard-filters-container">
      <div className="filter-presets-deck" role="group" aria-label="Dashboard Date Presets">
        {presets.map((p) => {
          const isActive = filterRange === p.key;
          return (
            <button
              key={p.key}
              type="button"
              className={`filter-preset-btn ${isActive ? "active" : ""}`}
              onClick={() => onFilterChange(p.key)}
              disabled={refreshing}
            >
              {p.label}
            </button>
          );
        })}

        {/* Custom Range stub */}
        <button
          type="button"
          className="filter-preset-btn custom-preset-disabled"
          disabled
          title="Custom range selector coming in future release"
        >
          Custom Range 📅
        </button>
      </div>

      {/* Manual refresh console action */}
      <button
        type="button"
        className="console-refresh-kpi-btn"
        onClick={onRefresh}
        disabled={refreshing}
      >
        {refreshing ? (
          <>
            <span className="console-spinner"></span>
            Syncing Metrics...
          </>
        ) : (
          <>🔄 Refresh Metrics</>
        )}
      </button>
    </div>
  );
};

export default DashboardFilters;
