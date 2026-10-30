const ReportHistory = require("../models/ReportHistory");

const logReportGeneration = async ({
  userId,
  reportType,
  filters,
  fileName,
  format,
  status = "Success",
  recordsCount = 0,
  durationMs = 0,
  ipAddress = "",
  userAgent = "",
}) => {
  try {
    const log = await ReportHistory.create({
      generatedBy: userId,
      reportType,
      filters,
      fileName,
      format,
      status,
      recordsCount,
      durationMs,
      ipAddress,
      userAgent,
    });
    return log;
  } catch (error) {
    console.error("Failed to write report history log entry:", error);
    return null;
  }
};

const getReportHistoryList = async (searchQuery = {}) => {
  try {
    const query = {};
    if (searchQuery.reportType) {
      query.reportType = searchQuery.reportType;
    }
    if (searchQuery.status) {
      query.status = searchQuery.status;
    }
    if (searchQuery.search) {
      const regex = new RegExp(searchQuery.search, "i");
      query.fileName = { $regex: regex };
    }

    const history = await ReportHistory.find(query)
      .populate("generatedBy", "name email")
      .sort({ generatedAt: -1 })
      .limit(100);

    return history;
  } catch (error) {
    console.error("Failed to query report history lists:", error);
    return [];
  }
};

module.exports = {
  logReportGeneration,
  getReportHistoryList,
};
