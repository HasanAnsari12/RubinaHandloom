const rawBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const cleanBase = rawBase.replace(/\/+$/, "");
export const API_BASE_URL = cleanBase.endsWith("/api")
  ? cleanBase
  : `${cleanBase}/api`;

export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

export const ORDER_STATUS = {
  PENDING: "Pending",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
