import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach admin JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
 * Future Enhancement: Axios Response Interceptor for 401 Expirations
 * api.interceptors.response.use(
 *   (response) => response,
 *   (error) => {
 *     if (error.response && error.response.status === 401) {
 *       localStorage.removeItem("adminToken");
 *       localStorage.removeItem("adminUser");
 *       window.location.href = "/login";
 *     }
 *     return Promise.reject(error);
 *   }
 * );
 */

export default api;
