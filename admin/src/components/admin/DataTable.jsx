import React from "react";
import LoadingSkeleton from "./LoadingSkeleton";
import "./DataTable.css";

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyState,
  pagination,
  selectable,
  actions,
  renderRow,
}) => {
  const handleSelectAll = (e) => {
    if (selectable?.onSelectAll) {
      selectable.onSelectAll(e.target.checked);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (selectable?.onSelectChange) {
      selectable.onSelectChange(id, checked);
    }
  };

  const isAllSelected =
    data.length > 0 && selectable?.selectedIds?.length === data.length;

  return (
    <div className="generic-data-table-wrapper">
      {/* Floating Actions bar (e.g. for bulk selection) */}
      {actions && <div className="data-table-actions-bar">{actions}</div>}

      <div className="data-table-scroll-container">
        <table className="generic-data-table">
          <thead>
            <tr>
              {selectable && (
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={loading || data.length === 0}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={col.className || ""}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="table-loader-cell">
                  <LoadingSkeleton type="table" count={5} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  {emptyState || (
                    <div className="default-empty-table-view">No records found.</div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const isSelected = selectable?.selectedIds?.includes(row._id) || false;
                if (renderRow) {
                  return renderRow(row, isSelected, (checked) => handleSelectRow(row._id, checked));
                }
                return (
                  <tr key={row._id || idx} className={isSelected ? "row-selected" : ""}>
                    {selectable && (
                      <td className="checkbox-column">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row._id, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={col.className || ""}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="data-table-pagination-footer">
          <div className="pagination-info-text">
            Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
          </div>
          <div className="pagination-button-controls">
            <button
              className="pagination-btnprev"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              return (
                <button
                  key={pageNumber}
                  className={`pagination-btnpage ${
                    pagination.page === pageNumber ? "active" : ""
                  }`}
                  onClick={() => pagination.onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              className="pagination-btnnext"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
