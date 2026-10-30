import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

// Reusable components
import PageHeader from "../../components/admin/PageHeader";
import UserStats from "../../components/admin/UserStats";
import UsersToolbar from "../../components/admin/UsersToolbar";
import UsersTable from "../../components/admin/UsersTable";
import UserDetailsDrawer from "../../components/admin/UserDetailsDrawer";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import EmptyState from "../../components/admin/EmptyState";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";

import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Search, Filter, Sort & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Row IDs for bulk placeholders
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail Drawer States
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  // Deletion Dialog States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Centralized API Error Response Handler
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
        toast.error(data.message || "Access Denied: You do not have permissions to perform this action.");
        break;
      case 404:
        toast.error("User not found: The requested record does not exist.");
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

  const fetchUsers = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const res = await api.get("/users");
      const loadedUsers = res.data.users || [];
      setUsers(loadedUsers);

      // If active drawer is open, synchronize the activeUser object reference
      if (activeUser) {
        const updatedRef = loadedUsers.find((u) => u._id === activeUser._id);
        if (updatedRef) {
          setActiveUser(updatedRef);
        }
      }
    } catch (error) {
      handleApiError(error, "Failed to load users list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(true);
    toast.success("Users synchronized.");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setStatusFilter("");
    setVerificationFilter("");
    setSortValue("newest");
    setCurrentPage(1);
    toast.info("All user list filters cleared.");
  };

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Client Side Filtering, Sorting, & Searching
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search query matching (Name, Email, Phone)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query)
      );
    }

    // Role Filter
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Status Filter (isBlocked)
    if (statusFilter) {
      if (statusFilter === "active") {
        result = result.filter((u) => !u.isBlocked);
      } else if (statusFilter === "blocked") {
        result = result.filter((u) => u.isBlocked);
      }
    }

    // Verification Filter (isVerified)
    if (verificationFilter) {
      if (verificationFilter === "verified") {
        result = result.filter((u) => u.isVerified);
      } else if (verificationFilter === "unverified") {
        result = result.filter((u) => !u.isVerified);
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
      if (sortValue === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortValue === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      return 0;
    });

    return result;
  }, [users, searchQuery, roleFilter, statusFilter, verificationFilter, sortValue]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Row Checkbox mapping
  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(paginatedUsers.map((u) => u._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Role upgrade handler
  const handleRoleChange = async (userId, newRole) => {
    setUpdating(true);
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated successfully to ${newRole}.`);
      await fetchUsers(true);
    } catch (error) {
      handleApiError(error, "Failed to update user role.");
    } finally {
      setUpdating(false);
    }
  };

  // Status block / unblock handler
  const handleStatusChange = async (userId, isBlockedVal) => {
    setUpdating(true);
    try {
      await api.patch(`/users/${userId}/status`, { isBlocked: isBlockedVal });
      toast.success(`User successfully ${isBlockedVal ? "blocked" : "unblocked"}.`);
      await fetchUsers(true);
    } catch (error) {
      handleApiError(error, "Failed to update user block status.");
    } finally {
      setUpdating(false);
    }
  };

  // Delete handlers (Soft deletion triggers ConfirmDialog warning modal)
  const handleTriggerDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      // Soft deletion API call
      await api.delete(`/users/${userToDelete._id}`);
      
      toast.success(`User "${userToDelete.name}" deleted successfully (soft-deleted).`);
      
      setSelectedIds((prev) => prev.filter((id) => id !== userToDelete._id));
      setShowDeleteDialog(false);
      setUserToDelete(null);

      // Background refetch preserves paging and toolbar scroll levels
      await fetchUsers(true);
    } catch (error) {
      handleApiError(error, "Failed to delete user profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTriggerView = (user) => {
    setActiveUser(user);
    setShowDrawer(true);
  };

  const renderEmptyState = () => {
    const isFiltered =
      searchQuery || roleFilter || statusFilter || verificationFilter;

    if (isFiltered) {
      return (
        <EmptyState
          icon="👤"
          title="No Users Found"
          desc="Try adjusting or clearing your search queries and filter parameters."
          actionText="Reset Filters"
          onAction={handleClearFilters}
        />
      );
    }

    return (
      <EmptyState
        icon="👤"
        title="No Users Found"
        desc="Try adjusting your filters."
        actionText="Refresh Sync"
        onAction={handleManualRefresh}
      />
    );
  };

  // Render first letter avatar fallback inside delete confirm modal
  const renderDeleteModalAvatar = (targetUser) => {
    if (targetUser?.profileImage) {
      return <img src={targetUser.profileImage} alt={targetUser.name} className="delete-preview-avatar-img" />;
    }
    const letter = targetUser?.name?.[0]?.toUpperCase() || "U";
    return <div className="delete-preview-avatar-fallback">{letter}</div>;
  };

  return (
    <div className="user-management-page">
      <PageHeader title="User Console" subtitle="Audit profile accounts, demote/promote roles, and toggle blocks." />

      {/* Dynamic Users Statistics deck */}
      {loading ? (
        <div style={{ marginBottom: "24px" }}>
          <LoadingSkeleton type="card" count={7} />
        </div>
      ) : (
        <UserStats users={users} />
      )}

      {/* Toolbar filters */}
      <UsersToolbar
        searchQuery={searchQuery}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        verificationFilter={verificationFilter}
        sortValue={sortValue}
        onSearchChange={handleSearchChange}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
        onVerificationChange={setVerificationFilter}
        onSortChange={setSortValue}
        onClearFilters={handleClearFilters}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
      />

      {/* Users table */}
      <UsersTable
        users={paginatedUsers}
        loading={loading}
        selectedIds={selectedIds}
        onSelectChange={handleSelectRow}
        onSelectAll={handleSelectAll}
        onView={handleTriggerView}
        onRoleChange={handleRoleChange}
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
                ⚡ <strong>{selectedIds.length}</strong> profiles selected
              </span>
              <div className="bulk-buttons-deck">
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Edit Role - Future Enhancement Placeholder")}>
                  Bulk Demote/Promote
                </button>
                <button className="bulk-bar-btn" onClick={() => alert("Bulk Block - Future Enhancement Placeholder")}>
                  Bulk Block Status
                </button>
              </div>
            </div>
          )
        }
      />

      {/* Slide out user detail drawer */}
      <UserDetailsDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        user={activeUser}
      />

      {/* Soft deletion confirm warning modal preview */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account?"
        message="This will flag the user profile as deleted. They will immediately lose access to the console and store, but order records remain saved to resolve referential checks."
        confirmText="Delete User"
        isDanger={true}
        loading={isDeleting}
      >
        {userToDelete && (
          <div className="delete-user-modal-preview">
            {renderDeleteModalAvatar(userToDelete)}
            <div className="delete-preview-metadata">
              <span className="delete-preview-name">{userToDelete.name}</span>
              <span className="delete-preview-email">{userToDelete.email}</span>
              <span className="delete-preview-role-text">Role: {userToDelete.role === "admin" ? "Admin" : "Customer"}</span>
              <span className="delete-preview-joined-text">
                Joined: {new Date(userToDelete.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="delete-warning-banner-text">⚠️ This action cannot be undone.</span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default ManageUsers;
