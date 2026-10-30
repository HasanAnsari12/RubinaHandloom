import React, { useState, useEffect } from "react";
import { uploadImages } from "../../services/uploadService";
import { toast } from "react-toastify";
import "./CategoryFormModal.css";

const CategoryFormModal = ({
  isOpen,
  onClose,
  category,
  onSave,
  saving = false,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [image, setImage] = useState({ url: "", public_id: "" });
  
  // Image Upload UX states
  const [uploading, setUploading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const isEditMode = !!category;

  // Sync inputs on open or mode toggle
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || "");
        setSlug(category.slug || "");
        setDescription(category.description || "");
        setStatus(category.status || "Active");
        setImage(category.image || { url: "", public_id: "" });
        setSlugManuallyEdited(true); // Locked on edit
      } else {
        setName("");
        setSlug("");
        setDescription("");
        setStatus("Active");
        setImage({ url: "", public_id: "" });
        setSlugManuallyEdited(false);
      }
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  // Slug generator: trim special chars and replace spaces with dashes
  const generateSlug = (val) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[&%@#+\s]+/g, "-") // replace special symbols and spaces
      .replace(/[^a-z0-9-]+/g, "") // strip remaining invalid characters
      .replace(/(^-|-$)+/g, ""); // clean edge dashes
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);

    // Auto slug sync (only in create mode and if not manually edited)
    if (!isEditMode && !slugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/\s+/g, "-");
    setSlug(val);
    setSlugManuallyEdited(true);
  };

  // Image Upload Handlers with validations (PNG, JPG, WEBP, <2MB)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. File Type validation
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type. Allowed: PNG, JPG, JPEG, and WEBP.");
      return;
    }

    // 2. File Size validation (Max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 2MB limit.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("images", file);

    try {
      const res = await uploadImages(formData);
      if (res.success && res.images?.length > 0) {
        setImage({
          url: res.images[0].url,
          public_id: res.images[0].public_id,
        });
        toast.success("Category image uploaded successfully.");
      } else {
        toast.error("Failed to upload image resource.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveClick = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    if (!slug.trim()) {
      toast.error("Category slug is required.");
      return;
    }

    // Validate slug regex format: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      toast.error("Invalid slug format. Lowercase, numbers and single dashes only.");
      return;
    }

    // Normalize name whitespace: Royal     Silk -> Royal Silk
    const normalizedName = name.trim().replace(/\s+/g, " ");

    onSave({
      name: normalizedName,
      slug,
      description,
      status,
      image,
    });
  };

  return (
    <div className="category-form-backdrop">
      <div className="category-form-modal-container">
        <div className="category-modal-header">
          <h3>{isEditMode ? "Edit Category" : "Add Category"}</h3>
          <button className="modal-close-x" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSaveClick} className="category-modal-form-flow">
          {/* Live Image Preview Card */}
          <div className="category-live-preview-box">
            {image.url ? (
              <img
                src={image.url}
                alt="Live Preview"
                className="category-image-preview-element"
              />
            ) : (
              <div className="preview-element-placeholder">
                <span>🖼️ Image Preview</span>
                <p>Aspect ratio 1:1 or 4:5 recommended</p>
              </div>
            )}
          </div>

          {/* Name Field */}
          <div className="form-group-input">
            <label htmlFor="catName">Category Name</label>
            <input
              type="text"
              id="catName"
              placeholder="e.g. Silk Sarees"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>

          {/* Slug Field (Locked in Edit Mode) */}
          <div className="form-group-input">
            <label htmlFor="catSlug">Slug</label>
            <input
              type="text"
              id="catSlug"
              placeholder="e.g. silk-sarees"
              value={slug}
              disabled={isEditMode} // Locked in Edit Mode for SEO stability
              onChange={handleSlugChange}
              required
            />
            {isEditMode && (
              <span className="slug-input-disclaimer">
                🔒 Slug is immutable after category creation to protect SEO index integrity.
              </span>
            )}
          </div>

          {/* Image Upload Input */}
          <div className="form-group-input">
            <label>Category Image</label>
            <div className="image-upload-flex-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                id="modalImageFile"
                className="hidden-file-input"
              />
              <label htmlFor="modalImageFile" className="custom-upload-picker-btn">
                {uploading ? "Uploading Cloudinary..." : "Choose Image File"}
              </label>
              {image.url && (
                <button
                  type="button"
                  className="clear-image-btn"
                  onClick={() => setImage({ url: "", public_id: "" })}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-group-input">
            <label htmlFor="catDesc">Description</label>
            <textarea
              id="catDesc"
              rows={3}
              placeholder="Description of the weaving artisan crafts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Status Dropdown */}
          <div className="form-group-input">
            <label htmlFor="catStatus">Display Status</label>
            <select
              id="catStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="modal-select-field"
            >
              <option value="Active">Active (Visible)</option>
              <option value="Inactive">Inactive (Draft)</option>
              <option value="Hidden">Hidden (Hidden)</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="category-form-modal-actions">
            <button
              type="button"
              className="modal-action-btn cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-action-btn save"
              disabled={saving || uploading}
            >
              {saving ? "Saving changes..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
