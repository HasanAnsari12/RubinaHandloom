import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  getProductById,
  updateProduct,
} from "../services/productService";
import "./EditProduct.css";
import { toast } from "react-toastify";
function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    description: "",
  });

  // Load existing product
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
          image: product.images?.[0] || "",
          description:
            product.description || "",
        });
      } catch (error) {
        console.error(error);
        alert("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        images: [formData.image],
        description: formData.description,
      };

      await updateProduct(id, productData);

      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product.");
    }
  };

  if (loading) {
    return (
      <h1 style={{ padding: "40px" }}>
        Loading product...
      </h1>
    );
  }

  return (
    <div className="edit-product-page">
      <div className="edit-product-card">
        <h1>Edit Product</h1>
        <p>
          Update your product information and save
          changes.
        </p>

        <form
          onSubmit={handleSubmit}
          className="edit-product-form"
        >
          <input
            type="text"
            name="title"
            placeholder="Product Title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock Quantity"
            value={formData.stock}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            rows="5"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;