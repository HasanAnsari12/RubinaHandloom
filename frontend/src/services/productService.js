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
  const token = localStorage.getItem("token");

  const response = await api.post(
    "/products",
    productData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const token = localStorage.getItem("token");

  const response = await api.delete(
    `/products/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Update product
export const updateProduct = async (
  id,
  productData
) => {
  const token = localStorage.getItem("token");

  const response = await api.put(
    `/products/${id}`,
    productData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};