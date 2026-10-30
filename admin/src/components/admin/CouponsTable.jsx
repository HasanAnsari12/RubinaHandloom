import React from "react";
import DataTable from "./DataTable";
import CouponRow from "./CouponRow";

const CouponsTable = ({
  coupons = [],
  loading = false,
  selectedIds = [],
  onSelectChange,
  onSelectAll,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onDuplicate,
  emptyState,
  pagination,
  bulkActions,
}) => {
  const columns = [
    { key: "code", label: "Coupon Code" },
    { key: "title", label: "Title" },
    { key: "discount", label: "Discount" },
    { key: "minimumOrder", label: "Min Order" },
    { key: "usage", label: "Usage Progress" },
    { key: "status", label: "Status" },
    { key: "validity", label: "Validity Period" },
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
      data={coupons}
      loading={loading}
      emptyState={emptyState}
      pagination={pagination}
      selectable={selectable}
      actions={bulkActions}
      renderRow={(coupon, isSelected, onSelectRow) => (
        <tr key={coupon._id} className={isSelected ? "row-selected" : ""}>
          <CouponRow
            coupon={coupon}
            isSelected={isSelected}
            onSelectChange={onSelectRow}
            onView={onView}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        </tr>
      )}
    />
  );
};

export default CouponsTable;
