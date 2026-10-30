import React from "react";
import StatCard from "./StatCard";
import "./ProductStats.css";

const ProductStats = ({ products = [] }) => {
  const total = products.length;
  const active = products.filter((p) => p.stock > 0).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  
  const uniqueCategories = new Set(products.map((p) => p.category?.toLowerCase()?.trim()).filter(Boolean));
  const categoriesCount = uniqueCategories.size;

  return (
    <div className="product-stats-deck">
      <StatCard
        title="Total Products"
        value={total}
        icon="🛍️"
        subtitle="catalog entries"
      />
      <StatCard
        title="Active"
        value={active}
        icon="✅"
        trend={active > 0 ? "positive" : "neutral"}
        subtitle="in stock items"
      />
      <StatCard
        title="Low Stock"
        value={lowStock}
        icon="⚠️"
        trend={lowStock > 0 ? "negative" : "positive"}
        subtitle="under 5 units remaining"
      />
      <StatCard
        title="Out of Stock"
        value={outOfStock}
        icon="🚫"
        trend={outOfStock > 0 ? "negative" : "positive"}
        subtitle="needs restocking"
      />
      <StatCard
        title="Categories"
        value={categoriesCount}
        icon="🏷️"
        subtitle="unique departments"
      />
    </div>
  );
};

export default ProductStats;
