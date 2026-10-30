import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

// Reusable layouts
import PageHeader from "../../components/admin/PageHeader";
import CategoryStats from "../../components/admin/CategoryStats";
import CategoriesToolbar from "../../components/admin/CategoriesToolbar";
import CategoriesTable from "../../components/admin/CategoriesTable";
import CategoryDetailsDrawer from "../../components/admin/CategoryDetailsDrawer";
import CategoryFormModal from "../../components/admin/CategoryFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import EmptyState from "../../components/admin/EmptyState";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";
import CategoryImage from "../../components/admin/CategoryImage";

import "./ManageCategories.css";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filters, search, sorts & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected row checkbox IDs
  const [selectedIds, setSelectedIds] = useState([]);

  // Form modal triggers
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Drawer triggers
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState(null);

  // Delete dialog triggers
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

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
        toast.error("Category not found: The requested record does not exist.");
        break;
      case 409:
        toast.error(data.message || "Conflict: Category name or slug already exists.");
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

  const fetchCategories = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const res = await api.get("/categories");
      const loadedCats = res.data.categories || [];
      setCategories(loadedCats);

      // Sync active detail drawer reference if open
      if (drawerCategory) {
        const updatedRef = loadedCats.find((c) => c._id === drawerCategory._id);
        if (updatedRef) {
          setDrawerCategory(updatedRef);
        }
      }
    } catch (error) {
      handleApiError(error, "Failed to load categories.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toolbar Refresh Sync
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchCategories(true);
    toast.success("Categories list synchronized.");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setSortValue("newest");
    setCurrentPage(1);
    toast.info("All category filters cleared.");
  };

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Client side filtering & sorting mapping
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Search query matching (Name, Slug, Description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.slug?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortValue === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortValue === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortValue === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortValue === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (sortValue === "products-desc") {
        return (b.productsCount || 0) - (a.productsCount || 0);
      }
      if (sortValue === "products-asc") {
        return (a.productsCount || 0) - (b.productsCount || 0);
      }
      return 0;
    });

    return result;
  }, [categories, searchQuery, statusFilter, sortValue]);

  // Paging Slice
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCategories = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredCategories, currentPage]);

  // Selections Checkboxes
  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(paginatedCategories.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Add / Edit Modal trigger
  const handleTriggerAdd = () => {
    setActiveCategory(null);
    setShowFormModal(true);
  };

  const handleTriggerEdit = (category) => {
    setActiveCategory(category);
    setShowFormModal(true);
  };

  // Save changes handler (POST / PUT)
  const handleSaveCategory = async (formData) => {
    setSaving(true);
    try {
      if (activeCategory) {
        // Edit mode
        await api.put(`/categories/${activeCategory._id}`, formData);
        toast.success(`Category "${formData.name}" updated successfully.`);
      } else {
        // Create mode
        await api.post("/categories", formData);
        toast.success(`Category "${formData.name}" created successfully.`);
      }

      setShowFormModal(false);
      await fetchCategories(true);
    } catch (error) {
      handleApiError(error, "Failed to save category changes.");
    } finally {
      setSaving(false);
    }
  };

  // Delete category handlers (Soft deletion)
  const handleTriggerDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/categories/${categoryToDelete._id}`);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully.`);

      setSelectedIds((prev) => prev.filter((id) => id !== categoryToDelete._id));
      setShowDeleteDialog(false);
      setCategoryToDelete(null);

      await fetchCategories(true);
    } catch (error) {
      handleApiError(error, "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  const handleTriggerView = (category) => {
    setDrawerCategory(category);
    setShowDrawer(true);
  };

  const renderEmptyState = () => {
    const isFiltered = searchQuery || statusFilter;
    if (isFiltered) {
      return (
        <EmptyState
          icon="🔍"
          title="No Categories Found"
          desc="Try adjusting or clearing your search queries and filter selections."
          actionText="Reset Filters"
          onAction={handleClearFilters}
        />
      );
    }

    return (
      <EmptyState
        icon="📂"
        title="No Categories Found"
        desc="Create your first category."
        actionText="Add Category"
        onAction={handleTriggerAdd}
      />
    );
  };

  const productsCount = categoryToDelete?.productsCount || 0;
  const deleteProtected = productsCount > 0;

  return (
    <div className="category-management-page">
      <PageHeader
        title="Category Console"
        subtitle="Manage product categories, slug configurations, and catalog metrics."
        action={
          <button className="add-category-header-btn" onClick={handleTriggerAdd}>
            + Add Category
          </button>
        }
      />

      {/* Dynamic Statistics cards */}
      {loading ? (
        <div style={{ marginBottom: "24px" }}>
          <LoadingSkeleton type="card" count={5} />
        </div>
      ) : (
        <CategoryStats categories={categories} />
      )}

      {/* Toolbar filters */}
      <CategoriesToolbar
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortValue={sortValue}
        onSearchChange={handleSearchChange}
        onStatusChange={setStatusFilter}
        onSortChange={setSortValue}
        onClearFilters={handleClearFilters}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
      />

      {/* Categories Table datagrid */}
      <CategoriesTable
        categories={paginatedCategories}
        loading={loading}
        selectedIds={selectedIds}
        onSelectChange={handleSelectRow}
        onSelectAll={handleSelectAll}
        onView={handleTriggerView}
        onEdit={handleTriggerEdit}
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
                ⚡ <strong>{selectedIds.length}</strong> categories selected
              </span>
              <div className="bulk-buttons-deck">
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Edit - Future Enhancement")}>
                  Bulk Status update
                </button>
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Export - Future Enhancement")}>
                  Bulk Export
                </button>
              </div>
            </div>
          )
        }
      />

      {/* Create / Edit Form Modal */}
      <CategoryFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        category={activeCategory}
        onSave={handleSaveCategory}
        saving={saving}
      />

      {/* Details Slide Out Drawer */}
      <CategoryDetailsDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        category={drawerCategory}
      />

      {/* Deletion Warning Modal */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category?"
        message="This will flag the category profile as deleted. This action cannot be undone."
        confirmText="Delete Category"
        isDanger={true}
        loading={deleting}
        disabled={deleteProtected}
      >
        {categoryToDelete && (
          <div className="delete-category-modal-preview">
            <CategoryImage src={categoryToDelete.image?.url} alt={categoryToDelete.name} className="delete-preview-thumb-img" />
            <div className="delete-preview-metadata">
              <span className="delete-preview-name">{categoryToDelete.name}</span>
              <span className="delete-preview-slug">Slug: <code>{categoryToDelete.slug}</code></span>
              <span className="delete-preview-products">Products Count: <strong>{productsCount}</strong></span>
              
              {deleteProtected ? (
                <span className="delete-warning-banner-text protected">
                  ⚠️ This category contains products. Move products before deleting.
                </span>
              ) : (
                <span className="delete-warning-banner-text">
                  ⚠️ This action cannot be undone.
                </span>
              )}
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default ManageCategories;
