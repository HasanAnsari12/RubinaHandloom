// ─── Currency Formatter ───────────────────────────────────────────────
export const formatINR = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

// ─── Date Formatting ─────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDatetime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }) + " IST";
};

// ─── Estimated File Size ──────────────────────────────────────────────
export const estimateCsvSize = (recordsCount) => {
  // Rough estimate: ~150 bytes per row
  const bytes = recordsCount * 150 + 1024; // + 1KB for header metadata
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Date preset to startDate/endDate converter ───────────────────────
export const presetToDateRange = (preset) => {
  const now = new Date();
  const endDate = now.toISOString();

  if (preset === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { startDate: start.toISOString(), endDate };
  }
  if (preset === "7days") {
    const start = new Date();
    start.setDate(now.getDate() - 7);
    return { startDate: start.toISOString(), endDate };
  }
  if (preset === "30days") {
    const start = new Date();
    start.setDate(now.getDate() - 30);
    return { startDate: start.toISOString(), endDate };
  }
  if (preset === "90days") {
    const start = new Date();
    start.setDate(now.getDate() - 90);
    return { startDate: start.toISOString(), endDate };
  }
  if (preset === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { startDate: start.toISOString(), endDate };
  }
  return { startDate: null, endDate: null };
};

// ─── Percentage difference calculation ───────────────────────────────
export const calcDifferencePercent = (current, previous) => {
  if (!previous || previous === 0) return null;
  const diff = ((current - previous) / previous) * 100;
  return diff.toFixed(1);
};

// ─── Report Filename Generator ────────────────────────────────────────
export const generateFileName = (reportType, format) => {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const ext = format === "Excel" ? "xlsx" : format.toLowerCase();
  return `${reportType}_Report_${dateStamp}.${ext}`;
};
