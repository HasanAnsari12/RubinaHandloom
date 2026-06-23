import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllProducts,
  deleteProduct,
} from "../services/productService";
import "./AdminProducts.css";
import { toast } from "react-toastify";
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  // Run once when component loads
  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(id);
      toast.success(
  "Product updated successfully!"
);
      fetchProducts();
    } catch (error) {
      console.error(error);
toast.error(
  "Failed to update product."
);
    }
  };

  if (loading) {
    return (
      <h1 style={{ padding: "40px" }}>
        Loading products...
      </h1>
    );
  }

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <div>
          <h1>Manage Products</h1>
          <p>View, edit, and manage your product catalog.</p>
        </div>

        <Link
          to="/admin/add-product"
          className="add-product-btn"
        >
          + Add Product
        </Link>
      </div>

      <div className="admin-products-grid">
        {products.map((product) => (
          <div
            key={product._id}
            className="admin-product-card"
          >
            <img
              src={
                product.images?.[0] ||
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
              }
              alt={product.title}
            />

            <div className="admin-product-content">
              <h3>{product.title}</h3>
              <p>{product.category}</p>

              <div className="product-meta">
                <span>₹{product.price}</span>
                <span>{product.stock} in stock</span>
              </div>

              <div className="product-actions">
                <Link
                  to={`/admin/edit-product/${product._id}`}
                  className="edit-btn"
                  style={{
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Edit
                </Link>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(product._id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminProducts;