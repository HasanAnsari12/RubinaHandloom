import React from "react";
import StatCard from "./StatCard";
import "./CategoryStats.css";

const CategoryStats = ({ categories = [] }) => {
  const total = categories.length;
  const active = categories.filter((c) => c.status === "Active").length;
  const inactive = categories.filter((c) => c.status === "Inactive").length;
  const hidden = categories.filter((c) => c.status === "Hidden").length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.productsCount || 0), 0);

  return (
    <div className="category-stats-deck">
      <StatCard title="Total Categories" value={total} icon="📂" subtitle="weaving collections" />
      <StatCard title="Active" value={active} icon="🟢" trend="positive" subtitle="visible in navigation" />
      <StatCard title="Inactive" value={inactive} icon="⚪" subtitle="draft mode" />
      <StatCard title="Hidden" value={hidden} icon="👁️‍🌫️" trend="neutral" subtitle="hidden collections" />
      <StatCard title="Assigned Products" value={totalProducts} icon="🏷️" subtitle="items in catalog" />
    </div>
  );
};

export default CategoryStats;
