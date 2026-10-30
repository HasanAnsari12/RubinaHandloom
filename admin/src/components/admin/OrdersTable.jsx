import React from "react";
import DataTable from "./DataTable";
import OrderRow from "./OrderRow";

const OrdersTable = ({
  orders = [],
  loading = false,
  selectedIds = [],
  onSelectChange,
  onSelectAll,
  onView,
  onStatusChange,
  updating = false,
  emptyState,
  pagination,
  bulkActions,
}) => {
  const columns = [
    { key: "orderId", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "products", label: "Products Summary" },
    { key: "amount", label: "Amount" },
    { key: "paymentStatus", label: "Payment Status" },
    { key: "orderStatus", label: "Order Status" },
    { key: "createdAt", label: "Date" },
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
      data={orders}
      loading={loading}
      emptyState={emptyState}
      pagination={pagination}
      selectable={selectable}
      actions={bulkActions}
      renderRow={(order, isSelected, onSelectRow) => (
        <tr key={order._id} className={isSelected ? "row-selected" : ""}>
          <OrderRow
            order={order}
            isSelected={isSelected}
            onSelectChange={onSelectRow}
            onView={onView}
            onStatusChange={onStatusChange}
            updating={updating}
          />
        </tr>
      )}
    />
  );
};

export default OrdersTable;
