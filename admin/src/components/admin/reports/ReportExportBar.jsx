import React from "react";
import { EXPORT_FORMATS } from "../../../constants/ReportConstants";
import "./ReportExportBar.css";

const ReportExportBar = ({
  reportType,
  recordsCount = 0,
  onExport,
  loading = false,
  generatedAt = null,
  estimatedSize = "~",
}) => {
  const isLargeExport = recordsCount > 50000;

  return (
    <div className="report-export-bar">
      {/* Record count + estimated size info */}
      <div className="export-info-group">
        <div className="export-records-count">
          <span className="export-count-label">Records Found:</span>
          <span className="export-count-value">{recordsCount.toLocaleString("en-IN")}</span>
        </div>
        <div className="export-size-estimate">
          <span className="export-size-label">Est. Export Size:</span>
          <span className="export-size-value">{estimatedSize}</span>
        </div>
        {generatedAt && (
          <div className="export-generated-at">
            <span className="export-gen-label">⏱ Generated:</span>
            <span className="export-gen-value">
              {new Date(generatedAt).toLocaleTimeString("en-IN", { hour12: true })}
            </span>
          </div>
        )}
      </div>

      {/* Large Export Warning */}
      {isLargeExport && (
        <div className="large-export-warning">
          ⚠️ Large export detected (&gt;50,000 rows). Background processing will be triggered.
        </div>
      )}

      {/* Export Action Buttons */}
      <div className="export-actions-group">
        {EXPORT_FORMATS.map((fmt) => (
          <button
            key={fmt.key}
            className={`export-action-btn ${fmt.key === "CSV" ? "primary" : ""}`}
            onClick={() => onExport(fmt.key)}
            disabled={loading || recordsCount === 0}
            type="button"
          >
            {loading ? (
              <span className="export-btn-spinner"></span>
            ) : (
              <span>{fmt.icon}</span>
            )}
            {fmt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportExportBar;
