// frontend/src/services/orderService.js
import api from "./api";

// Place a new order in database
export const placeOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

// Get logged in user's orders from database
export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

// Get single order details from database
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Cancel an order in database
export const cancelOrder = async (id) => {
  const response = await api.put(`/orders/${id}/cancel`);
  return response.data;
};
