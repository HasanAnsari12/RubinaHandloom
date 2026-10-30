import axios from "axios";

const rawBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const cleanBase = rawBase.replace(/\/+$/, "");
const apiBaseUrl = cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;