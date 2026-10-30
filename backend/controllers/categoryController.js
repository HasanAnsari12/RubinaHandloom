const Category = require("../models/Category");
const Product = require("../models/Product");
const { deleteImage } = require("../services/cloudinaryService");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: { $ne: true } })
      .sort({ name: 1 })
      .lean();

    // Dynamically calculate product count for each category from database
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productsCount = await Product.countDocuments({ category: cat.name });
        return { ...cat, productsCount };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCounts.length,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, slug, image, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();
    const slugValue = (slug || trimmedName)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // 1. Independent Name Uniqueness Check (Case Insensitive)
    const nameExists = await Category.findOne({
      name: { $regex: new RegExp("^" + trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i") },
      isDeleted: { $ne: true },
    });

    if (nameExists) {
      return res.status(409).json({
        success: false,
        message: "Category name already exists",
      });
    }

    // 2. Independent Slug Uniqueness Check (Case Insensitive)
    const slugExists = await Category.findOne({
      slug: slugValue,
      isDeleted: { $ne: true },
    });

    if (slugExists) {
      return res.status(409).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    const category = await Category.create({
      name: trimmedName,
      description: description || "",
      slug: slugValue,
      image: image || { url: "", public_id: "" },
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a category (Soft Delete)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 1. Product count protection: count associated products
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: "This category contains products. Move or delete those products before deleting this category.",
      });
    }

    // 2. Soft delete operations (preserve Cloudinary images for future restorations)
    category.isDeleted = true;
    category.deletedAt = new Date();
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productsCount = await Product.countDocuments({ category: category.name });

    res.status(200).json({
      success: true,
      category: {
        ...category.toObject(),
        productsCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, description, image, status } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 1. Independent Name Uniqueness Check
    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const trimmedName = name.trim();
      const nameExists = await Category.findOne({
        name: { $regex: new RegExp("^" + trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i") },
        _id: { $ne: req.params.id },
        isDeleted: { $ne: true },
      });

      if (nameExists) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
        });
      }
      category.name = trimmedName;
    }

    // Slug is IMMUTABLE after creation for SEO stability, so we ignore changes to it

    if (description !== undefined) {
      category.description = description;
    }

    if (status) {
      category.status = status;
    }

    // 2. Cloudinary image replacement check
    if (image && image.url) {
      const oldPublicId = category.image?.public_id;
      const newPublicId = image.public_id;

      if (oldPublicId && oldPublicId !== newPublicId) {
        // Destroy old image since it was replaced by new upload
        deleteImage(oldPublicId).catch((err) => {
          console.error("Cloudinary failed to delete replaced image asset:", err.message);
        });
      }

      category.image = {
        url: image.url,
        public_id: newPublicId || "",
      };
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory,
};
