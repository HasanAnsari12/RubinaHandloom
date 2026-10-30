import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./RevenueChart.css";

const RevenueChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="chart-skeleton-box animate-pulse">
        <div className="skeleton-graph-bars"></div>
      </div>
    );
  }

  // Format currency tooltip values
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="chart-custom-tooltip">
          <p className="tooltip-label-date">{payload[0].payload.date}</p>
          <p className="tooltip-value-revenue">
            Revenue: <strong>₹{Number(val).toLocaleString("en-IN")}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="revenue-area-chart-wrapper">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
