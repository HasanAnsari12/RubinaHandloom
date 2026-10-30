import React, { useState, useRef, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import CategoryImage from "./CategoryImage";
import "./CategoryRow.css";

const CategoryRow = ({
  category,
  isSelected,
  onSelectChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleActionMenuClick = (actionName) => {
    setIsMenuOpen(false);
    alert(`Reserved Action Placeholder: [${actionName}] triggered for category "${category.name}"`);
  };

  const productCount = category.productsCount || 0;
  const hasProducts = productCount > 0;

  return (
    <>
      <td className="checkbox-column">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectChange(category._id, e.target.checked)}
        />
      </td>
      <td>
        <CategoryImage src={category.image?.url} alt={category.name} />
      </td>
      <td>
        <span className="category-row-name-text" onClick={() => onView(category)}>
          {category.name}
        </span>
      </td>
      <td>
        <code className="category-row-slug-code">/{category.slug}</code>
      </td>
      <td className="category-row-count-cell">
        <strong>{productCount}</strong> products
      </td>
      <td>
        <StatusBadge status={category.status} />
      </td>
      <td className="category-row-date-cell">
        {category.createdAt
          ? new Date(category.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </td>
      <td className="category-row-actions-cell text-right">
        <div className="category-row-actions-flex">
          {/* View Drawer trigger */}
          <button className="row-action-btn view" onClick={() => onView(category)}>
            View
          </button>

          {/* Edit form trigger */}
          <button className="row-action-btn edit-btn" onClick={() => onEdit(category)}>
            Edit
          </button>

          {/* Delete category trigger with protection tooltip */}
          <div
            className={`action-tooltip-wrapper ${hasProducts ? "has-tooltip" : ""}`}
            data-tooltip="This category contains products. Move or delete those products before deleting this category."
          >
            <button
              className="row-action-btn delete"
              disabled={hasProducts}
              onClick={() => onDelete(category)}
            >
              Delete
            </button>
          </div>

          {/* Action Menu (Reserved options drop-down list) */}
          <div className="reserved-menu-container" ref={menuRef}>
            <button className="reserved-menu-trigger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ⋮
            </button>
            {isMenuOpen && (
              <div className="reserved-action-dropdown">
                <button onClick={() => handleActionMenuClick("Duplicate Category")}>
                  👥 Duplicate
                </button>
                <button onClick={() => handleActionMenuClick("Archive Category")}>
                  🗄️ Archive
                </button>
                <button onClick={() => handleActionMenuClick("Export Category")}>
                  📥 Export Category
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </>
  );
};

export default CategoryRow;
