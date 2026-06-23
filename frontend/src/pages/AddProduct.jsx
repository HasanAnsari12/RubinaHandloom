import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/productService";
import "./AddProduct.css";
import { toast } from "react-toastify";

function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    description: "",
  });

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
        // Single image bhi chalegi, multiple images bhi comma se add kar sakte ho
        images: formData.image
          .split(",")
          .map((img) => img.trim()),
        description: formData.description,
      };

      await createProduct(productData);

      toast.success("Product added successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add product.");
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-card">
        <h1>Add New Product</h1>
        <p>Create a new saree product for your store.</p>

        <form
          onSubmit={handleSubmit}
          className="add-product-form"
        >
          {/* Product Title */}
          <input
            type="text"
            name="title"
            placeholder="Product Title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          {/* Price */}
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          {/* Category */}
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
          />

          {/* Stock */}
          <input
            type="number"
            name="stock"
            placeholder="Stock Quantity"
            value={formData.stock}
            onChange={handleChange}
            required
          />

          {/* Image URL */}
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            required
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Product Description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            required
          />

          {/* Submit Button */}
          <button type="submit">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;