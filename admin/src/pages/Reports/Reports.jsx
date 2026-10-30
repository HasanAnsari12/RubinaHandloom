import React, { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

import ReportFilters from "../../components/admin/reports/ReportFilters";
import ReportStats from "../../components/admin/reports/ReportStats";
import ReportChart from "../../components/admin/reports/ReportChart";
import ReportDataTable from "../../components/admin/reports/ReportDataTable";
import ReportExportBar from "../../components/admin/reports/ReportExportBar";
import ReportHistoryDrawer from "../../components/admin/reports/ReportHistoryDrawer";

import { REPORT_TYPE_LIST } from "../../constants/ReportConstants";
import { presetToDateRange, generateFileName, estimateCsvSize } from "../../utils/reportUtils";
import { downloadCsvBlob, buildQueryParams } from "../../utils/csvUtils";
import { printWithDelay } from "../../utils/printUtils";

import "./Reports.css";

import { API_BASE_URL } from "../../utils/constants";

const defaultFilters = {
  datePreset: "30days",
  startDate: null,
  endDate: null,
  groupBy: "Day",
  orderStatus: "",
  paymentMethod: "",
  status: "",
};

const Reports = () => {
  const { token } = useAuth();

  // Active report type
  const [activeType, setActiveType] = useState("Sales");

  // Filters
  const [filters, setFilters] = useState(() => {
    const { startDate, endDate } = presetToDateRange("30days");
    return { ...defaultFilters, startDate, endDate };
  });

  // Column selector
  const [selectedColumns, setSelectedColumns] = useState([]);

  // Obfuscate sensitive data toggle
  const [obfuscateSensitive, setObfuscateSensitive] = useState(false);

  // Chart type toggle
  const [chartType, setChartType] = useState("bar");

  // Data state
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({});
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // History
  const [reportHistory, setReportHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchRef = useRef(null);

  // ─── Fetch report data ─────────────────────────────────────────
  const fetchReport = useCallback(
    async (type = activeType, currentFilters = filters) => {
      setLoading(true);
      setReportData([]);
      setSummary({});
      setGeneratedAt(null);

      const queryParams = buildQueryParams({
        startDate: currentFilters.startDate,
        endDate: currentFilters.endDate,
        ...(type === "Sales" && { groupBy: currentFilters.groupBy }),
        ...(type === "Orders" && {
          ...(currentFilters.orderStatus && { orderStatus: currentFilters.orderStatus }),
          ...(currentFilters.paymentMethod && { paymentMethod: currentFilters.paymentMethod }),
        }),
        ...(["Reviews", "Coupons"].includes(type) &&
          currentFilters.status && { status: currentFilters.status }),
      });

      const url = `${API_BASE_URL}/admin/reports/${type.toLowerCase()}?${queryParams}`;

      try {
        const start = Date.now();
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        const duration = Date.now() - start;

        if (!res.ok) throw new Error(result.message || "Failed to fetch report.");

        setReportData(result.data || result.rows || []);
        setSummary(result.summary || {});
        const now = new Date().toISOString();
        setGeneratedAt(now);

        // Add to history
        setReportHistory((prev) => [
          {
            reportType: type,
            format: "Preview",
            fileName: `${type}_Report_preview`,
            recordsCount: (result.data || []).length,
            durationMs: duration,
            status: "Success",
            generatedAt: now,
            appliedFilters: JSON.stringify({
              from: currentFilters.startDate?.slice(0, 10),
              to: currentFilters.endDate?.slice(0, 10),
              ...(type === "Sales" && { groupBy: currentFilters.groupBy }),
            }),
          },
          ...prev.slice(0, 19), // Keep last 20 entries
        ]);
      } catch (err) {
        toast.error(err.message || "Report fetch failed.");
        setReportHistory((prev) => [
          {
            reportType: type,
            format: "Preview",
            fileName: "—",
            recordsCount: 0,
            durationMs: null,
            status: "Failed",
            generatedAt: new Date().toISOString(),
            appliedFilters: null,
          },
          ...prev.slice(0, 19),
        ]);
      } finally {
        setLoading(false);
      }
    },
    [activeType, filters, token]
  );

  // Initial load + type change
  useEffect(() => {
    fetchReport(activeType, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  // ─── Handle filter changes ─────────────────────────────────────
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyPreset = useCallback(
    (preset) => {
      const { startDate, endDate } = presetToDateRange(`${preset.days}days`);
      const updatedFilters = {
        ...filters,
        startDate,
        endDate,
        datePreset: `${preset.days}days`,
        ...(preset.extraFilters || {}),
      };
      setFilters(updatedFilters);
      fetchReport(preset.reportType || activeType, updatedFilters);
      if (preset.reportType && preset.reportType !== activeType) {
        setActiveType(preset.reportType);
      }
    },
    [filters, fetchReport, activeType]
  );

  const handleClearFilters = useCallback(() => {
    const { startDate, endDate } = presetToDateRange("30days");
    const cleared = { ...defaultFilters, startDate, endDate };
    setFilters(cleared);
    setSelectedColumns([]);
    fetchReport(activeType, cleared);
  }, [activeType, fetchReport]);

  // ─── Generate / Export ─────────────────────────────────────────
  const handleGenerateReport = useCallback(() => {
    fetchReport(activeType, filters);
  }, [activeType, filters, fetchReport]);

  const handleExport = useCallback(
    async (format) => {
      if (!reportData || reportData.length === 0) {
        toast.error("No data to export. Generate the report first.");
        return;
      }

      if (format === "Print") {
        toast.info("Opening print dialog...");
        await printWithDelay();
        return;
      }

      setExportLoading(true);
      try {
        const queryParams = buildQueryParams({
          startDate: filters.startDate,
          endDate: filters.endDate,
          format,
          ...(activeType === "Sales" && { groupBy: filters.groupBy }),
          ...(activeType === "Orders" && {
            ...(filters.orderStatus && { orderStatus: filters.orderStatus }),
            ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
          }),
          ...(["Reviews", "Coupons"].includes(activeType) &&
            filters.status && { status: filters.status }),
          ...(selectedColumns.length > 0 && { columns: selectedColumns.join(",") }),
          obfuscate: obfuscateSensitive,
        });

        const url = `${API_BASE_URL}/admin/reports/${activeType.toLowerCase()}?${queryParams}`;
        const start = Date.now();
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const duration = Date.now() - start;

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Export failed.");
        }

        const fileName = generateFileName(activeType, format);

        if (format === "CSV") {
          const csvText = await res.text();
          downloadCsvBlob(csvText, fileName);
        } else if (format === "Excel") {
          const blob = await res.blob();
          const url2 = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url2;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url2);
        }

        toast.success(`${format} export ready: ${fileName}`);

        // Log to history
        const now = new Date().toISOString();
        setReportHistory((prev) => [
          {
            reportType: activeType,
            format,
            fileName,
            recordsCount: reportData.length,
            durationMs: duration,
            status: "Success",
            generatedAt: now,
            appliedFilters: JSON.stringify({
              from: filters.startDate?.slice(0, 10),
              to: filters.endDate?.slice(0, 10),
            }),
          },
          ...prev.slice(0, 19),
        ]);
      } catch (err) {
        toast.error(err.message || "Export failed.");
      } finally {
        setExportLoading(false);
      }
    },
    [reportData, activeType, filters, selectedColumns, obfuscateSensitive, token]
  );

  // ─── Report type selector switch ─────────────────────────────
  const handleTypeChange = (type) => {
    setActiveType(type);
    setSelectedColumns([]);
    setReportData([]);
    setSummary({});
    setGeneratedAt(null);
  };

  const estimatedSize = estimateCsvSize(reportData.length);

  return (
    <div className="reports-page-container">
      {/* Page Header */}
      <div className="reports-page-header">
        <div className="reports-header-left">
          <h1 className="reports-page-title">
            <span className="reports-icon-badge">📊</span>
            Reports & Export Center
          </h1>
          <p className="reports-page-subtitle">
            Generate, preview, filter, and export business intelligence reports across all modules.
          </p>
        </div>
        <div className="reports-header-actions">
          <button
            className="reports-history-btn"
            onClick={() => setShowHistory(true)}
            type="button"
          >
            📋 Report History {reportHistory.length > 0 && <span className="history-badge-count">{reportHistory.length}</span>}
          </button>
          <button
            className="reports-generate-btn"
            onClick={handleGenerateReport}
            disabled={loading}
            type="button"
          >
            {loading ? <span className="reports-generate-spinner"></span> : "⚡"}
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="report-type-tabs-row">
        {REPORT_TYPE_LIST.map((rt) => (
          <button
            key={rt.key}
            className={`report-type-tab-btn ${activeType === rt.key ? "active" : ""}`}
            style={activeType === rt.key ? { borderBottomColor: rt.color, color: rt.color } : {}}
            onClick={() => handleTypeChange(rt.key)}
            type="button"
          >
            <span className="tab-icon">{rt.icon}</span>
            <span className="tab-label">{rt.label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <ReportFilters
        reportType={activeType}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyPreset={handleApplyPreset}
        onClearFilters={handleClearFilters}
        selectedColumns={selectedColumns}
        onColumnChange={setSelectedColumns}
        obfuscateSensitive={obfuscateSensitive}
        onObfuscateChange={setObfuscateSensitive}
      />

      {/* KPI Stats */}
      <ReportStats summary={summary} reportType={activeType} loading={loading} />

      {/* Chart + Chart Type Toggle */}
      {reportData.length > 0 && !loading && (
        <>
          <div className="chart-type-toggle-row">
            <span className="chart-toggle-label">Chart Type:</span>
            <div className="chart-type-btn-group">
              <button
                className={`chart-type-toggle-btn ${chartType === "bar" ? "active" : ""}`}
                onClick={() => setChartType("bar")}
                type="button"
              >
                📊 Bar
              </button>
              <button
                className={`chart-type-toggle-btn ${chartType === "line" ? "active" : ""}`}
                onClick={() => setChartType("line")}
                type="button"
              >
                📈 Line
              </button>
            </div>
          </div>
          <ReportChart data={reportData} reportType={activeType} chartType={chartType} />
        </>
      )}

      {/* Export Bar */}
      <ReportExportBar
        reportType={activeType}
        recordsCount={reportData.length}
        onExport={handleExport}
        loading={exportLoading}
        generatedAt={generatedAt}
        estimatedSize={estimatedSize}
      />

      {/* Data Table */}
      <ReportDataTable
        data={reportData}
        reportType={activeType}
        obfuscate={obfuscateSensitive}
        selectedColumns={selectedColumns}
        loading={loading}
      />

      {/* Report History Drawer */}
      <ReportHistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={reportHistory}
      />
    </div>
  );
};

export default Reports;
