import React from "react";
import DataTable from "./DataTable";
import UserRow from "./UserRow";

const UsersTable = ({
  users = [],
  loading = false,
  selectedIds = [],
  onSelectChange,
  onSelectAll,
  onView,
  onRoleChange,
  onStatusChange,
  onDelete,
  emptyState,
  pagination,
  bulkActions,
}) => {
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "verification", label: "Verification" },
    { key: "createdAt", label: "Joined Date" },
    { key: "actions", label: "Actions", className: "text-right" },
  ];

  const selectable = {
    selectedIds,
    onSelectChange,
    onSelectAll,
  };

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      emptyState={emptyState}
      pagination={pagination}
      selectable={selectable}
      actions={bulkActions}
      renderRow={(user, isSelected, onSelectRow) => (
        <tr key={user._id} className={isSelected ? "row-selected" : ""}>
          <UserRow
            user={user}
            isSelected={isSelected}
            onSelectChange={onSelectRow}
            onView={onView}
            onRoleChange={onRoleChange}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        </tr>
      )}
    />
  );
};

export default UsersTable;
