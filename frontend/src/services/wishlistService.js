// frontend/src/services/wishlistService.js
import api from "./api";

// Get user's wishlist from database
export const getWishlist = async () => {
  const response = await api.get("/wishlist");
  return response.data;
};

// Add product to wishlist in database
export const addToWishlist = async (productId) => {
  const response = await api.post("/wishlist", { productId });
  return response.data;
};

// Remove a specific product from wishlist in database
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

// Clear all items from wishlist in database
export const clearWishlist = async () => {
  const response = await api.delete("/wishlist");
  return response.data;
};
