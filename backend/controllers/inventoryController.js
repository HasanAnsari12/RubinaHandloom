const Product = require("../models/Product");
const StockAdjustment = require("../models/StockAdjustment");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get low stock products (below threshold)
// @route   GET /api/admin/inventory/low-stock?threshold=10
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold || "10");

    const products = await Product.find({ stock: { $lte: threshold } })
      .select("title stock price images category status")
      .populate("category", "name")
      .sort({ stock: 1 });

    const stats = {
      outOfStock: products.filter((p) => p.stock === 0).length,
      criticalStock: products.filter((p) => p.stock > 0 && p.stock <= 3).length,
      lowStock: products.filter((p) => p.stock > 3 && p.stock <= threshold).length,
      total: products.length,
    };

    res.status(200).json({
      success: true,
      stats,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all products with their stock info (Inventory table)
// @route   GET /api/admin/inventory?search=&category=&status=
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllInventory = async (req, res) => {
  try {
    const { search = "", category = "", status = "", sort = "stock-asc" } = req.query;

    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (status === "outofstock") query.stock = 0;
    else if (status === "lowstock") query.stock = { $gt: 0, $lte: 10 };
    else if (status === "instock") query.stock = { $gt: 10 };

    let sortObj = {};
    if (sort === "stock-asc") sortObj = { stock: 1 };
    else if (sort === "stock-desc") sortObj = { stock: -1 };
    else if (sort === "title-asc") sortObj = { title: 1 };
    else if (sort === "price-desc") sortObj = { price: -1 };

    const products = await Product.find(query)
      .select("title stock price images category status")
      .populate("category", "name")
      .sort(sortObj);

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Adjust stock for a single product
// @route   POST /api/admin/inventory/adjust
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const adjustStock = async (req, res) => {
  try {
    const { productId, delta, reason, note } = req.body;

    if (!productId || delta === undefined || delta === null) {
      return res.status(400).json({
        success: false,
        message: "productId and delta are required.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + Number(delta));

    // Update product stock
    product.stock = newStock;
    await product.save();

    // Log the adjustment
    const adjustment = await StockAdjustment.create({
      product: productId,
      adjustedBy: req.user?._id || null,
      reason: reason || "Manual Correction",
      note: note || "",
      previousStock,
      delta: Number(delta),
      newStock,
    });

    await adjustment.populate("product", "title images");
    await adjustment.populate("adjustedBy", "name email");

    res.status(200).json({
      success: true,
      message: `Stock updated: ${previousStock} → ${newStock}`,
      adjustment,
      product: { _id: product._id, title: product.title, stock: newStock },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Bulk update stock for multiple products
// @route   PUT /api/admin/inventory/bulk-update
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const bulkUpdateStock = async (req, res) => {
  try {
    const { updates, reason, note } = req.body;
    // updates = [{ productId, newStock }]

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "updates array is required and must not be empty.",
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const product = await Product.findById(update.productId);
        if (!product) {
          errors.push({ productId: update.productId, error: "Product not found" });
          continue;
        }

        const previousStock = product.stock;
        const newStock = Math.max(0, Number(update.newStock));
        const delta = newStock - previousStock;

        product.stock = newStock;
        await product.save();

        if (delta !== 0) {
          await StockAdjustment.create({
            product: update.productId,
            adjustedBy: req.user?._id || null,
            reason: reason || "Bulk Update",
            note: note || "",
            previousStock,
            delta,
            newStock,
          });
        }

        results.push({ productId: update.productId, previousStock, newStock, delta });
      } catch (err) {
        errors.push({ productId: update.productId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk update complete: ${results.length} updated, ${errors.length} failed.`,
      results,
      errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get stock adjustment history (with optional product filter)
// @route   GET /api/admin/inventory/history?productId=&limit=50&page=1
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getStockHistory = async (req, res) => {
  try {
    const { productId, page = 1, limit = 50 } = req.query;

    const query = productId ? { product: productId } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [adjustments, total] = await Promise.all([
      StockAdjustment.find(query)
        .populate("product", "title images")
        .populate("adjustedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockAdjustment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      adjustments,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLowStockProducts,
  getAllInventory,
  adjustStock,
  bulkUpdateStock,
  getStockHistory,
};
