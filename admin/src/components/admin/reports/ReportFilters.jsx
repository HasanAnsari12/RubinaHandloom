import React, { useState } from "react";
import { DATE_PRESETS, GROUP_BY_OPTIONS, SAVED_PRESETS, REPORT_COLUMNS } from "../../../constants/ReportConstants";
import { presetToDateRange } from "../../../utils/reportUtils";
import "./ReportFilters.css";

const ReportFilters = ({
  reportType,
  filters,
  onFilterChange,
  onApplyPreset,
  onClearFilters,
  selectedColumns,
  onColumnChange,
  obfuscateSensitive,
  onObfuscateChange,
}) => {
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handlePresetClick = (preset) => {
    const { startDate, endDate } = presetToDateRange(preset !== "custom" ? preset : null);
    if (preset !== "custom") {
      onFilterChange("startDate", startDate);
      onFilterChange("endDate", endDate);
    }
    onFilterChange("datePreset", preset);
    setShowPresets(false);
  };

  const handleSavedPresetClick = (preset) => {
    const { startDate, endDate } = presetToDateRange(`${preset.days}days`);
    onApplyPreset(preset);
    setShowPresets(false);
  };

  const columns = REPORT_COLUMNS[reportType] || [];
  const allSelected = columns.every((c) => selectedColumns.includes(c.key));

  const handleSelectAllColumns = () => {
    if (allSelected) {
      onColumnChange([]);
    } else {
      onColumnChange(columns.map((c) => c.key));
    }
  };

  return (
    <div className="report-filters-container">
      <div className="filters-top-row">
        {/* Saved Presets Toggle */}
        <div className="saved-presets-wrapper">
          <button
            className="saved-presets-toggle-btn"
            onClick={() => setShowPresets(!showPresets)}
            type="button"
          >
            📋 Saved Presets
            <span className="toggle-chevron">{showPresets ? "▲" : "▼"}</span>
          </button>
          {showPresets && (
            <div className="saved-presets-dropdown">
              {SAVED_PRESETS.filter((p) => !p.reportType || p.reportType === reportType).map((p) => (
                <button
                  key={p.key}
                  className="saved-preset-item-btn"
                  onClick={() => handleSavedPresetClick(p)}
                  type="button"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Preset Buttons */}
        <div className="date-presets-bar">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.key}
              className={`date-preset-btn ${filters.datePreset === p.key ? "active" : ""}`}
              onClick={() => handlePresetClick(p.key)}
              type="button"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        <button className="clear-filters-text-btn" onClick={onClearFilters} type="button">
          ✕ Reset
        </button>
      </div>

      <div className="filters-bottom-row">
        {/* Custom Date range pickers (shown only when "custom" is selected) */}
        {filters.datePreset === "custom" && (
          <div className="custom-date-range-inputs">
            <div className="date-input-group">
              <label>From Date</label>
              <input
                type="date"
                value={filters.startDate ? filters.startDate.slice(0, 10) : ""}
                onChange={(e) => onFilterChange("startDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>
            <div className="date-input-group">
              <label>To Date</label>
              <input
                type="date"
                value={filters.endDate ? filters.endDate.slice(0, 10) : ""}
                onChange={(e) => onFilterChange("endDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>
          </div>
        )}

        {/* Group By (Sales only) */}
        {reportType === "Sales" && (
          <div className="filter-select-group">
            <label>Group By</label>
            <select
              value={filters.groupBy || "Day"}
              onChange={(e) => onFilterChange("groupBy", e.target.value)}
            >
              {GROUP_BY_OPTIONS.map((g) => (
                <option key={g.key} value={g.key}>{g.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Order Status filter */}
        {reportType === "Orders" && (
          <div className="filter-select-group">
            <label>Order Status</label>
            <select
              value={filters.orderStatus || ""}
              onChange={(e) => onFilterChange("orderStatus", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {/* Payment Method filter (Orders) */}
        {reportType === "Orders" && (
          <div className="filter-select-group">
            <label>Payment Method</label>
            <select
              value={filters.paymentMethod || ""}
              onChange={(e) => onFilterChange("paymentMethod", e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="Razorpay">Razorpay</option>
              <option value="COD">COD</option>
            </select>
          </div>
        )}

        {/* Review Status filter */}
        {reportType === "Reviews" && (
          <div className="filter-select-group">
            <label>Review Status</label>
            <select
              value={filters.status || ""}
              onChange={(e) => onFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
        )}

        {/* Coupon Status filter */}
        {reportType === "Coupons" && (
          <div className="filter-select-group">
            <label>Coupon Status</label>
            <select
              value={filters.status || ""}
              onChange={(e) => onFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        )}

        {/* Sensitive Data Toggle */}
        <div className="obfuscate-toggle-row">
          <label className="toggle-label-switch">
            <input
              type="checkbox"
              checked={obfuscateSensitive}
              onChange={(e) => onObfuscateChange(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Hide Customer Data
          </label>
        </div>

        {/* Column Selector */}
        {columns.length > 0 && (
          <div className="column-selector-wrapper">
            <button
              className="column-selector-toggle-btn"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              type="button"
            >
              ⚙ Columns ({selectedColumns.length || columns.length}/{columns.length})
            </button>
            {showColumnSelector && (
              <div className="column-selector-dropdown">
                <div className="col-selector-header-row">
                  <strong>Select Export Columns</strong>
                  <button
                    className="select-all-cols-btn"
                    onClick={handleSelectAllColumns}
                    type="button"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>
                {columns.map((col) => (
                  <label key={col.key} className="column-check-row">
                    <input
                      type="checkbox"
                      checked={selectedColumns.length === 0 || selectedColumns.includes(col.key)}
                      onChange={(e) => {
                        const base = selectedColumns.length === 0 ? columns.map((c) => c.key) : [...selectedColumns];
                        if (e.target.checked) {
                          onColumnChange([...new Set([...base, col.key])]);
                        } else {
                          onColumnChange(base.filter((k) => k !== col.key));
                        }
                      }}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scheduled Reports Stub */}
      <div className="scheduled-reports-stub-row">
        <span className="schedule-stub-label">🕐 Schedule This Report</span>
        <select disabled className="schedule-freq-select-stub">
          <option>Never</option>
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
        <input
          type="email"
          disabled
          placeholder="Recipient Email (Coming Soon)"
          className="schedule-email-stub-input"
        />
      </div>
    </div>
  );
};

export default ReportFilters;
