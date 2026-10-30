import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./ReportChart.css";

const COLORS = {
  primary: "#7B1E3A",
  secondary: "#2563EB",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="report-chart-tooltip">
        <div className="chart-tooltip-label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="chart-tooltip-row">
            <span className="chart-tooltip-name">{p.name}:</span>
            <span className="chart-tooltip-value" style={{ color: p.color }}>
              {typeof p.value === "number" && p.name.toLowerCase().includes("revenue")
                ? `₹${p.value.toLocaleString("en-IN")}`
                : p.value.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ReportChart = ({ data = [], reportType = "Sales", chartType = "bar" }) => {
  const { chartData, bars, lines } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], bars: [], lines: [] };

    if (reportType === "Sales") {
      return {
        chartData: data.map((d) => ({
          name: d.dateGroup,
          Revenue: d.revenue,
          Orders: d.ordersCount,
          Discount: d.discount,
        })),
        bars: [
          { key: "Revenue", color: COLORS.primary },
          { key: "Discount", color: COLORS.warning },
        ],
        lines: [{ key: "Orders", color: COLORS.secondary }],
      };
    }

    if (reportType === "Orders") {
      const grouped = {};
      data.forEach((d) => {
        const date = (d.date || "").slice(0, 10);
        if (!grouped[date]) grouped[date] = { name: date, Orders: 0, Revenue: 0 };
        grouped[date].Orders += 1;
        grouped[date].Revenue += d.totalAmount || 0;
      });
      const sortedData = Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
      return {
        chartData: sortedData,
        bars: [{ key: "Revenue", color: COLORS.primary }],
        lines: [{ key: "Orders", color: COLORS.secondary }],
      };
    }

    if (reportType === "Products") {
      const topData = [...data]
        .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 10)
        .map((d) => ({
          name: d.title?.length > 16 ? d.title.slice(0, 16) + "…" : d.title,
          Revenue: d.revenue || 0,
          "Units Sold": d.unitsSold || 0,
        }));
      return {
        chartData: topData,
        bars: [
          { key: "Revenue", color: COLORS.primary },
          { key: "Units Sold", color: COLORS.secondary },
        ],
        lines: [],
      };
    }

    if (reportType === "Customers") {
      const topData = [...data]
        .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
        .slice(0, 10)
        .map((d) => ({
          name: d.name?.length > 14 ? d.name.slice(0, 14) + "…" : d.name,
          Spend: d.totalSpent || 0,
          Orders: d.ordersCount || 0,
        }));
      return {
        chartData: topData,
        bars: [{ key: "Spend", color: COLORS.primary }],
        lines: [],
      };
    }

    if (reportType === "Coupons") {
      const topData = [...data]
        .sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0))
        .slice(0, 10)
        .map((d) => ({
          name: d.code,
          Claims: d.usedCount || 0,
          Savings: d.totalSavings || 0,
        }));
      return {
        chartData: topData,
        bars: [
          { key: "Claims", color: COLORS.primary },
          { key: "Savings", color: COLORS.warning },
        ],
        lines: [],
      };
    }

    if (reportType === "Reviews") {
      const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      data.forEach((r) => {
        const star = Math.round(r.rating || 0);
        if (ratingDist[star] !== undefined) ratingDist[star]++;
      });
      return {
        chartData: [5, 4, 3, 2, 1].map((s) => ({ name: `${s} ★`, Reviews: ratingDist[s] })),
        bars: [{ key: "Reviews", color: COLORS.primary }],
        lines: [],
      };
    }

    return { chartData: [], bars: [], lines: [] };
  }, [data, reportType]);

  if (!chartData || chartData.length === 0) return null;

  const isBarPrimary = chartType !== "line";

  return (
    <div className="report-chart-wrapper">
      <h4 className="report-chart-title">
        {reportType === "Sales" && "Revenue & Orders Trend"}
        {reportType === "Orders" && "Order Volume Over Time"}
        {reportType === "Products" && "Top 10 Products by Revenue"}
        {reportType === "Customers" && "Top 10 Customers by Spend"}
        {reportType === "Coupons" && "Top 10 Coupons by Claims"}
        {reportType === "Reviews" && "Rating Distribution"}
      </h4>
      <div className="report-chart-body">
        <ResponsiveContainer width="100%" height={260}>
          {isBarPrimary ? (
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {bars.map((b) => (
                <Bar key={b.key} dataKey={b.key} fill={b.color} radius={[3, 3, 0, 0]} maxBarSize={48} />
              ))}
              {lines.map((l) => (
                <Line
                  key={l.key}
                  type="monotone"
                  dataKey={l.key}
                  stroke={l.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {bars.map((b) => (
                <Line key={b.key} type="monotone" dataKey={b.key} stroke={b.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportChart;
