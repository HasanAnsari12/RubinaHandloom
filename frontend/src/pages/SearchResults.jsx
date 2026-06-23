// src/pages/SearchResults.jsx

import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";
import "./SearchResults.css";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim().toLowerCase() || "";

  const { products = [] } = useAppContext();

  // Search products
  const filteredProducts = useMemo(() => {
    if (!query) return [];

    return products.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";

      return (
        title.includes(query) ||
        category.includes(query) ||
        description.includes(query)
      );
    });
  }, [products, query]);

  return (
    <div className="search-results-page">
      <div className="container">
        <h1>
          Search Results for: <span>"{query}"</span>
        </h1>

        {!query && (
          <div>
            <p>Please enter a search term.</p>
            <Link to="/products">Browse Products</Link>
          </div>
        )}

        {query && filteredProducts.length === 0 && (
          <div>
            <h2>No products found</h2>
            <p>Try another keyword.</p>
            <Link to="/products">View All Products</Link>
          </div>
        )}

        {query && filteredProducts.length > 0 && (
          <>
            <p>
              {filteredProducts.length} product
              {filteredProducts.length > 1 ? "s" : ""} found
            </p>

            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SearchResults;