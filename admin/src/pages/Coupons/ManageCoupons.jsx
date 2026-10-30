import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

// Reusable Admin Components
import PageHeader from "../../components/admin/PageHeader";
import CouponStats from "../../components/admin/CouponStats";
import CouponsToolbar from "../../components/admin/CouponsToolbar";
import CouponsTable from "../../components/admin/CouponsTable";
import CouponDetailsDrawer from "../../components/admin/CouponDetailsDrawer";
import CouponFormModal from "../../components/admin/CouponFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import EmptyState from "../../components/admin/EmptyState";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";
import CouponBadge from "../../components/admin/CouponBadge";

// Utilities & Constants
import { calculateCouponStatus, formatDiscount, calculateUsagePercentage } from "../../utils/couponUtils";

import "./ManageCoupons.css";

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filters, search, pagination, presets
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("");
  const [datePresetFilter, setDatePresetFilter] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected row checkboxes
  const [selectedIds, setSelectedIds] = useState([]);

  // Drawer overlay targets
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerCoupon, setDrawerCoupon] = useState(null);

  // Form Modal targets
  const [showFormModal, setShowFormModal] = useState(false);
  const [formCoupon, setFormCoupon] = useState(null);

  // Delete dialog targets
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  // Centralized API Error Response matrix
  const handleApiError = useCallback((error, fallbackMessage) => {
    console.error("API Error context:", error);
    if (!error.response) {
      toast.error("Unable to reach server. Please check your internet connection.");
      return;
    }

    const { status, data } = error.response;
    switch (status) {
      case 401:
        toast.error("Session expired. Redirecting to login...");
        window.location.href = "/login";
        break;
      case 403:
        toast.error("Access Denied: You do not have permissions to perform this action.");
        break;
      case 404:
        toast.error("Coupon not found: The requested record does not exist.");
        break;
      case 409:
        toast.error(data.message || "Conflict: Coupon code already exists.");
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

  const fetchCoupons = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const res = await api.get("/coupons");
      const loadedCoupons = res.data.coupons || [];
      setCoupons(loadedCoupons);

      // Sync active drawer coupon reference if open
      if (drawerCoupon) {
        const updatedRef = loadedCoupons.find((c) => c._id === drawerCoupon._id);
        if (updatedRef) {
          setDrawerCoupon(updatedRef);
        }
      }
    } catch (error) {
      handleApiError(error, "Failed to load coupons catalog.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // 2. Client-Side Live Status Refresher (Every 60 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCoupons((prevCoupons) => {
        let changed = false;
        const updated = prevCoupons.map((c) => {
          const predicted = calculateCouponStatus(c.validFrom, c.validUntil, c.status);
          if (c.status !== predicted) {
            changed = true;
            return { ...c, status: predicted };
          }
          return c;
        });

        // Only update state if something actually transitioned locally
        return changed ? updated : prevCoupons;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchCoupons(true);
    toast.success("Coupons catalog synchronized successfully.");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDiscountTypeFilter("");
    setDatePresetFilter("");
    setSortValue("newest");
    setCurrentPage(1);
    toast.info("All filter options reset.");
  };

  // Compute stats metrics dynamically (Props-driven stats)
  const computedStats = useMemo(() => {
    const total = coupons.length;
    const draft = coupons.filter((c) => c.status === "Draft").length;
    const scheduled = coupons.filter((c) => c.status === "Scheduled").length;
    const active = coupons.filter((c) => c.status === "Active").length;
    const disabled = coupons.filter((c) => c.status === "Disabled").length;
    const expired = coupons.filter((c) => c.status === "Expired").length;

    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

    // Average Discount calculations (separate average per type)
    const pctCoupons = coupons.filter((c) => c.discountType === "Percentage");
    const flatCoupons = coupons.filter((c) => c.discountType === "Flat");
    const avgPct = pctCoupons.length ? Math.round(pctCoupons.reduce((sum, c) => sum + c.discountValue, 0) / pctCoupons.length) : 0;
    const avgFlat = flatCoupons.length ? Math.round(flatCoupons.reduce((sum, c) => sum + c.discountValue, 0) / flatCoupons.length) : 0;
    const averageDiscountText = `${avgPct ? `${avgPct}%` : ""} ${avgPct && avgFlat ? " / " : ""} ${avgFlat ? `₹${avgFlat}` : ""}`.trim() || "—";

    // 1. Average Redemption Rate (excluding unlimited usageLimit = null)
    const finiteCoupons = coupons.filter((c) => c.usageLimit && c.usageLimit > 0);
    const avgRate = finiteCoupons.length
      ? Math.round((finiteCoupons.reduce((sum, c) => sum + (c.usedCount / c.usageLimit), 0) / finiteCoupons.length) * 100)
      : 0;
    const averageRedemptionRateText = finiteCoupons.length ? `${avgRate}%` : "—";

    // Highest Used Campaign card
    const highest = coupons.reduce((max, c) => (c.usedCount > (max?.usedCount || 0) ? c : max), null);
    const highestUsedCouponText = highest && highest.usedCount > 0 ? highest.code : "—";

    return {
      total,
      draft,
      scheduled,
      active,
      disabled,
      expired,
      totalRedemptions,
      averageDiscountText,
      averageRedemptionRateText,
      highestUsedCouponText,
    };
  }, [coupons]);

  // Filters, search matching, and sorting on clients
  const filteredCoupons = useMemo(() => {
    let result = [...coupons];

    // Search query match (Code and Title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.code?.toLowerCase().includes(query) ||
          c.title?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Discount Type filter
    if (discountTypeFilter) {
      result = result.filter((c) => c.discountType === discountTypeFilter);
    }

    // 3. Date Presets dropdown filter
    if (datePresetFilter) {
      const now = new Date();
      if (datePresetFilter === "active-today") {
        result = result.filter((c) => c.status === "Active");
      } else if (datePresetFilter === "expiring-week") {
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        result = result.filter((c) => c.status === "Active" && new Date(c.validUntil) <= nextWeek);
      } else if (datePresetFilter === "expiring-month") {
        const nextMonth = new Date();
        nextMonth.setDate(now.getDate() + 30);
        result = result.filter((c) => c.status === "Active" && new Date(c.validUntil) <= nextMonth);
      } else if (datePresetFilter === "expired") {
        result = result.filter((c) => c.status === "Expired");
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortValue === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortValue === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortValue === "discount-high") {
        return (b.discountValue || 0) - (a.discountValue || 0);
      }
      if (sortValue === "discount-low") {
        return (a.discountValue || 0) - (b.discountValue || 0);
      }
      if (sortValue === "used-high") {
        return (b.usedCount || 0) - (a.usedCount || 0);
      }
      if (sortValue === "used-low") {
        return (a.usedCount || 0) - (b.usedCount || 0);
      }
      return 0;
    });

    return result;
  }, [coupons, searchQuery, statusFilter, discountTypeFilter, datePresetFilter, sortValue]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCoupons = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredCoupons.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredCoupons, currentPage]);

  // Checkbox row selections
  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(paginatedCoupons.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Toggle manual Disable / Enable status
  const handleToggleStatus = async (couponId, targetStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/coupons/${couponId}/status`, { status: targetStatus });
      toast.success(`Coupon status updated to ${targetStatus}.`);
      await fetchCoupons(true);
    } catch (error) {
      handleApiError(error, "Failed to toggle coupon status.");
    } finally {
      setUpdating(false);
    }
  };

  // Create or Update Coupon save handlers
  const handleSaveCoupon = async (payload) => {
    setUpdating(true);
    try {
      if (formCoupon) {
        // Update mode
        await api.put(`/coupons/${formCoupon._id}`, payload);
        toast.success("Coupon campaign updated successfully.");
      } else {
        // Create mode
        await api.post("/coupons", payload);
        toast.success("New coupon created successfully.");
      }
      setShowFormModal(false);
      setFormCoupon(null);
      await fetchCoupons(true);
    } catch (error) {
      handleApiError(error, "Failed to save coupon.");
    } finally {
      setUpdating(false);
    }
  };

  const handleTriggerAdd = () => {
    setFormCoupon(null);
    setShowFormModal(true);
  };

  const handleTriggerEdit = (coupon) => {
    setFormCoupon(coupon);
    setShowFormModal(true);
  };

  // 10. Duplicate Coupon Wizard trigger (pre-populates Draft copy values)
  const handleTriggerDuplicate = (coupon) => {
    const todayStr = new Date().toISOString().slice(0, 16);
    
    // Add copy suffix and zero counts
    const duplicateDraft = {
      ...coupon,
      _id: undefined, // ensure it generates new ObjectID
      code: `${coupon.code}-COPY`,
      title: `${coupon.title} (Copy)`,
      usedCount: 0,
      status: "Draft",
      validFrom: todayStr,
    };

    setFormCoupon(duplicateDraft);
    setShowFormModal(true);
    toast.info("Duplicate wizard loaded in Draft status.");
  };

  // Deletion confirm triggers
  const handleTriggerDelete = (coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/coupons/${couponToDelete._id}`);
      toast.success("Coupon deleted successfully (soft-deleted).");

      setSelectedIds((prev) => prev.filter((id) => id !== couponToDelete._id));
      setShowDeleteDialog(false);
      setCouponToDelete(null);

      await fetchCoupons(true);
    } catch (error) {
      handleApiError(error, "Failed to delete coupon.");
    } finally {
      setDeleting(false);
    }
  };

  const handleTriggerView = (coupon) => {
    setDrawerCoupon(coupon);
    setShowDrawer(true);
  };

  const renderEmptyState = () => {
    const isFiltered = searchQuery || statusFilter || discountTypeFilter || datePresetFilter;
    if (isFiltered) {
      return (
        <EmptyState
          icon="🔍"
          title="No Coupons Found"
          desc="Try adjusting or clearing search terms and preset validity dates."
          actionText="Reset Filters"
          onAction={handleClearFilters}
        />
      );
    }

    return (
      <EmptyState
        icon="🎟️"
        title="No Coupons Found"
        desc="Create your first coupon to start offering discounts."
        actionText="+ Create Coupon"
        onAction={handleTriggerAdd}
      />
    );
  };

  return (
    <div className="coupon-management-page">
      <PageHeader title="Coupon Campaigns" subtitle="Configure e-commerce discount codes, scheduled validity periods, and claims rules." />

      {/* Statistics deck */}
      {loading ? (
        <div style={{ marginBottom: "24px" }}>
          <LoadingSkeleton type="card" count={5} />
        </div>
      ) : (
        <CouponStats
          total={computedStats.total}
          draft={computedStats.draft}
          scheduled={computedStats.scheduled}
          active={computedStats.active}
          disabled={computedStats.disabled}
          expired={computedStats.expired}
          totalRedemptions={computedStats.totalRedemptions}
          averageDiscountText={computedStats.averageDiscountText}
          averageRedemptionRateText={computedStats.averageRedemptionRateText}
          highestUsedCouponText={computedStats.highestUsedCouponText}
        />
      )}

      {/* Toolbar filters */}
      <CouponsToolbar
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        discountTypeFilter={discountTypeFilter}
        datePresetFilter={datePresetFilter}
        sortValue={sortValue}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onDiscountTypeChange={setDiscountTypeFilter}
        onDatePresetChange={setDatePresetFilter}
        onSortChange={setSortValue}
        onClearFilters={handleClearFilters}
        onRefresh={handleManualRefresh}
        onAddCoupon={handleTriggerAdd}
        refreshing={refreshing}
      />

      {/* Coupons Table */}
      <CouponsTable
        coupons={paginatedCoupons}
        loading={loading}
        selectedIds={selectedIds}
        onSelectChange={handleSelectRow}
        onSelectAll={handleSelectAll}
        onView={handleTriggerView}
        onEdit={handleTriggerEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleTriggerDelete}
        onDuplicate={handleTriggerDuplicate}
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
                ⚡ <strong>{selectedIds.length}</strong> coupons selected
              </span>
              <div className="bulk-buttons-deck">
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Disable - Future Release")} disabled>
                  Bulk Disable
                </button>
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Enable - Future Release")} disabled>
                  Bulk Enable
                </button>
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Export - Future Release")} disabled>
                  Bulk Export
                </button>
              </div>
            </div>
          )
        }
      />

      {/* Details drawer overlay */}
      <CouponDetailsDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        coupon={drawerCoupon}
      />

      {/* Creation/Edit Form modal */}
      <CouponFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveCoupon}
        coupon={formCoupon}
        loading={updating}
      />

      {/* Deletion Caution Warning Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Soft Delete Coupon?"
        message="Flag this coupon campaign as deleted."
        confirmText="Confirm Soft Delete"
        isDanger={true}
        loading={deleting}
      >
        {couponToDelete && (
          <div className="delete-coupon-modal-preview">
            <div className="delete-preview-metadata">
              {/* Recommended disable notice */}
              {couponToDelete.usedCount > 0 && (
                <div className="disable-instead-caution-banner">
                  <span className="recommended-disable-badge">ℹ️ Recommended</span>
                  <p>Consider <strong>Disabling</strong> the coupon instead to keep complete history logs intact.</p>
                </div>
              )}

              <div className="delete-preview-summary-card">
                <div className="summary-field">
                  <span>Coupon:</span>
                  <strong>{couponToDelete.code}</strong>
                </div>
                <div className="summary-field">
                  <span>Discount:</span>
                  <strong>{formatDiscount(couponToDelete.discountType, couponToDelete.discountValue)}</strong>
                </div>
                <div className="summary-field">
                  <span>Status:</span>
                  <CouponBadge status={couponToDelete.status} />
                </div>
                <div className="summary-field">
                  <span>Uses:</span>
                  <strong>
                    {couponToDelete.usedCount} / {couponToDelete.usageLimit || "Unlimited"} (
                    {calculateUsagePercentage(couponToDelete.usedCount, couponToDelete.usageLimit)}%)
                  </strong>
                </div>
                <div className="summary-field">
                  <span>Expires:</span>
                  <strong>{new Date(couponToDelete.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                </div>
                <div className="summary-field">
                  <span>Created:</span>
                  <strong>{new Date(couponToDelete.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                </div>
              </div>

              <span className="delete-warning-banner-text">
                ⚠️ Deleting this coupon prevents future redemption. Completed orders remain unaffected. This action cannot be undone.
              </span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default ManageCoupons;
