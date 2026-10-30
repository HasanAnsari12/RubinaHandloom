import React from "react";
import DataTable from "./DataTable";
import CategoryRow from "./CategoryRow";

const CategoriesTable = ({
  categories = [],
  loading = false,
  selectedIds = [],
  onSelectChange,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  emptyState,
  pagination,
  bulkActions,
}) => {
  const columns = [
    { key: "thumbnail", label: "Thumbnail" },
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "products", label: "Products Count" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created Date" },
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
      data={categories}
      loading={loading}
      emptyState={emptyState}
      pagination={pagination}
      selectable={selectable}
      actions={bulkActions}
      renderRow={(category, isSelected, onSelectRow) => (
        <tr key={category._id} className={isSelected ? "row-selected" : ""}>
          <CategoryRow
            category={category}
            isSelected={isSelected}
            onSelectChange={onSelectRow}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </tr>
      )}
    />
  );
};

export default CategoriesTable;
