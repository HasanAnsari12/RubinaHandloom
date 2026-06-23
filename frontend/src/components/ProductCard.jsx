// src/components/ProductCard.jsx

import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img
        src={product.images?.[0] || product.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"}
        alt={product.title}
      />

      <h3>{product.title}</h3>

      <p>₹{product.price}</p>

      <Link to={`/product/${product.id || product._id}`}>
        View Details
      </Link>
    </div>
  );
}

export default ProductCard;