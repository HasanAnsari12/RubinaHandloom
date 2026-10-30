import React from "react";
import StatCard from "./StatCard";
import "./OrderStats.css";

const OrderStats = ({ orders = [] }) => {
  const totalOrders = orders.length;
  const pending = orders.filter((o) => (o.orderStatus || "").toLowerCase() === "pending").length;
  const processing = orders.filter((o) => (o.orderStatus || "").toLowerCase() === "processing").length;
  const shipped = orders.filter((o) => (o.orderStatus || "").toLowerCase() === "shipped").length;
  const delivered = orders.filter((o) => (o.orderStatus || "").toLowerCase() === "delivered").length;
  const cancelled = orders.filter((o) => (o.orderStatus || "").toLowerCase() === "cancelled").length;

  // Total Revenue: Cancelled orders must be explicitly excluded from the calculation.
  const totalRevenue = orders
    .filter((o) => (o.orderStatus || "").toLowerCase() !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || o.totalPrice || 0), 0);

  return (
    <div className="order-stats-deck">
      <StatCard
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString("en-IN")}`}
        icon="💰"
        subtitle="active revenue"
      />
      <StatCard
        title="Total Orders"
        value={totalOrders}
        icon="📦"
        subtitle="all checkout logs"
      />
      <StatCard
        title="Pending"
        value={pending}
        icon="⏳"
        subtitle="requires verification"
      />
      <StatCard
        title="Processing"
        value={processing}
        icon="⚙️"
        subtitle="weaving & packing"
      />
      <StatCard
        title="Shipped"
        value={shipped}
        icon="🚚"
        subtitle="in transit"
      />
      <StatCard
        title="Delivered"
        value={delivered}
        icon="✅"
        subtitle="handed to customer"
      />
      <StatCard
        title="Cancelled"
        value={cancelled}
        icon="🚫"
        subtitle="void orders"
      />
    </div>
  );
};

export default OrderStats;
