import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../../services/productService";
import { uploadImages, deleteImage } from "../../services/uploadService";
import "./EditProduct.css";
import { toast } from "react-toastify";
import PageHeader from "../../components/admin/PageHeader";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    stock: "",
    description: "",
  });

  const [imagesList, setImagesList] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        const product = data.product;

        setFormData({
          title: product.title || "",
          price: product.price || "",
          category: product.category || "",
          stock: product.stock || "",
          description: product.description || "",
        });

        setImagesList(product.images || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    files.forEach((file) => data.append("images", file));

    try {
      const uploadRes = await uploadImages(data);
      setImagesList((prev) => [...prev, ...uploadRes.images]);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload images.");
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
      toast.error(error.response?.data?.message || "Failed to delete image.");
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
      await updateProduct(id, {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        images: imagesList,
        description: formData.description,
      });
      toast.success("Product updated successfully!");
      navigate("/products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px" }}><h2>Loading product...</h2></div>;
  }

  return (
    <div className="edit-product-page">
      <PageHeader
        title="Edit Product"
        subtitle="Update product information and manage its images."
      />

      <div className="edit-product-card">
        <form onSubmit={handleSubmit} className="edit-product-form">
          <input type="text" name="title" placeholder="Product Title" value={formData.title} onChange={handleChange} required disabled={submitting} />
          <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required disabled={submitting} />
          <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required disabled={submitting} />
          <input type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleChange} required disabled={submitting} />

          <div className="image-upload-wrapper">
            <div className="upload-trigger-content">
              <span className="upload-icon">☁</span>
              <strong>Click to upload product images</strong>
              <span>Supports JPEG, JPG, PNG, WEBP (Max 5 images, up to 5MB each)</span>
            </div>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading || submitting || imagesList.length >= 5} />
          </div>

          {uploading && (
            <div className="uploading-spinner"><span>Uploading images to Cloudinary...</span></div>
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
                    <button type="button" className="remove-image-btn" onClick={() => handleRemoveImage(img.public_id)} disabled={uploading || submitting}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <textarea name="description" rows="5" placeholder="Product Description" value={formData.description} onChange={handleChange} required disabled={submitting} />

          <button type="submit" disabled={uploading || submitting}>
            {submitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
