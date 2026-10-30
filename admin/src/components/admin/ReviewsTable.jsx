import React from "react";
import DataTable from "./DataTable";
import ReviewRow from "./ReviewRow";

const ReviewsTable = ({
  reviews = [],
  loading = false,
  selectedIds = [],
  onSelectChange,
  onSelectAll,
  onView,
  onStatusChange,
  onDelete,
  emptyState,
  pagination,
  bulkActions,
}) => {
  const columns = [
    { key: "customer", label: "Customer" },
    { key: "product", label: "Product" },
    { key: "rating", label: "Rating" },
    { key: "comment", label: "Review Comment" },
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
      data={reviews}
      loading={loading}
      emptyState={emptyState}
      pagination={pagination}
      selectable={selectable}
      actions={bulkActions}
      renderRow={(review, isSelected, onSelectRow) => (
        <tr key={review._id} className={isSelected ? "row-selected" : ""}>
          <ReviewRow
            review={review}
            isSelected={isSelected}
            onSelectChange={onSelectRow}
            onView={onView}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        </tr>
      )}
    />
  );
};

export default ReviewsTable;
