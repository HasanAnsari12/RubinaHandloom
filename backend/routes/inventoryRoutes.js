const express = require("express");
const router = express.Router();
const {
  getLowStockProducts,
  getAllInventory,
  adjustStock,
  bulkUpdateStock,
  getStockHistory,
} = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

router.use(protect, admin);

// GET  /api/admin/inventory               → Full inventory table
router.get("/", getAllInventory);

// GET  /api/admin/inventory/low-stock     → Low / out of stock products
router.get("/low-stock", getLowStockProducts);

// GET  /api/admin/inventory/history       → Stock adjustment history
router.get("/history", getStockHistory);

// POST /api/admin/inventory/adjust        → Single product stock adjust
router.post("/adjust", adjustStock);

// PUT  /api/admin/inventory/bulk-update   → Bulk stock update
router.put("/bulk-update", bulkUpdateStock);

module.exports = router;
