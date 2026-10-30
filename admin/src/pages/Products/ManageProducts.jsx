import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllProducts, deleteProduct } from "../../services/productService";
import { toast } from "react-toastify";

// Reusable custom UI components
import PageHeader from "../../components/admin/PageHeader";
import ProductStats from "../../components/admin/ProductStats";
import ProductsToolbar from "../../components/admin/ProductsToolbar";
import ProductsTable from "../../components/admin/ProductsTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ProductImage from "../../components/admin/ProductImage";
import EmptyState from "../../components/admin/EmptyState";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";
import Modal from "../../components/admin/Modal";

import "./ManageProducts.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter, Search, Sort & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection state for Bulk Actions Placeholder
  const [selectedIds, setSelectedIds] = useState([]);

  // Deletion Dialog States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View Details Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [productToView, setProductToView] = useState(null);

  // Standard Centralized Error Handler
  const handleApiError = (error, fallbackMessage) => {
    console.error("API Error context:", error);
    if (!error.response) {
      toast.error("Unable to reach server. Please check your internet connection.");
      return;
    }

    const { status, data } = error.response;
    switch (status) {
      case 401:
        // Handled automatically by Auth Context redirecting to /login
        toast.error("Session expired. Please log in again.");
        break;
      case 403:
        toast.error("Access Denied: You do not have permissions to perform this action.");
        break;
      case 404:
        toast.error("Product not found: The requested item does not exist or has been deleted.");
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
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data.products || []);
    } catch (error) {
      handleApiError(error, "Failed to load product catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Compute categories dynamically
  const categoriesList = useMemo(() => {
    const list = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set(list));
  }, [products]);

  // Handle Filtering, Searching, & Sorting logic on Client Side
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query matching (title/description/category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    // Category Filter
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Stock Filter
    if (stockFilter) {
      if (stockFilter === "in-stock") {
        result = result.filter((p) => p.stock > 5);
      } else if (stockFilter === "low-stock") {
        result = result.filter((p) => p.stock > 0 && p.stock <= 5);
      } else if (stockFilter === "out-of-stock") {
        result = result.filter((p) => p.stock === 0);
      }
    }

    // Status Filter (active vs out-of-stock vs low-stock)
    if (statusFilter) {
      result = result.filter((p) => {
        if (statusFilter === "active") return p.stock > 5;
        if (statusFilter === "low-stock") return p.stock > 0 && p.stock <= 5;
        if (statusFilter === "out-of-stock") return p.stock === 0;
        return true;
      });
    }

    // Sorting Options
    result.sort((a, b) => {
      if (sortValue === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortValue === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortValue === "price-low") {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortValue === "price-high") {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortValue === "name-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortValue === "name-desc") {
        return (b.title || "").localeCompare(a.title || "");
      }
      return 0;
    });

    return result;
  }, [products, searchQuery, categoryFilter, stockFilter, statusFilter, sortValue]);

  // Client Side Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  
  // Reset page bounds if current page exceeds calculated pages (e.g. after filter change or row delete)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setStockFilter("");
    setStatusFilter("");
    setSortValue("newest");
    setCurrentPage(1);
    toast.info("All catalog filters cleared.");
  };

  // Row selection handles
  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const pageIds = paginatedProducts.map((p) => p._id);
      setSelectedIds(pageIds);
    } else {
      setSelectedIds([]);
    }
  };

  // View details triggers
  const handleTriggerView = (product) => {
    setProductToView(product);
    setShowViewModal(true);
  };

  // Delete handlers
  const handleTriggerDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      // Direct API delete call
      await deleteProduct(productToDelete._id);
      
      toast.success(`Product "${productToDelete.title}" deleted successfully.`);
      
      // Clear selection if deleted
      setSelectedIds((prev) => prev.filter((id) => id !== productToDelete._id));
      
      // Close modal first
      setShowDeleteDialog(false);
      setProductToDelete(null);

      // Refetch table data to sync, preserving pagination and active sorting/filtering state
      await fetchProducts();
    } catch (error) {
      handleApiError(error, "Failed to delete product from database.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Empty state actions
  const renderEmptyState = () => {
    const isFiltered =
      searchQuery || categoryFilter || stockFilter || statusFilter;

    if (isFiltered) {
      return (
        <EmptyState
          icon="🔍"
          title="No matching products"
          desc="Try adjusting or resetting your search parameters and filters."
          actionText="Reset Filters"
          onAction={handleClearFilters}
        />
      );
    }

    return (
      <EmptyState
        icon="🛍️"
        title="No products in catalog"
        desc="Start adding items to your Handloom store catalog."
        actionText="Add Product"
        onAction={() => window.location.assign("/products/add")}
      />
    );
  };

  return (
    <div className="product-management-page">
      <PageHeader title="Product Inventory" subtitle="Manage and categorize your handloom saree listings.">
        <Link to="/products/add" className="add-product-luxury-btn">
          ✨ Add New Product
        </Link>
      </PageHeader>

      {/* Catalog stats deck */}
      {loading ? (
        <div style={{ marginBottom: "24px" }}>
          <LoadingSkeleton type="card" count={5} />
        </div>
      ) : (
        <ProductStats products={products} />
      )}

      {/* Filters & Sorting Toolbar */}
      <ProductsToolbar
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        stockFilter={stockFilter}
        statusFilter={statusFilter}
        sortValue={sortValue}
        categories={categoriesList}
        onSearchChange={setSearchQuery}
        onCategoryChange={setCategoryFilter}
        onStockChange={setStockFilter}
        onStatusChange={setStatusFilter}
        onSortChange={setSortValue}
        onClearFilters={handleClearFilters}
      />

      {/* Products list table */}
      <ProductsTable
        products={paginatedProducts}
        loading={loading}
        selectedIds={selectedIds}
        onSelectChange={handleSelectRow}
        onSelectAll={handleSelectAll}
        onDelete={handleTriggerDelete}
        onView={handleTriggerView}
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
                ⚡ <strong>{selectedIds.length}</strong> items selected
              </span>
              <div className="bulk-buttons-deck">
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Edit - Future Enhancement Placeholder")}>
                  Bulk Status Update
                </button>
                <button className="bulk-bar-btn danger" onClick={() => alert("Bulk Delete - Future Enhancement Placeholder")}>
                  Bulk Delete
                </button>
              </div>
            </div>
          )
        }
      />

      {/* Premium Deletion Confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product Listing?"
        message="This will permanently delete the saree from the catalog database and clean up all related images from Cloudinary. This action cannot be undone."
        confirmText="Confirm Delete"
        isDanger={true}
        loading={isDeleting}
      >
        {productToDelete && (
          <div className="delete-product-modal-preview">
            <ProductImage src={productToDelete.images?.[0]?.url} alt={productToDelete.title} className="delete-preview-thumbnail" />
            <div className="delete-preview-metadata">
              <span className="delete-preview-name">{productToDelete.title}</span>
              <span className="delete-preview-category">{productToDelete.category}</span>
              <span className="delete-preview-price">₹{(productToDelete.price || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </ConfirmDialog>

      {/* Saree details modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Saree Details Preview">
        {productToView && (
          <div className="product-view-details-card">
            <ProductImage src={productToView.images?.[0]?.url} alt={productToView.title} className="view-modal-main-img" />
            <div className="view-modal-metadata-grid">
              <div className="view-meta-row">
                <strong>Name:</strong>
                <span>{productToView.title}</span>
              </div>
              <div className="view-meta-row">
                <strong>Category:</strong>
                <span>{productToView.category}</span>
              </div>
              <div className="view-meta-row">
                <strong>Price:</strong>
                <span className="gold-text-value">₹{(productToView.price || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="view-meta-row">
                <strong>Stock:</strong>
                <span className={productToView.stock <= 5 ? "warning-txt" : ""}>
                  {productToView.stock} units
                </span>
              </div>
              <div className="view-meta-row description-row">
                <strong>Description:</strong>
                <p>{productToView.description || "No description provided."}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageProducts;
