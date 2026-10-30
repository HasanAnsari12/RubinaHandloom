const { getSalesReport } = require("../services/salesReportService");
const { getOrdersReport } = require("../services/ordersReportService");
const { getProductsReport } = require("../services/productsReportService");
const { getCustomersReport } = require("../services/customersReportService");
const { getCouponsReport } = require("../services/couponsReportService");
const { getReviewsReport } = require("../services/reviewsReportService");

const { generateCsvReport } = require("../services/reportExportService");
const { logReportGeneration, getReportHistoryList } = require("../services/reportHistoryService");

// Reusable orchestrator handler for reports fetch and export compilation
const generateReport = async (req, res) => {
  const startTime = Date.now();
  try {
    const { reportType } = req.params;
    const {
      startDate,
      endDate,
      format = "JSON", // "JSON" | "CSV" | "Excel" | "Print"
      groupBy = "Day", // For Sales Report
      orderStatus = "",
      paymentMethod = "",
      category = "",
      status = "",
      rating = "",
      selectedColumns = "", // comma-separated values
      obfuscateSensitive = "false",
    } = req.query;

    const formattedReportType = reportType.charAt(0).toUpperCase() + reportType.slice(1);
    
    // Parse selected columns into array
    const columnsArray = selectedColumns ? selectedColumns.split(",") : [];
    const isSensitiveToggled = obfuscateSensitive === "true";

    // 1. Route to single-responsibility service to compute data rows
    let reportData;
    const subFilters = { orderStatus, paymentMethod, category, status, rating };

    switch (formattedReportType) {
      case "Sales":
        reportData = await getSalesReport(startDate, endDate, groupBy);
        break;
      case "Orders":
        reportData = await getOrdersReport(startDate, endDate, subFilters);
        break;
      case "Products":
        reportData = await getProductsReport(startDate, endDate, subFilters);
        break;
      case "Customers":
        reportData = await getCustomersReport(startDate, endDate);
        break;
      case "Coupons":
        reportData = await getCouponsReport(startDate, endDate, subFilters);
        break;
      case "Reviews":
        reportData = await getReviewsReport(startDate, endDate, subFilters);
        break;
      default:
        return res.status(404).json({ success: false, message: "Invalid report type specified." });
    }

    const durationMs = Date.now() - startTime;
    const recordsCount = reportData.rows.length;
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = `${formattedReportType}_Report_${dateStamp}.csv`;

    const ipAddress = req.ip || req.connection.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    // 2. Perform DB log audit logging in background
    await logReportGeneration({
      userId: req.user._id,
      reportType: formattedReportType,
      filters: { startDate, endDate, groupBy, ...subFilters, isSensitiveToggled },
      fileName,
      format,
      status: "Success",
      recordsCount,
      durationMs,
      ipAddress,
      userAgent,
    });

    // 3. Formulate format response stream
    if (format === "CSV" || format === "Excel") {
      const csvContent = generateCsvReport({
        reportType: formattedReportType,
        rows: reportData.rows,
        summary: reportData.summary,
        filters: { startDate, endDate, groupBy, ...subFilters },
        adminName: req.user.name || "Admin",
        selectedColumns: columnsArray,
        obfuscateSensitive: isSensitiveToggled,
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      return res.status(200).send(csvContent);
    }

    // Default JSON responses for preview drawer display
    return res.status(200).json({
      success: true,
      reportType: formattedReportType,
      rows: reportData.rows,
      summary: reportData.summary,
      durationMs,
      fileName,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error("Report Generation Fail:", error);

    // Write failed audit log
    try {
      await logReportGeneration({
        userId: req.user?._id || null,
        reportType: req.params.reportType || "Unknown",
        filters: req.query,
        fileName: "Failed_Report.csv",
        format: req.query.format || "JSON",
        status: "Failed",
        recordsCount: 0,
        durationMs,
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
      });
    } catch (logErr) {
      console.error("Secondary fail writing failed log:", logErr);
    }

    return res.status(500).json({
      success: false,
      message: `Export failed: ${error.message}`,
    });
  }
};

// @desc    Retrieve all generated reports logs
// @route   GET /api/admin/reports/history
// @access  Private/Admin
const getHistory = async (req, res) => {
  try {
    const { reportType, status, search } = req.query;
    const historyList = await getReportHistoryList({ reportType, status, search });
    
    res.status(200).json({
      success: true,
      history: historyList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateReport,
  getHistory,
};
