import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import "./Inventory.css";

import { API_BASE_URL } from "../../utils/constants";

const STOCK_REASONS = [
  "Manual Correction",
  "Damage / Loss",
  "Return Received",
  "Supplier Restock",
  "Bulk Update",
  "Initial Stock",
  "System Adjustment",
  "Other",
];

const getStockStatus = (stock) => {
  if (stock === 0) return { label: "Out of Stock", color: "#DC2626", bg: "#FEE2E2" };
  if (stock <= 3) return { label: "Critical", color: "#92400E", bg: "#FEF3C7" };
  if (stock <= 10) return { label: "Low Stock", color: "#D97706", bg: "#FEF3C7" };
  return { label: "In Stock", color: "#065F46", bg: "#D1FAE5" };
};

const StockBadge = ({ stock }) => {
  const status = getStockStatus(stock);
  return (
    <span
      className="stock-status-badge"
      style={{ backgroundColor: status.bg, color: status.color }}
    >
      {status.label}
    </span>
  );
};

// ─── Adjust Stock Modal ───────────────────────────────────────────────────
const AdjustStockModal = ({ product, onClose, onSave }) => {
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("Manual Correction");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const newStock = Math.max(0, (product?.stock ?? 0) + Number(delta));

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(product._id, Number(delta), reason, note);
    setSaving(false);
  };

  return (
    <div className="adjust-modal-backdrop" onClick={onClose}>
      <div className="adjust-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="adjust-modal-header">
          <h3>Adjust Stock</h3>
          <button onClick={onClose} className="adjust-modal-close-btn" type="button">✕</button>
        </div>

        <div className="adjust-modal-product-row">
          <div
            className="adjust-modal-product-thumb"
            style={{ backgroundImage: `url(${product?.images?.[0] || ""})` }}
          ></div>
          <div>
            <div className="adjust-modal-product-title">{product?.title}</div>
            <div className="adjust-modal-product-stock">
              Current Stock: <strong>{product?.stock ?? 0}</strong>
            </div>
          </div>
        </div>

        <div className="adjust-modal-body">
          <div className="adjust-delta-row">
            <button className="delta-btn" onClick={() => setDelta((d) => d - 1)} type="button">−</button>
            <input
              type="number"
              className="delta-input"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
            />
            <button className="delta-btn" onClick={() => setDelta((d) => d + 1)} type="button">+</button>
          </div>

          <div className="adjust-preview-row">
            <span>{product?.stock ?? 0}</span>
            <span className="arrow-sep">→</span>
            <span className={`new-stock-val ${newStock < (product?.stock ?? 0) ? "decrease" : "increase"}`}>
              {newStock}
            </span>
          </div>

          <div className="adjust-field">
            <label>Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {STOCK_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="adjust-field">
            <label>Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Restocked from supplier invoice #123"
            />
          </div>
        </div>

        <div className="adjust-modal-footer">
          <button className="adjust-cancel-btn" onClick={onClose} type="button">Cancel</button>
          <button
            className="adjust-save-btn"
            onClick={handleSubmit}
            disabled={saving || delta === 0}
            type="button"
          >
            {saving ? "Saving…" : "Save Adjustment"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Inventory Page ─────────────────────────────────────────────────
const Inventory = () => {
  const { token } = useAuth();
  const [activeView, setActiveView] = useState("table"); // "table" | "low-stock" | "history"

  // Inventory table state
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortValue, setSortValue] = useState("stock-asc");
  const [loading, setLoading] = useState(false);

  // Low stock state
  const [lowStockData, setLowStockData] = useState({ stats: {}, products: [] });
  const [lowStockLoading, setLowStockLoading] = useState(false);
  const [threshold, setThreshold] = useState(10);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Adjust modal
  const [adjustProduct, setAdjustProduct] = useState(null);

  // Bulk edit state
  const [bulkEdits, setBulkEdits] = useState({}); // { productId: newStock }
  const [bulkSaving, setBulkSaving] = useState(false);

  const searchRef = useRef(null);

  // ─── Fetch Inventory Table ─────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        sort: sortValue,
      });
      const res = await fetch(`${API_BASE_URL}/admin/inventory?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProducts(data.products || []);
      // Init bulk edits map
      const initEdits = {};
      (data.products || []).forEach((p) => { initEdits[p._id] = p.stock; });
      setBulkEdits(initEdits);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, sortValue]);

  // ─── Fetch Low Stock ───────────────────────────────────────────
  const fetchLowStock = useCallback(async () => {
    setLowStockLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/inventory/low-stock?threshold=${threshold}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setLowStockData({ stats: data.stats || {}, products: data.products || [] });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLowStockLoading(false);
    }
  }, [token, threshold]);

  // ─── Fetch History ─────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/inventory/history?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setHistory(data.adjustments || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeView === "table") fetchInventory();
    else if (activeView === "low-stock") fetchLowStock();
    else if (activeView === "history") fetchHistory();
  }, [activeView, fetchInventory, fetchLowStock, fetchHistory]);

  // ─── Adjust Single Product Stock ───────────────────────────────
  const handleAdjustSave = async (productId, delta, reason, note) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/inventory/adjust`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, delta, reason, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setAdjustProduct(null);
      fetchInventory();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ─── Save Bulk Edits ───────────────────────────────────────────
  const handleBulkSave = async () => {
    const updates = Object.entries(bulkEdits)
      .map(([productId, newStock]) => ({ productId, newStock }))
      .filter((u) => {
        const original = products.find((p) => p._id === u.productId);
        return original && original.stock !== u.newStock;
      });

    if (updates.length === 0) {
      toast.info("No changes detected.");
      return;
    }

    setBulkSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/inventory/bulk-update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates, reason: "Bulk Update" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchInventory();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inventory-header">
        <div>
          <h1 className="inventory-title">
            <span>🏭</span> Inventory Management
          </h1>
          <p className="inventory-subtitle">Monitor stock levels, adjust quantities, and track adjustment history.</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="inventory-view-tabs">
        {[
          { key: "table",     label: "📋 Inventory Table" },
          { key: "low-stock", label: "⚠️ Low Stock Dashboard" },
          { key: "history",   label: "📜 Adjustment History" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`inventory-view-tab-btn ${activeView === tab.key ? "active" : ""}`}
            onClick={() => setActiveView(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── INVENTORY TABLE VIEW ─────────────────────────────────── */}
      {activeView === "table" && (
        <div className="inventory-table-view">
          <div className="inventory-toolbar">
            <input
              ref={searchRef}
              className="inventory-search-input"
              type="text"
              placeholder="🔍 Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="inventory-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="outofstock">Out of Stock</option>
              <option value="lowstock">Low Stock</option>
              <option value="instock">In Stock</option>
            </select>
            <select className="inventory-filter-select" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
              <option value="stock-asc">Stock: Low → High</option>
              <option value="stock-desc">Stock: High → Low</option>
              <option value="title-asc">Title A→Z</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <button className="inventory-bulk-save-btn" onClick={handleBulkSave} disabled={bulkSaving} type="button">
              {bulkSaving ? "Saving…" : "💾 Save Bulk Changes"}
            </button>
          </div>

          {loading ? (
            <div className="inventory-loading-state">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="inventory-skeleton-row"></div>)}
            </div>
          ) : products.length === 0 ? (
            <div className="inventory-empty">
              <span>📦</span>
              <p>No products found.</p>
            </div>
          ) : (
            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th>New Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className={product.stock === 0 ? "row-out-of-stock" : ""}>
                      <td>
                        <div className="inv-product-cell">
                          <div
                            className="inv-product-thumb"
                            style={{ backgroundImage: `url(${product.images?.[0] || ""})` }}
                          ></div>
                          <span className="inv-product-title">{product.title}</span>
                        </div>
                      </td>
                      <td className="inv-category-cell">{product.category?.name || "—"}</td>
                      <td>₹{(product.price || 0).toLocaleString("en-IN")}</td>
                      <td className="inv-stock-cell">
                        <strong>{product.stock ?? 0}</strong>
                      </td>
                      <td><StockBadge stock={product.stock} /></td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="inv-bulk-stock-input"
                          value={bulkEdits[product._id] ?? product.stock}
                          onChange={(e) =>
                            setBulkEdits((prev) => ({
                              ...prev,
                              [product._id]: Number(e.target.value),
                            }))
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="inv-adjust-btn"
                          onClick={() => setAdjustProduct(product)}
                          type="button"
                        >
                          ± Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── LOW STOCK DASHBOARD ───────────────────────────────────── */}
      {activeView === "low-stock" && (
        <div className="low-stock-view">
          <div className="low-stock-threshold-row">
            <label>Low Stock Threshold:</label>
            <input
              type="number"
              min="1"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="threshold-input"
            />
            <button className="threshold-apply-btn" onClick={fetchLowStock} type="button">Apply</button>
          </div>

          <div className="low-stock-stats-grid">
            {[
              { label: "Out of Stock", value: lowStockData.stats.outOfStock, color: "#DC2626", bg: "#FEE2E2", icon: "🚫" },
              { label: "Critical (≤3)", value: lowStockData.stats.criticalStock, color: "#92400E", bg: "#FEF3C7", icon: "🔴" },
              { label: "Low Stock", value: lowStockData.stats.lowStock, color: "#D97706", bg: "#FFFBEB", icon: "⚠️" },
              { label: "Total Affected", value: lowStockData.stats.total, color: "#1E40AF", bg: "#DBEAFE", icon: "📦" },
            ].map((stat) => (
              <div key={stat.label} className="low-stock-stat-card" style={{ borderLeftColor: stat.color }}>
                <div className="ls-stat-icon">{stat.icon}</div>
                <div className="ls-stat-body">
                  <div className="ls-stat-value" style={{ color: stat.color }}>{stat.value ?? 0}</div>
                  <div className="ls-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {lowStockLoading ? (
            <div className="inventory-loading-state">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="inventory-skeleton-row"></div>)}
            </div>
          ) : lowStockData.products.length === 0 ? (
            <div className="inventory-empty">
              <span>✅</span>
              <p>All products are well-stocked!</p>
            </div>
          ) : (
            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockData.products.map((p) => (
                    <tr key={p._id} className={p.stock === 0 ? "row-out-of-stock" : ""}>
                      <td>
                        <div className="inv-product-cell">
                          <div className="inv-product-thumb" style={{ backgroundImage: `url(${p.images?.[0] || ""})` }}></div>
                          <span className="inv-product-title">{p.title}</span>
                        </div>
                      </td>
                      <td>{p.category?.name || "—"}</td>
                      <td><strong style={{ color: p.stock === 0 ? "#DC2626" : "#D97706" }}>{p.stock}</strong></td>
                      <td><StockBadge stock={p.stock} /></td>
                      <td>
                        <button className="inv-adjust-btn urgent" onClick={() => setAdjustProduct(p)} type="button">
                          🔄 Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ADJUSTMENT HISTORY ────────────────────────────────────── */}
      {activeView === "history" && (
        <div className="history-view">
          <button className="history-refresh-btn" onClick={fetchHistory} type="button">🔄 Refresh</button>
          {historyLoading ? (
            <div className="inventory-loading-state">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="inventory-skeleton-row"></div>)}
            </div>
          ) : history.length === 0 ? (
            <div className="inventory-empty"><span>📜</span><p>No adjustments recorded yet.</p></div>
          ) : (
            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Delta</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Reason</th>
                    <th>Note</th>
                    <th>Adjusted By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((adj) => (
                    <tr key={adj._id}>
                      <td>
                        <div className="inv-product-cell">
                          <div className="inv-product-thumb" style={{ backgroundImage: `url(${adj.product?.images?.[0] || ""})` }}></div>
                          <span className="inv-product-title">{adj.product?.title || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`delta-badge ${adj.delta >= 0 ? "positive" : "negative"}`}>
                          {adj.delta >= 0 ? `+${adj.delta}` : adj.delta}
                        </span>
                      </td>
                      <td>{adj.previousStock}</td>
                      <td><strong>{adj.newStock}</strong></td>
                      <td>{adj.reason}</td>
                      <td className="inv-note-cell">{adj.note || "—"}</td>
                      <td>{adj.adjustedBy?.name || "System"}</td>
                      <td>{new Date(adj.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Modal */}
      {adjustProduct && (
        <AdjustStockModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSave={handleAdjustSave}
        />
      )}
    </div>
  );
};

export default Inventory;
