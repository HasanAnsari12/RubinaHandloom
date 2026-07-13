import api from "./api";

// Get all products
export const getAllProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

// Get single product
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Create product (Admin only)
export const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

// Delete product (Admin only)
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Update product (Admin only)
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};
