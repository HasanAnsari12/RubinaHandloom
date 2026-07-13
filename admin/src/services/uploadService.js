import api from "./api";

/**
 * Upload multiple images to the backend (max 5).
 * 
 * @param {FormData} formData - FormData object containing the "images" files array
 * @returns {Promise<object>} Upload response containing the images list of objects { url, public_id }
 */
export const uploadImages = async (formData) => {
  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Delete a product image from Cloudinary using its public ID.
 * 
 * @param {string} publicId - The Cloudinary public ID
 * @returns {Promise<object>} Deletion response
 */
export const deleteImage = async (publicId) => {
  const response = await api.post("/upload/delete", { public_id: publicId });
  return response.data;
};
