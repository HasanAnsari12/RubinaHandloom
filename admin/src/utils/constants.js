export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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
