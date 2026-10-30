import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import "./OrdersChart.css";

const OrdersChart = ({ data = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="chart-skeleton-box animate-pulse">
        <div className="skeleton-graph-bars"></div>
      </div>
    );
  }

  // Transform object to recharts array format
  const chartData = [
    { name: "Pending", value: data.Pending || 0, color: "#D97706" }, // Orange
    { name: "Processing", value: data.Processing || 0, color: "#2563EB" }, // Blue
    { name: "Shipped", value: data.Shipped || 0, color: "#7C3AED" }, // Purple
    { name: "Delivered", value: data.Delivered || 0, color: "#16A34A" }, // Green
    { name: "Cancelled", value: data.Cancelled || 0, color: "#DC2626" }, // Red
  ].filter((item) => item.value > 0); // Hide empty slices

  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0);

  if (totalOrders === 0) {
    return (
      <div className="empty-donut-placeholder select-none">
        <span>📦</span>
        <p>No orders registered for the selected date range</p>
      </div>
    );
  }

  return (
    <div className="orders-donut-chart-wrapper">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} Orders`, "Volume"]} />
          <Legend iconSize={10} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center-total-text select-none">
        <strong>{totalOrders}</strong>
        <span>Claims</span>
      </div>
    </div>
  );
};

export default OrdersChart;
