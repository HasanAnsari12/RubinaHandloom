import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "./SalesTrendChart.css";

const SalesTrendChart = ({ data = [], loading = false }) => {
  const [metric, setMetric] = useState("revenue"); // "revenue" | "orders"

  if (loading) {
    return (
      <div className="chart-skeleton-box animate-pulse">
        <div className="skeleton-graph-bars"></div>
      </div>
    );
  }

  const handleMetricToggle = (selected) => {
    setMetric(selected);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isRev = metric === "revenue";
      return (
        <div className="chart-custom-tooltip">
          <p className="tooltip-label-date">{payload[0].payload.date}</p>
          <p className="tooltip-value-revenue">
            {isRev ? "Sales Revenue" : "Orders Count"}:{" "}
            <strong>
              {isRev ? `₹${Number(val).toLocaleString("en-IN")}` : val}
            </strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="sales-trend-chart-wrapper">
      {/* Metric Selector deck */}
      <div className="trend-metric-selectors-row">
        <button
          type="button"
          className={`trend-toggle-btn ${metric === "revenue" ? "active" : ""}`}
          onClick={() => handleMetricToggle("revenue")}
        >
          💰 Revenue
        </button>
        <button
          type="button"
          className={`trend-toggle-btn ${metric === "orders" ? "active" : ""}`}
          onClick={() => handleMetricToggle("orders")}
        >
          📦 Orders count
        </button>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis
            dataKey="date"
            stroke="var(--text-secondary)"
            fontSize={11}
            tickLine={false}
            dy={10}
          />
          <YAxis
            stroke="var(--text-secondary)"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => {
              if (metric === "revenue") {
                return `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`;
              }
              return v;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="var(--accent)" // Luxury Antique Gold line stroke
            strokeWidth={3}
            dot={{ r: 3, fill: "var(--accent)", strokeWidth: 1 }}
            activeDot={{ r: 5, fill: "var(--primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesTrendChart;
