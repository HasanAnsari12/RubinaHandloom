// Report type definitions and configurations
export const REPORT_TYPES = {
  Sales: {
    key: "Sales",
    label: "Sales Report",
    icon: "💰",
    description: "Revenue, discounts, AOV, and tax breakdown by period",
    color: "#7B1E3A",
  },
  Orders: {
    key: "Orders",
    label: "Orders Report",
    icon: "📦",
    description: "Order status, payment methods, and delivery tracking",
    color: "#2563EB",
  },
  Products: {
    key: "Products",
    label: "Products Report",
    icon: "🛍️",
    description: "Sales volumes, inventory stock, and revenue per product",
    color: "#7C3AED",
  },
  Customers: {
    key: "Customers",
    label: "Customers Report",
    icon: "👥",
    description: "Lifetime spend, returning rates, and acquisition trends",
    color: "#16A34A",
  },
  Coupons: {
    key: "Coupons",
    label: "Coupons Report",
    icon: "🎟️",
    description: "Redemptions, savings generated, and campaign performance",
    color: "#D97706",
  },
  Reviews: {
    key: "Reviews",
    label: "Reviews Report",
    icon: "⭐",
    description: "Star ratings, moderation status, and sentiment analysis",
    color: "#DC2626",
  },
};

export const REPORT_TYPE_LIST = Object.values(REPORT_TYPES);

// Date preset filters
export const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "7days", label: "Last 7 Days" },
  { key: "30days", label: "Last 30 Days" },
  { key: "90days", label: "Last 90 Days" },
  { key: "year", label: "This Year" },
  { key: "custom", label: "Custom Range" },
];

// Saved filter presets (templates)
export const SAVED_PRESETS = [
  { key: "last-month-sales", label: "Last Month Sales", reportType: "Sales", days: 30 },
  { key: "today-orders", label: "Today's Orders", reportType: "Orders", days: 0 },
  { key: "top-customers", label: "Top Customers", reportType: "Customers", days: 90 },
  { key: "cancelled-orders", label: "Cancelled Orders", reportType: "Orders", days: 30, extraFilters: { orderStatus: "Cancelled" } },
  { key: "coupons-expiring", label: "Coupons Expiring Soon", reportType: "Coupons", days: 7 },
];

// Group By options (used by Sales Report)
export const GROUP_BY_OPTIONS = [
  { key: "Day", label: "Daily" },
  { key: "Week", label: "Weekly" },
  { key: "Month", label: "Monthly" },
  { key: "Quarter", label: "Quarterly" },
  { key: "Year", label: "Yearly" },
];

// Available CSV Column keys per report type
export const REPORT_COLUMNS = {
  Sales: [
    { key: "dateGroup", label: "Date / Period" },
    { key: "ordersCount", label: "Orders Count" },
    { key: "revenue", label: "Revenue (₹)" },
    { key: "discount", label: "Discounts (₹)" },
    { key: "shippingCharge", label: "Shipping (₹)" },
    { key: "tax", label: "Tax (₹)" },
    { key: "refundsCount", label: "Refunds Count" },
    { key: "refundsAmount", label: "Refunds (₹)" },
    { key: "aov", label: "AOV (₹)" },
  ],
  Orders: [
    { key: "orderId", label: "Order ID" },
    { key: "customerName", label: "Customer Name" },
    { key: "customerEmail", label: "Customer Email" },
    { key: "subtotal", label: "Subtotal (₹)" },
    { key: "discount", label: "Discount (₹)" },
    { key: "shippingCharge", label: "Shipping (₹)" },
    { key: "totalAmount", label: "Total (₹)" },
    { key: "orderStatus", label: "Order Status" },
    { key: "paymentMethod", label: "Payment Method" },
    { key: "paymentStatus", label: "Payment Status" },
    { key: "date", label: "Date" },
  ],
  Products: [
    { key: "title", label: "Product Title" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price (₹)" },
    { key: "stock", label: "Stock" },
    { key: "status", label: "Status" },
    { key: "unitsSold", label: "Units Sold" },
    { key: "revenue", label: "Revenue (₹)" },
    { key: "rating", label: "Rating" },
    { key: "numReviews", label: "Reviews" },
  ],
  Customers: [
    { key: "name", label: "Customer Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "ordersCount", label: "Orders" },
    { key: "totalSpent", label: "Lifetime Spend (₹)" },
    { key: "couponsUsed", label: "Coupons Claimed" },
    { key: "joinedDate", label: "Join Date" },
  ],
  Coupons: [
    { key: "code", label: "Coupon Code" },
    { key: "title", label: "Campaign Title" },
    { key: "discountType", label: "Discount Type" },
    { key: "discountValue", label: "Discount Value" },
    { key: "status", label: "Status" },
    { key: "usedCount", label: "Redemptions" },
    { key: "totalSavings", label: "Savings (₹)" },
    { key: "validUntil", label: "Expiry Date" },
  ],
  Reviews: [
    { key: "productTitle", label: "Product" },
    { key: "customerName", label: "Customer" },
    { key: "customerEmail", label: "Email" },
    { key: "rating", label: "Stars" },
    { key: "status", label: "Status" },
    { key: "comment", label: "Comment" },
    { key: "date", label: "Date" },
  ],
};

export const EXPORT_FORMATS = [
  { key: "CSV", label: "Download CSV", icon: "📄" },
  { key: "Excel", label: "Download Excel", icon: "📊" },
  { key: "Print", label: "Print / PDF", icon: "🖨️" },
];

export const HISTORY_STATUS_COLORS = {
  Success: { bg: "#D1FAE5", text: "#065F46" },
  Failed: { bg: "#FEE2E2", text: "#991B1B" },
  Processing: { bg: "#FEF3C7", text: "#92400E" },
};
