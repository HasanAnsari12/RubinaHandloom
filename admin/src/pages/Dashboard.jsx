import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

// Reusable components
import PageHeader from "../components/admin/PageHeader";
import DashboardFilters from "../components/admin/dashboard/DashboardFilters";
import DashboardStatsCard from "../components/admin/dashboard/DashboardStatsCard";
import DashboardSection from "../components/admin/dashboard/DashboardSection";

// Charting & visual widgets
import RevenueChart from "../components/admin/dashboard/RevenueChart";
import SalesTrendChart from "../components/admin/dashboard/SalesTrendChart";
import OrdersChart from "../components/admin/dashboard/OrdersChart";
import RatingDistributionChart from "../components/admin/dashboard/RatingDistributionChart";
import TopProductsTable from "../components/admin/dashboard/TopProductsTable";
import InventoryAlerts from "../components/admin/dashboard/InventoryAlerts";
import RecentOrdersCard from "../components/admin/dashboard/RecentOrdersCard";
import RecentUsersCard from "../components/admin/dashboard/RecentUsersCard";
import CouponPerformanceCard from "../components/admin/dashboard/CouponPerformanceCard";

import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterRange, setFilterRange] = useState("30days");

  // Centralized API Error Response handler
  const handleApiError = useCallback((error, fallbackMessage) => {
    console.error("Dashboard API Error:", error);
    if (!error.response) {
      toast.error("Unable to reach server. Please check your internet connection.");
      return;
    }

    const { status, data: errData } = error.response;
    switch (status) {
      case 401:
        toast.error("Session expired. Please log in again.");
        break;
      case 403:
        toast.error("Access Denied: You do not have permissions to access this console.");
        break;
      case 404:
        toast.error("Dashboard stats currently unavailable.");
        break;
      default:
        toast.error(errData?.message || fallbackMessage);
    }
  }, []);

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const res = await api.get(`/admin/dashboard?filterRange=${filterRange}`);
      setData(res.data);
    } catch (error) {
      handleApiError(error, "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterRange, handleApiError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
    toast.success("Dashboard metrics synced successfully.");
  };

  const handleFilterRangeChange = (range) => {
    setFilterRange(range);
  };

  // Format currency strings helper
  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString("en-IN")}`;
  };

  const overview = data?.overview || {};

  return (
    <div className="executive-dashboard-grid">
      <PageHeader
        title="Executive Overview"
        subtitle="Consolidated business intelligence across Sales, Products, Customers, and Marketing campaigns."
      />

      {/* Global Presets Date Toolbar */}
      <DashboardFilters
        filterRange={filterRange}
        onFilterChange={handleFilterRangeChange}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
      />

      {/* Real-time KPI Cards Row */}
      <div className="dashboard-kpi-cards-grid-six">
        <DashboardStatsCard
          title="Net Sales Revenue"
          value={formatCurrency(overview.revenue)}
          icon="💰"
          trend="positive"
          trendValue="12.5%"
          subtitle="from last period"
          loading={loading}
        />
        <DashboardStatsCard
          title="Orders Claimed"
          value={overview.ordersCount || "0"}
          icon="📦"
          trend="positive"
          trendValue="8.4%"
          subtitle="saree orders"
          loading={loading}
        />
        <DashboardStatsCard
          title="Average Order Value"
          value={formatCurrency(overview.averageOrderValue)}
          icon="📊"
          subtitle="per cart claim"
          loading={loading}
        />
        <DashboardStatsCard
          title="Total Customers"
          value={overview.usersCount || "0"}
          icon="👥"
          trend="positive"
          trendValue="4.2%"
          subtitle="registered users"
          loading={loading}
        />
        <DashboardStatsCard
          title="Active Products"
          value={overview.productsCount || "0"}
          icon="🛍️"
          subtitle="catalog count"
          loading={loading}
        />
        <DashboardStatsCard
          title="Review Average"
          value={`${Number(overview.averageRating || 0).toFixed(1)}★`}
          icon="⭐"
          subtitle={`${overview.reviewsCount || 0} customer reviews`}
          loading={loading}
        />
      </div>

      {/* Section 1: Revenue Graphs */}
      <div className="dashboard-charts-two-columns-row">
        <DashboardSection
          title="Sales Revenue Overview"
          subtitle="Interactive chart mapping sales growth fluctuations"
          loading={loading}
          empty={!data?.salesTrend || data.salesTrend.length === 0}
        >
          <RevenueChart data={data?.salesTrend} loading={loading} />
        </DashboardSection>

        <DashboardSection
          title="Campaigns Sales Trend"
          subtitle="Dynamic line variables toggle details"
          loading={loading}
          empty={!data?.salesTrend || data.salesTrend.length === 0}
        >
          <SalesTrendChart data={data?.salesTrend} loading={loading} />
        </DashboardSection>
      </div>

      {/* Section 2: Order Status & Rating Distribution */}
      <div className="dashboard-charts-two-columns-row">
        <DashboardSection
          title="Orders Status Distribution"
          subtitle="Breakdown of checkout order states"
          loading={loading}
          empty={!data?.orderStatusDistribution}
        >
          <OrdersChart data={data?.orderStatusDistribution} loading={loading} />
        </DashboardSection>

        <DashboardSection
          title="Rating Distribution"
          subtitle="Star reviews percentages summaries"
          loading={loading}
          empty={!data?.reviewMetrics}
        >
          <RatingDistributionChart
            averageRating={overview.averageRating}
            starDistribution={data?.reviewMetrics?.starDistribution}
            totalReviews={overview.reviewsCount}
            loading={loading}
          />
        </DashboardSection>
      </div>

      {/* Section 3: Top Products & Inventory Alerts */}
      <div className="dashboard-charts-two-columns-row">
        <DashboardSection
          title="Best Selling Products"
          subtitle="Saree collections driving highest purchase counts"
          loading={loading}
          empty={!data?.productMetrics?.topSellingProducts || data.productMetrics.topSellingProducts.length === 0}
          className="span-selling-products-table"
        >
          <TopProductsTable
            products={data?.productMetrics?.topSellingProducts}
            loading={loading}
          />
        </DashboardSection>

        <DashboardSection
          title="Inventory Stock Alerts"
          subtitle="Low-stock or out-of-stock items requiring refilling"
          loading={loading}
          empty={!data?.productMetrics?.inventoryAlerts || data.productMetrics.inventoryAlerts.length === 0}
        >
          <InventoryAlerts
            items={data?.productMetrics?.inventoryAlerts}
            loading={loading}
          />
        </DashboardSection>
      </div>

      {/* Section 4: Recent Orders, Users & Coupon performance */}
      <div className="dashboard-three-columns-row">
        <DashboardSection
          title="Recent Checkout Claims"
          subtitle="Latest processed client orders list"
          loading={loading}
          empty={!data?.recentOrders || data.recentOrders.length === 0}
        >
          <RecentOrdersCard orders={data?.recentOrders} loading={loading} />
        </DashboardSection>

        <DashboardSection
          title="New Registrations"
          subtitle="Latest customer profile signs"
          loading={loading}
          empty={!data?.userMetrics?.recentRegistrations || data.userMetrics.recentRegistrations.length === 0}
        >
          <RecentUsersCard
            users={data?.userMetrics?.recentRegistrations}
            loading={loading}
          />
        </DashboardSection>

        <DashboardSection
          title="Coupon Performance Card"
          subtitle="Top performing marketing campaign claim summaries"
          loading={loading}
          empty={!data?.couponMetrics}
        >
          <CouponPerformanceCard
            topCoupon={data?.couponMetrics?.topCoupon}
            loading={loading}
          />
        </DashboardSection>
      </div>
    </div>
  );
};

export default Dashboard;
