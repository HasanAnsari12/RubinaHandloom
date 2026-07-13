import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};
