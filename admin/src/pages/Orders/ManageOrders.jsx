import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

// Reusable components
import PageHeader from "../../components/admin/PageHeader";
import OrderStats from "../../components/admin/OrderStats";
import OrdersToolbar from "../../components/admin/OrdersToolbar";
import OrdersTable from "../../components/admin/OrdersTable";
import OrderDetailsDrawer from "../../components/admin/OrderDetailsDrawer";
import EmptyState from "../../components/admin/EmptyState";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";

import "./ManageOrders.css";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Filter, Search, Sort & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Checkbox IDs for Bulk placeholders
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail Drawer States
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  // Centralized Error Handler
  const handleApiError = useCallback((error, fallbackMessage) => {
    console.error("API Error context:", error);
    if (!error.response) {
      toast.error("Unable to reach server. Please check your internet connection.");
      return;
    }

    const { status, data } = error.response;
    switch (status) {
      case 401:
        toast.error("Session expired. Please log in again.");
        break;
      case 403:
        toast.error("Access Denied: You do not have permissions to perform this action.");
        break;
      case 404:
        toast.error("Order not found: The requested record does not exist.");
        break;
      case 422:
        const validationMsg = data?.message || "Validation failed on server.";
        toast.error(`Validation Error: ${validationMsg}`);
        break;
      case 500:
        toast.error("A server error occurred. Please try again later.");
        break;
      default:
        toast.error(data?.message || fallbackMessage);
    }
  }, []);

  const fetchOrders = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const res = await api.get("/orders");
      const loadedOrders = res.data.orders || [];
      setOrders(loadedOrders);

      // If active drawer is open, synchronize the activeOrder object reference
      if (activeOrder) {
        const updatedRef = loadedOrders.find((o) => o._id === activeOrder._id);
        if (updatedRef) {
          setActiveOrder(updatedRef);
        }
      }
    } catch (error) {
      handleApiError(error, "Failed to load orders catalog.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Manual Toolbar Refresh
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(true); // Background refresh
    toast.success("Orders synchronized.");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setOrderStatusFilter("");
    setPaymentStatusFilter("");
    setPaymentMethodFilter("");
    setSortValue("newest");
    setCurrentPage(1);
    toast.info("All order filters cleared.");
  };

  // Debounced search query handler
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Filtering, Searching & Sorting Logic on Client Side
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search query matching (Order ID, Customer Name, Email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          String(o._id).toLowerCase().includes(query) ||
          o.user?.name?.toLowerCase().includes(query) ||
          o.user?.email?.toLowerCase().includes(query)
      );
    }

    // Order Status Filter
    if (orderStatusFilter) {
      result = result.filter((o) => o.orderStatus === orderStatusFilter);
    }

    // Payment Status Filter
    if (paymentStatusFilter) {
      result = result.filter((o) => o.paymentStatus === paymentStatusFilter);
    }

    // Payment Method Filter
    if (paymentMethodFilter) {
      result = result.filter((o) => o.paymentMethod === paymentMethodFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortValue === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortValue === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortValue === "amount-high") {
        return (b.totalAmount || b.totalPrice || 0) - (a.totalAmount || a.totalPrice || 0);
      }
      if (sortValue === "amount-low") {
        return (a.totalAmount || a.totalPrice || 0) - (b.totalAmount || b.totalPrice || 0);
      }
      return 0;
    });

    return result;
  }, [orders, searchQuery, orderStatusFilter, paymentStatusFilter, paymentMethodFilter, sortValue]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOrders = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Checkbox selection triggers
  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(paginatedOrders.map((o) => o._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Status updates API logic (reusing existing status controller endpoint)
  const handleUpdateStatus = async (orderId, bodyData) => {
    setUpdating(true);
    try {
      // Body payload fields matches backend orderStatus parameter key
      await api.put(`/orders/${orderId}/status`, bodyData);
      toast.success("Order status updated successfully.");

      // Background refetch to sync list details without showing page loader
      await fetchOrders(true);
    } catch (error) {
      handleApiError(error, "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleTriggerView = (order) => {
    setActiveOrder(order);
    setShowDrawer(true);
  };

  const renderEmptyState = () => {
    const isFiltered =
      searchQuery ||
      orderStatusFilter ||
      paymentStatusFilter ||
      paymentMethodFilter;

    if (isFiltered) {
      return (
        <EmptyState
          icon="🔍"
          title="No matching orders"
          desc="Try adjusting or resetting your search queries and filter terms."
          actionText="Reset Filters"
          onAction={handleClearFilters}
        />
      );
    }

    return (
      <EmptyState
        icon="📦"
        title="No Orders Yet"
        desc="Orders will appear here once customers place purchases."
        actionText="Refresh Sync"
        onAction={handleManualRefresh}
      />
    );
  };

  return (
    <div className="order-management-page">
      <PageHeader title="Order Console" subtitle="Track purchases, update logistics, and manage payments." />

      {/* Dynamic Orders Metric Deck */}
      {loading ? (
        <div style={{ marginBottom: "24px" }}>
          <LoadingSkeleton type="card" count={7} />
        </div>
      ) : (
        <OrderStats orders={orders} />
      )}

      {/* Filters & Sorting Toolbar */}
      <OrdersToolbar
        searchQuery={searchQuery}
        orderStatusFilter={orderStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        paymentMethodFilter={paymentMethodFilter}
        sortValue={sortValue}
        onSearchChange={handleSearchChange}
        onOrderStatusChange={setOrderStatusFilter}
        onPaymentStatusChange={setPaymentStatusFilter}
        onPaymentMethodChange={setPaymentMethodFilter}
        onSortChange={setSortValue}
        onClearFilters={handleClearFilters}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
      />

      {/* Orders Table Grid */}
      <OrdersTable
        orders={paginatedOrders}
        loading={loading}
        selectedIds={selectedIds}
        onSelectChange={handleSelectRow}
        onSelectAll={handleSelectAll}
        onView={handleTriggerView}
        onStatusChange={handleUpdateStatus}
        updating={updating}
        emptyState={renderEmptyState()}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        bulkActions={
          selectedIds.length > 0 && (
            <div className="table-bulk-actions-placeholder">
              <span className="bulk-selection-count-text">
                ⚡ <strong>{selectedIds.length}</strong> orders selected
              </span>
              <div className="bulk-buttons-deck">
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Edit Status - Future Enhancement Placeholder")}>
                  Bulk Status update
                </button>
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Print Invoices - Future Enhancement Placeholder")}>
                  Bulk Print Invoices
                </button>
              </div>
            </div>
          )
        }
      />

      {/* sliding details drawer */}
      <OrderDetailsDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        order={activeOrder}
        onUpdateStatus={handleUpdateStatus}
        updating={updating}
      />
    </div>
  );
};

export default ManageOrders;
