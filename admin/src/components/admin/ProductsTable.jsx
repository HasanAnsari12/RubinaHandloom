import React from "react";
import DataTable from "./DataTable";
import ProductRow from "./ProductRow";

const ProductsTable = ({
  products = [],
  loading = false,
  selectedIds = [],
  onSelectChange,
  onSelectAll,
  onDelete,
  onView,
  emptyState,
  pagination,
  bulkActions,
}) => {
  const columns = [
    { key: "product", label: "Product" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price" },
    { key: "stock", label: "Stock" },
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
      data={products}
      loading={loading}
      emptyState={emptyState}
      pagination={pagination}
      selectable={selectable}
      actions={bulkActions}
      renderRow={(product, isSelected, onSelectRow) => (
        <tr key={product._id} className={isSelected ? "row-selected" : ""}>
          <ProductRow
            product={product}
            isSelected={isSelected}
            onSelectChange={onSelectRow}
            onDelete={onDelete}
            onView={onView}
          />
        </tr>
      )}
    />
  );
};

export default ProductsTable;
