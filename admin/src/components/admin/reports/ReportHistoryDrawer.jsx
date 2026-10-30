import React from "react";
import { formatDatetime, formatDate } from "../../../utils/reportUtils";
import { HISTORY_STATUS_COLORS } from "../../../constants/ReportConstants";
import "./ReportHistoryDrawer.css";

const ReportHistoryDrawer = ({ isOpen, onClose, history = [] }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="history-drawer-backdrop" onClick={onClose}></div>
      <div className={`history-drawer-panel ${isOpen ? "open" : ""}`}>
        <div className="history-drawer-header">
          <div className="history-drawer-title">
            <span className="history-icon-circle">📋</span>
            <h3>Report History</h3>
          </div>
          <button className="history-drawer-close-btn" onClick={onClose} type="button">✕</button>
        </div>

        <div className="history-drawer-body">
          {history.length === 0 ? (
            <div className="history-empty-state">
              <div className="history-empty-icon">📁</div>
              <p>No reports generated yet in this session.</p>
            </div>
          ) : (
            <div className="history-entries-list">
              {history.map((entry, i) => {
                const statusStyle = HISTORY_STATUS_COLORS[entry.status] || HISTORY_STATUS_COLORS.Success;
                return (
                  <div key={i} className="history-entry-card">
                    <div className="history-entry-header">
                      <span className="history-entry-type">{entry.reportType} Report</span>
                      <span
                        className="history-status-badge"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {entry.status}
                      </span>
                    </div>

                    <div className="history-entry-meta-grid">
                      <div className="history-meta-row">
                        <span className="history-meta-key">📂 Format</span>
                        <span className="history-meta-val">{entry.format}</span>
                      </div>
                      <div className="history-meta-row">
                        <span className="history-meta-key">📄 File</span>
                        <span className="history-meta-val">{entry.fileName}</span>
                      </div>
                      <div className="history-meta-row">
                        <span className="history-meta-key">📦 Records</span>
                        <span className="history-meta-val">{(entry.recordsCount || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="history-meta-row">
                        <span className="history-meta-key">⏱ Duration</span>
                        <span className="history-meta-val">{entry.durationMs ? `${entry.durationMs} ms` : "—"}</span>
                      </div>
                      <div className="history-meta-row">
                        <span className="history-meta-key">🕐 Generated</span>
                        <span className="history-meta-val">{formatDatetime(entry.generatedAt)}</span>
                      </div>
                      {entry.appliedFilters && (
                        <div className="history-meta-row full">
                          <span className="history-meta-key">🔍 Filters</span>
                          <span className="history-meta-val history-filters-text">
                            {entry.appliedFilters}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportHistoryDrawer;
