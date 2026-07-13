// frontend/src/services/cartService.js
import api from "./api";

// Get user's cart from database
export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

// Add product to cart in database
export const addToCart = async (productId, quantity) => {
  const response = await api.post("/cart", { productId, quantity });
  return response.data;
};

// Update cart item quantity in database
export const updateCartItemQuantity = async (productId, quantity) => {
  const response = await api.put("/cart", { productId, quantity });
  return response.data;
};

// Remove a specific product from cart in database
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// Clear all items from cart in database
export const clearCart = async () => {
  const response = await api.delete("/cart");
  return response.data;
};
