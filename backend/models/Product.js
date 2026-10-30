const mongoose = require("mongoose");

const imageSubSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
    },
    public_id: {
      type: String,
      default: "legacy",
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be greater than or equal to 0"],
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, "Discount price must be greater than or equal to 0"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    brand: {
      type: String,
      default: "Rubina Handloom",
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    images: {
      type: [imageSubSchema],
      set: function (val) {
        if (!val) return val;
        if (typeof val === "string") {
          return [{ url: val, public_id: "legacy" }];
        }
        if (Array.isArray(val)) {
          return val.map((item) => {
            if (typeof item === "string") {
              return { url: item, public_id: "legacy" };
            }
            return item;
          });
        }
        return val;
      },
      default: () => [{ url: "/images/saree1.jpg", public_id: "default" }],
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to automatically normalize string arrays or missing images
productSchema.pre("validate", function (next) {
  if (this.images) {
    if (typeof this.images === "string") {
      this.images = [{ url: this.images, public_id: "legacy" }];
    } else if (Array.isArray(this.images)) {
      this.images = this.images
        .map((img) => {
          if (typeof img === "string") {
            return { url: img, public_id: "legacy" };
          }
          if (img && typeof img === "object") {
            return {
              url: img.url,
              public_id: img.public_id || "legacy",
            };
          }
          return null;
        })
        .filter((img) => img && img.url);
    }
  }

  if (!this.images || this.images.length === 0) {
    this.images = [{ url: "/images/saree1.jpg", public_id: "default" }];
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);