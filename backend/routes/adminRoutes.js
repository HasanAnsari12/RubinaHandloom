const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/adminController");

const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const router = express.Router();

/* =========================
   MULTER SETUP
========================= */

const upload = multer({
  dest: "uploads/",
});

/* =========================
   DASHBOARD ROUTE
========================= */

// GET /api/admin/stats
router.get("/stats", protect, admin, getDashboardStats);

/* =========================
   CSV UPLOAD ROUTE
========================= */

router.post(
  "/upload-csv",
  protect,
  admin,
  upload.single("file"),
  async (req, res) => {
    try {
      const products = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())

        .on("data", (row) => {
          products.push({
            title: row.title,

            price: Number(row.price),

            category: row.category,

            stock: Number(row.stock),

            images: row.images
              .split(",")
              .map((img) => img.trim()),

            description: row.description,
          });
        })

        .on("end", async () => {
          // Insert all products
          await Product.insertMany(products);

          // Delete uploaded csv file
          fs.unlinkSync(req.file.path);

          res.status(200).json({
            success: true,
            message:
              "CSV uploaded successfully!",

            totalProducts:
              products.length,
          });
        });

    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "CSV upload failed",
      });
    }
  }
);

module.exports = router;