const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { uploadBuffer, deleteImage } = require("../services/cloudinaryService");

const router = express.Router();

// 1. Configure Multer Memory Storage
const storage = multer.memoryStorage();

// Magic Number Validation for real image verification
const isValidImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 8) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
  ) return true;

  // WEBP: RIFF (52 49 46 46) at 0, WEBP (57 45 42 50) at 8
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return true;

  // GIF: GIF8 (47 49 46 38)
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;

  return false;
};

// 2. Configure File Type Filter (JPEG, JPG, PNG, WEBP only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Only JPEG, JPG, PNG, and WEBP images are allowed."), false);
  }
};

// 3. Initialize Multer Middleware with Size & File Constraints
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes limit
  },
});

// @desc    Upload multiple product images to Cloudinary (up to 5)
// @route   POST /api/upload
// @access  Private/Admin
router.post(
  "/",
  protect,
  admin,
  (req, res, next) => {
    // Custom wrapper to catch Multer validation errors (e.g. file size, file filter rejection)
    upload.array("images", 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `File upload limit exceeded: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one image file to upload.",
        });
      }

      // Check if uploaded count is greater than 5
      if (req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: "You can upload a maximum of 5 images at a time.",
        });
      }

      // Verify each file buffer against real image magic numbers
      for (const file of req.files) {
        if (!isValidImageBuffer(file.buffer)) {
          return res.status(400).json({
            success: false,
            message: `Security validation failed: File "${file.originalname}" is not a valid image file.`,
          });
        }
      }

      // Upload all image buffers in parallel
      const uploadPromises = req.files.map((file) => uploadBuffer(file.buffer));
      const uploadResults = await Promise.all(uploadPromises);

      // Map response to retrieve secure URL and public ID
      const images = uploadResults.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
      }));

      res.status(200).json({
        success: true,
        message: "Images uploaded successfully.",
        images,
      });
    } catch (error) {
      console.error("Cloudinary upload failure:", error.message);
      res.status(500).json({
        success: false,
        message: `Cloudinary upload failed: ${error.message}`,
      });
    }
  }
);

// @desc    Delete product image from Cloudinary
// @route   POST /api/upload/delete
// @access  Private/Admin
router.post("/delete", protect, admin, async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide the public_id of the image to delete.",
      });
    }

    const deletionResult = await deleteImage(public_id);

    if (deletionResult.result === "not found") {
      return res.status(404).json({
        success: false,
        message: "Image not found on Cloudinary.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully from Cloudinary.",
    });
  } catch (error) {
    console.error("Cloudinary delete failure:", error.message);
    res.status(500).json({
      success: false,
      message: `Cloudinary image deletion failed: ${error.message}`,
    });
  }
});

module.exports = router;
