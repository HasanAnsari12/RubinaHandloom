import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../services/productService";
import { uploadImages, deleteImage } from "../../services/uploadService";
import "./AddProduct.css";
import { toast } from "react-toastify";
import PageHeader from "../../components/admin/PageHeader";

function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    stock: "",
    description: "",
  });

  const [imagesList, setImagesList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    if (imagesList.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }

    setUploading(true);

    const data = new FormData();
    files.forEach((file) => {
      data.append("images", file);
    });

    try {
      const uploadRes = await uploadImages(data);
      setImagesList((prev) => [...prev, ...uploadRes.images]);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload images to Cloudinary."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = async (publicId) => {
    try {
      await deleteImage(publicId);
      setImagesList((prev) => prev.filter((img) => img.public_id !== publicId));
      toast.success("Image removed successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete image from Cloudinary."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imagesList.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    setSubmitting(true);

    try {
      const productData = {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        images: imagesList,
        description: formData.description,
      };

      await createProduct(productData);

      toast.success("Product added successfully!");
      navigate("/products");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-page">
      <PageHeader
        title="Add New Product"
        subtitle="Upload images and enter information to create a new saree product."
      />

      <div className="add-product-card">
        <form onSubmit={handleSubmit} className="add-product-form">
          <input
            type="text"
            name="title"
            placeholder="Product Title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={submitting}
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            disabled={submitting}
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={submitting}
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock Quantity"
            value={formData.stock}
            onChange={handleChange}
            required
            disabled={submitting}
          />

          {/* Cloudinary Multi-Image Uploader Dropzone */}
          <div className="image-upload-wrapper">
            <div className="upload-trigger-content">
              <span className="upload-icon">☁</span>
              <strong>Click to upload product images</strong>
              <span>Supports JPEG, JPG, PNG, WEBP (Max 5 images, up to 5MB each)</span>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading || submitting || imagesList.length >= 5}
            />
          </div>

          {uploading && (
            <div className="uploading-spinner">
              <span>Uploading images to Cloudinary...</span>
            </div>
          )}

          {imagesList.length > 0 && (
            <div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", margin: "10px 0" }}>
                Uploaded Images ({imagesList.length}/5):
              </p>
              <div className="uploaded-images-preview">
                {imagesList.map((img, index) => (
                  <div key={index} className="preview-thumbnail">
                    <img src={img.url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(img.public_id)}
                      disabled={uploading || submitting}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <textarea
            name="description"
            placeholder="Product Description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            required
            disabled={submitting}
          />

          <button type="submit" disabled={uploading || submitting}>
            {submitting ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
