import api from "./api";

/**
 * Exposes only admin-specific authentication APIs and session management.
 * Reuses the shared backend authentication endpoints.
 */

export const loginAdmin = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  const { token, user } = response.data;

  // Enforce admin-role access check on the client-side immediately
  if (user && user.role === "admin") {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));
    return { token, user };
  } else {
    throw new Error("Access denied. Admin credentials required.");
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};

export const getCurrentAdmin = () => {
  const adminData = localStorage.getItem("adminUser");
  return adminData ? JSON.parse(adminData) : null;
};

export const verifySession = async () => {
  const response = await api.get("/auth/me");
  const user = response.data.user;

  if (user && user.role === "admin") {
    localStorage.setItem("adminUser", JSON.stringify(user));
    return user;
  } else {
    logoutAdmin();
    throw new Error("Access denied. Session is invalid or not an admin.");
  }
};
