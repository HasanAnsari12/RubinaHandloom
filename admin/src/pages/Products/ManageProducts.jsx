import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts, deleteProduct } from "../../services/productService";
import "./ManageProducts.css";
import { toast } from "react-toastify";
import PageHeader from "../../components/admin/PageHeader";

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product.");
    }
  };

  if (loading) {
    return (
      <div>
        <h2>Loading products...</h2>
      </div>
    );
  }

  return (
    <div className="manage-products-page">
      <PageHeader
        title="Manage Products"
        subtitle="View, edit, and manage your product catalog."
      >
        <Link to="/products/add" className="add-product-btn">
          + Add Product
        </Link>
      </PageHeader>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No products found. Click "+ Add Product" to create one.
        </div>
      ) : (
        <div className="admin-products-grid">
          {products.map((product) => (
            <div key={product._id} className="admin-product-card">
              <img
                src={
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                }
                alt={product.title}
              />

              <div className="admin-product-content">
                <h3>{product.title}</h3>
                <p className="product-category">{product.category}</p>

                <div className="product-meta">
                  <span className="price-tag">₹{product.price}</span>
                  <span className="stock-count">{product.stock} in stock</span>
                </div>

                <div className="product-actions">
                  <Link to={`/products/edit/${product._id}`} className="edit-btn">
                    Edit
                  </Link>

                  <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageProducts;
