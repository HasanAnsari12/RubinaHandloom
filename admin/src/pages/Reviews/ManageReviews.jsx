import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

// Reusable components
import PageHeader from "../../components/admin/PageHeader";
import ReviewStats from "../../components/admin/ReviewStats";
import ReviewsToolbar from "../../components/admin/ReviewsToolbar";
import ReviewsTable from "../../components/admin/ReviewsTable";
import ReviewDetailsDrawer from "../../components/admin/ReviewDetailsDrawer";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import EmptyState from "../../components/admin/EmptyState";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";
import RatingStars from "../../components/admin/RatingStars";

// Analytics utilities & constants
import { calculateReviewStats } from "../../utils/reviewAnalytics";
import { REVIEW_TRANSITIONS } from "../../constants/ReviewStatusConstants";

import "./ManageReviews.css";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filters, search, pagination, and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Row selection checkboxes
  const [selectedIds, setSelectedIds] = useState([]);

  // Drawer overlay targets
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerReview, setDrawerReview] = useState(null);

  // Delete dialog targets
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Centralized Error response handler
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
        toast.error("Review not found: The requested record does not exist.");
        break;
      case 409:
        toast.error(data.message || "Conflict: Review status has already been set.");
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

  const fetchReviews = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const res = await api.get("/reviews");
      const loadedReviews = res.data.reviews || [];
      setReviews(loadedReviews);

      // Sync active drawer review reference if open
      if (drawerReview) {
        const updatedRef = loadedReviews.find((r) => r._id === drawerReview._id);
        if (updatedRef) {
          setDrawerReview(updatedRef);
        }
      }
    } catch (error) {
      handleApiError(error, "Failed to load reviews catalog.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchReviews(true);
    toast.success("Reviews moderated sync completed.");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setRatingFilter("");
    setSortValue("newest");
    setCurrentPage(1);
    toast.info("All reviews toolbar filters reset.");
  };

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Compute props-driven analytics dynamically
  const computedStats = useMemo(() => {
    return calculateReviewStats(reviews);
  }, [reviews]);

  // Client side filtering, searching, and sorting
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Search query matching (Customer Name, Email, Product Title, Review Comment)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(query) ||
          r.user?.email?.toLowerCase().includes(query) ||
          r.product?.title?.toLowerCase().includes(query) ||
          r.comment?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Rating filter (Stars & Above bounds checks)
    if (ratingFilter) {
      const boundary = Number(ratingFilter);
      result = result.filter((r) => (r.rating || 0) >= boundary);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortValue === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortValue === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortValue === "rating-high") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortValue === "rating-low") {
        return (a.rating || 0) - (b.rating || 0);
      }
      return 0;
    });

    return result;
  }, [reviews, searchQuery, statusFilter, ratingFilter, sortValue]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedReviews = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredReviews, currentPage]);

  // Row selection checkbox triggers
  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(paginatedReviews.map((r) => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Status moderation handler (Approve, Reject, Hide)
  const handleStatusChange = async (reviewId, newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/reviews/${reviewId}/status`, { status: newStatus });
      toast.success(`Review status set to "${newStatus}".`);
      await fetchReviews(true);
    } catch (error) {
      handleApiError(error, "Failed to moderate review status.");
    } finally {
      setUpdating(false);
    }
  };

  // Soft Deletion triggers
  const handleTriggerDelete = (review) => {
    setReviewToDelete(review);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/reviews/${reviewToDelete._id}`);
      toast.success("Review deleted successfully.");

      setSelectedIds((prev) => prev.filter((id) => id !== reviewToDelete._id));
      setShowDeleteDialog(false);
      setReviewToDelete(null);

      await fetchReviews(true);
    } catch (error) {
      handleApiError(error, "Failed to delete review.");
    } finally {
      setDeleting(false);
    }
  };

  const handleTriggerView = (review) => {
    setDrawerReview(review);
    setShowDrawer(true);
  };

  const renderEmptyState = () => {
    const isFiltered = searchQuery || statusFilter || ratingFilter;
    if (isFiltered) {
      return (
        <EmptyState
          icon="🔍"
          title="No Reviews Found"
          desc="Try adjusting or clearing your search queries and filter parameters."
          actionText="Reset Filters"
          onAction={handleClearFilters}
        />
      );
    }

    return (
      <EmptyState
        icon="⭐"
        title="No Reviews Found"
        desc="Customer reviews will appear here after products receive ratings."
        actionText="Refresh Sync"
        onAction={handleManualRefresh}
      />
    );
  };

  // Render first letter avatar fallback inside delete confirm modal
  const renderDeleteModalAvatar = (targetReview) => {
    if (targetReview.user?.profileImage) {
      return <img src={targetReview.user.profileImage} alt={targetReview.user.name} className="delete-preview-avatar-img" />;
    }
    const letter = targetReview.user?.name?.[0]?.toUpperCase() || "C";
    return <div className="delete-preview-avatar-fallback">{letter}</div>;
  };

  return (
    <div className="review-moderation-page">
      <PageHeader title="Review Moderation" subtitle="Audit customer feedback, approve saree ratings, and hide abuse comments." />

      {/* Dynamic Statistics cards & averages */}
      {loading ? (
        <div style={{ marginBottom: "24px" }}>
          <LoadingSkeleton type="card" count={5} />
        </div>
      ) : (
        <ReviewStats
          total={computedStats.total}
          pending={computedStats.pending}
          approved={computedStats.approved}
          rejected={computedStats.rejected}
          hidden={computedStats.hidden}
          averageRating={computedStats.averageRating}
          starDistribution={computedStats.starDistribution}
        />
      )}

      {/* Filters Toolbar */}
      <ReviewsToolbar
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        ratingFilter={ratingFilter}
        sortValue={sortValue}
        onSearchChange={handleSearchChange}
        onStatusChange={setStatusFilter}
        onRatingChange={setRatingFilter}
        onSortChange={setSortValue}
        onClearFilters={handleClearFilters}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
      />

      {/* Reviews Table */}
      <ReviewsTable
        reviews={paginatedReviews}
        loading={loading}
        selectedIds={selectedIds}
        onSelectChange={handleSelectRow}
        onSelectAll={handleSelectAll}
        onView={handleTriggerView}
        onStatusChange={handleStatusChange}
        onDelete={handleTriggerDelete}
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
                ⚡ <strong>{selectedIds.length}</strong> reviews selected
              </span>
              <div className="bulk-buttons-deck">
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Approve - Future Enhancement")}>
                  Bulk Approve
                </button>
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Reject - Future Enhancement")}>
                  Bulk Reject
                </button>
              </div>
            </div>
          )
        }
      />

      {/* Sliding details drawer */}
      <ReviewDetailsDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        review={drawerReview}
      />

      {/* Deletion Warning dialog with custom prompt values */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Review?"
        message="Flag this review comment as deleted."
        confirmText="Delete Review"
        isDanger={true}
        loading={deleting}
      >
        {reviewToDelete && (
          <div className="delete-review-modal-preview">
            {renderDeleteModalAvatar(reviewToDelete)}
            <div className="delete-preview-metadata">
              <span className="delete-preview-name">{reviewToDelete.user?.name}</span>
              <span className="delete-preview-product">Product: {reviewToDelete.product?.title}</span>
              <RatingStars rating={reviewToDelete.rating} size="small" />
              <p className="delete-preview-comment-text">"{reviewToDelete.comment}"</p>
              <span className="delete-warning-banner-text">
                ⚠️ This review will be permanently hidden from all admin listings. Customer product ratings will be recalculated immediately. This action cannot be undone.
              </span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default ManageReviews;
