import React, { useMemo } from "react";
import { formatINR, formatDate } from "../../../utils/reportUtils";
import "./ReportDataTable.css";

const EmptyReportPlaceholder = () => (
  <div className="empty-report-placeholder">
    <div className="empty-report-icon">📊</div>
    <h4>No Data Found</h4>
    <p>Try changing the filters or selecting a different date range.</p>
  </div>
);

// Column definitions per report type
const COLUMN_DEFS = {
  Sales: [
    { key: "dateGroup", label: "Period" },
    { key: "ordersCount", label: "Orders" },
    { key: "revenue", label: "Revenue (₹)", format: formatINR },
    { key: "discount", label: "Discounts (₹)", format: formatINR },
    { key: "shippingCharge", label: "Shipping (₹)", format: formatINR },
    { key: "tax", label: "Tax (₹)", format: formatINR },
    { key: "aov", label: "AOV (₹)", format: formatINR },
  ],
  Orders: [
    { key: "orderId", label: "Order ID" },
    { key: "customerName", label: "Customer", obfuscatable: true },
    { key: "subtotal", label: "Subtotal (₹)", format: formatINR },
    { key: "discount", label: "Discount (₹)", format: formatINR },
    { key: "totalAmount", label: "Total (₹)", format: formatINR },
    { key: "orderStatus", label: "Status", badge: true },
    { key: "paymentMethod", label: "Payment" },
    { key: "date", label: "Date", format: formatDate },
  ],
  Products: [
    { key: "title", label: "Product" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price (₹)", format: formatINR },
    { key: "stock", label: "Stock" },
    { key: "status", label: "Status", badge: true },
    { key: "unitsSold", label: "Units Sold" },
    { key: "revenue", label: "Revenue (₹)", format: formatINR },
    { key: "rating", label: "Rating" },
  ],
  Customers: [
    { key: "name", label: "Customer Name", obfuscatable: true },
    { key: "email", label: "Email", obfuscatable: true },
    { key: "ordersCount", label: "Orders" },
    { key: "totalSpent", label: "Lifetime Spend (₹)", format: formatINR },
    { key: "joinedDate", label: "Join Date", format: formatDate },
  ],
  Coupons: [
    { key: "code", label: "Coupon Code" },
    { key: "title", label: "Campaign" },
    { key: "discountType", label: "Type" },
    { key: "discountValue", label: "Discount" },
    { key: "status", label: "Status", badge: true },
    { key: "usedCount", label: "Claims" },
    { key: "totalSavings", label: "Savings (₹)", format: formatINR },
  ],
  Reviews: [
    { key: "productTitle", label: "Product" },
    { key: "customerName", label: "Customer", obfuscatable: true },
    { key: "rating", label: "Stars" },
    { key: "status", label: "Status", badge: true },
    { key: "comment", label: "Comment" },
    { key: "date", label: "Date", format: formatDate },
  ],
};

const STATUS_COLORS = {
  Active: { bg: "#D1FAE5", color: "#065F46" },
  Approved: { bg: "#D1FAE5", color: "#065F46" },
  Delivered: { bg: "#D1FAE5", color: "#065F46" },
  Pending: { bg: "#FEF3C7", color: "#92400E" },
  Processing: { bg: "#DBEAFE", color: "#1E40AF" },
  Scheduled: { bg: "#E0E7FF", color: "#3730A3" },
  Shipped: { bg: "#DBEAFE", color: "#1E40AF" },
  Cancelled: { bg: "#FEE2E2", color: "#991B1B" },
  Expired: { bg: "#FEE2E2", color: "#991B1B" },
  Rejected: { bg: "#FEE2E2", color: "#991B1B" },
  Hidden: { bg: "#F3F4F6", color: "#6B7280" },
  Disabled: { bg: "#F3F4F6", color: "#6B7280" },
  "In Stock": { bg: "#D1FAE5", color: "#065F46" },
  "Low Stock": { bg: "#FEF3C7", color: "#92400E" },
  "Out of Stock": { bg: "#FEE2E2", color: "#991B1B" },
};

const StatusBadge = ({ value }) => {
  const style = STATUS_COLORS[value] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span
      className="report-status-badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {value}
    </span>
  );
};

const obfuscateValue = (value) => {
  if (!value) return "—";
  const str = String(value);
  if (str.includes("@")) return "***@***.***";
  if (str.length <= 3) return "***";
  return str.slice(0, 2) + "***" + str.slice(-1);
};

const ReportDataTable = ({ data = [], reportType = "Sales", obfuscate = false, selectedColumns = [], loading = false }) => {
  const columns = useMemo(() => {
    const allCols = COLUMN_DEFS[reportType] || [];
    if (selectedColumns.length === 0) return allCols;
    return allCols.filter((col) => selectedColumns.includes(col.key));
  }, [reportType, selectedColumns]);

  if (loading) {
    return (
      <div className="report-table-container">
        <div className="report-table-loading">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="report-table-skeleton-row">
              {columns.map((_, j) => <div key={j} className="report-table-skeleton-cell"></div>)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyReportPlaceholder />;
  }

  return (
    <div className="report-table-container">
      <table className="report-data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => {
                let cellValue = row[col.key];
                const isNull = cellValue === null || cellValue === undefined;
                if (isNull) cellValue = "—";

                if (col.obfuscatable && obfuscate && !isNull) {
                  cellValue = obfuscateValue(cellValue);
                } else if (col.format && !isNull) {
                  cellValue = col.format(cellValue);
                }

                return (
                  <td key={col.key}>
                    {col.badge ? <StatusBadge value={cellValue} /> : cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportDataTable;
