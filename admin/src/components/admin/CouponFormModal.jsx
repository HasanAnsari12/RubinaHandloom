import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { formatDiscount, calculateCouponStatus } from "../../utils/couponUtils";
import "./CouponFormModal.css";

const CouponFormModal = ({
  isOpen,
  onClose,
  onSave,
  coupon = null,
  loading = false,
}) => {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("");
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [status, setStatus] = useState("Draft");
  const [theme, setTheme] = useState("Luxury Wine");

  // Form validations & dirty tracker
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [animatePreview, setAnimatePreview] = useState(false);

  // Initialize fields on open
  useEffect(() => {
    if (isOpen) {
      if (coupon) {
        setCode(coupon.code || "");
        setTitle(coupon.title || "");
        setDescription(coupon.description || "");
        setDiscountType(coupon.discountType || "Percentage");
        setDiscountValue(coupon.discountValue || "");
        setMinimumOrderAmount(coupon.minimumOrderAmount || "");
        setMaximumDiscountAmount(coupon.maximumDiscountAmount || "");
        setUsageLimit(coupon.usageLimit !== null ? coupon.usageLimit : "");
        
        // Format dates for input datetime-local
        setValidFrom(coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : "");
        setValidUntil(coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "");
        setStatus(coupon.status || "Draft");
      } else {
        // Defaults for create mode
        setCode("");
        setTitle("");
        setDescription("");
        setDiscountType("Percentage");
        setDiscountValue("");
        setMinimumOrderAmount("0");
        setMaximumDiscountAmount("");
        setUsageLimit("1");
        
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 7);
        
        setValidFrom(now.toISOString().slice(0, 16));
        setValidUntil(tomorrow.toISOString().slice(0, 16));
        setStatus("Draft");
      }
      setErrors({});
      setIsDirty(false);
    }
  }, [isOpen, coupon]);

  // Live status predictor and Preview animator
  useEffect(() => {
    if (validFrom && validUntil && status !== "Draft" && status !== "Disabled") {
      const predicted = calculateCouponStatus(validFrom, validUntil, status);
      if (predicted !== status) {
        setStatus(predicted);
      }
    }
  }, [validFrom, validUntil, status]);

  const triggerPreviewAnimation = () => {
    setAnimatePreview(true);
    const timer = setTimeout(() => setAnimatePreview(false), 200);
    return () => clearTimeout(timer);
  };

  const handleFieldChange = (fieldSetter, value) => {
    fieldSetter(value);
    setIsDirty(true);
    triggerPreviewAnimation();
  };

  const handleCodeChange = (e) => {
    // 6. Live Sanitization: remove non-alphanumeric immediately and capitalize
    const sanitized = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    setCode(sanitized);
    setIsDirty(true);
    triggerPreviewAnimation();
  };

  const handleCloseAttempt = () => {
    if (isDirty) {
      const confirmLeave = window.confirm("You have unsaved changes. Leave?");
      if (!confirmLeave) return; // stay editing
    }
    onClose();
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!code.trim()) tempErrors.code = "Coupon code is required.";
    if (!title.trim()) tempErrors.title = "Title is required.";
    
    const discVal = Number(discountValue);
    if (isNaN(discVal) || discVal <= 0) {
      tempErrors.discountValue = "Discount value must be a positive number.";
    } else if (discountType === "Percentage" && discVal > 100) {
      tempErrors.discountValue = "Percentage discount cannot exceed 100%.";
    }

    if (minimumOrderAmount && Number(minimumOrderAmount) < 0) {
      tempErrors.minimumOrderAmount = "Minimum order value cannot be negative.";
    }

    if (discountType === "Percentage" && maximumDiscountAmount && Number(maximumDiscountAmount) < 0) {
      tempErrors.maximumDiscountAmount = "Maximum discount cap cannot be negative.";
    }

    if (usageLimit && Number(usageLimit) <= 0) {
      tempErrors.usageLimit = "Usage limit must be a positive integer greater than 0, or blank for unlimited.";
    }

    if (!validFrom) tempErrors.validFrom = "Start date is required.";
    if (!validUntil) tempErrors.validUntil = "Expiry date is required.";
    if (validFrom && validUntil && new Date(validUntil) <= new Date(validFrom)) {
      tempErrors.validUntil = "Expiry date (validUntil) must be after start date (validFrom).";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      code,
      title,
      description,
      discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscountAmount: discountType === "Percentage" ? (Number(maximumDiscountAmount) || null) : null,
      usageLimit: usageLimit !== "" ? Number(usageLimit) : null,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
      status,
    };

    onSave(payload);
  };

  const getPreviewDiscountText = () => {
    if (!discountValue) return "—";
    if (discountType === "Percentage") {
      const capText = maximumDiscountAmount ? ` up to ₹${maximumDiscountAmount}` : "";
      return `${discountValue}% OFF${capText}`;
    }
    return `₹${discountValue} OFF`;
  };

  const getPreviewExpiryText = () => {
    if (!validUntil) return "—";
    return new Date(validUntil).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      title={coupon ? "Modify Coupon" : "Create Coupon Campaign"}
    >
      <form onSubmit={handleFormSubmit} className="coupon-form-grid-layout">
        {/* Left: Input Columns */}
        <div className="coupon-inputs-column">
          <div className="form-row-two">
            <div className="form-group-item">
              <label htmlFor="form-coupon-code">Coupon Code *</label>
              <input
                id="form-coupon-code"
                type="text"
                placeholder="e.g. SAVE20"
                value={code}
                onChange={handleCodeChange}
                className={errors.code ? "input-invalid" : ""}
              />
              {errors.code && <span className="inline-field-error-lbl">{errors.code}</span>}
            </div>

            <div className="form-group-item">
              <label htmlFor="form-coupon-title">Campaign Title *</label>
              <input
                id="form-coupon-title"
                type="text"
                placeholder="e.g. Festive Silk Offer"
                value={title}
                onChange={(e) => handleFieldChange(setTitle, e.target.value)}
                className={errors.title ? "input-invalid" : ""}
              />
              {errors.title && <span className="inline-field-error-lbl">{errors.title}</span>}
            </div>
          </div>

          <div className="form-group-item">
            <label htmlFor="form-coupon-desc">Campaign Description</label>
            <textarea
              id="form-coupon-desc"
              rows={2}
              placeholder="Detail discount guidelines or restrictions..."
              value={description}
              onChange={(e) => handleFieldChange(setDescription, e.target.value)}
            />
          </div>

          <div className="form-row-three">
            <div className="form-group-item">
              <label htmlFor="form-coupon-distype">Discount Type *</label>
              <select
                id="form-coupon-distype"
                value={discountType}
                onChange={(e) => handleFieldChange(setDiscountType, e.target.value)}
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Flat">Flat (₹)</option>
              </select>
            </div>

            <div className="form-group-item">
              <label htmlFor="form-coupon-disval">Discount Value *</label>
              <input
                id="form-coupon-disval"
                type="number"
                placeholder="e.g. 20"
                value={discountValue}
                onChange={(e) => handleFieldChange(setDiscountValue, e.target.value)}
                className={errors.discountValue ? "input-invalid" : ""}
              />
              {errors.discountValue && <span className="inline-field-error-lbl">{errors.discountValue}</span>}
            </div>

            <div className="form-group-item">
              <label htmlFor="form-coupon-minamount">Minimum Order (₹)</label>
              <input
                id="form-coupon-minamount"
                type="number"
                value={minimumOrderAmount}
                onChange={(e) => handleFieldChange(setMinimumOrderAmount, e.target.value)}
                className={errors.minimumOrderAmount ? "input-invalid" : ""}
              />
              {errors.minimumOrderAmount && <span className="inline-field-error-lbl">{errors.minimumOrderAmount}</span>}
            </div>
          </div>

          <div className="form-row-two">
            {/* Dynamic Maximum Discount block */}
            {discountType === "Percentage" && (
              <div className="form-group-item">
                <label htmlFor="form-coupon-maxamount">Maximum Discount (₹)</label>
                <input
                  id="form-coupon-maxamount"
                  type="number"
                  placeholder="e.g. 500 (blank for unlimited)"
                  value={maximumDiscountAmount}
                  onChange={(e) => handleFieldChange(setMaximumDiscountAmount, e.target.value)}
                  className={errors.maximumDiscountAmount ? "input-invalid" : ""}
                />
                {errors.maximumDiscountAmount && <span className="inline-field-error-lbl">{errors.maximumDiscountAmount}</span>}
              </div>
            )}

            <div className="form-group-item">
              <label htmlFor="form-coupon-usagelimit">Usage Limit (claims count)</label>
              <input
                id="form-coupon-usagelimit"
                type="number"
                placeholder="e.g. 500 (blank for unlimited)"
                value={usageLimit}
                onChange={(e) => handleFieldChange(setUsageLimit, e.target.value)}
                className={errors.usageLimit ? "input-invalid" : ""}
              />
              {errors.usageLimit && <span className="inline-field-error-lbl">{errors.usageLimit}</span>}
            </div>
          </div>

          <div className="form-row-two">
            <div className="form-group-item">
              <label htmlFor="form-coupon-validfrom">Valid From *</label>
              <input
                id="form-coupon-validfrom"
                type="datetime-local"
                value={validFrom}
                onChange={(e) => handleFieldChange(setValidFrom, e.target.value)}
                className={errors.validFrom ? "input-invalid" : ""}
              />
              {errors.validFrom && <span className="inline-field-error-lbl">{errors.validFrom}</span>}
            </div>

            <div className="form-group-item">
              <label htmlFor="form-coupon-validuntil">Valid Until (Expiry) *</label>
              <input
                id="form-coupon-validuntil"
                type="datetime-local"
                value={validUntil}
                onChange={(e) => handleFieldChange(setValidUntil, e.target.value)}
                className={errors.validUntil ? "input-invalid" : ""}
              />
              {errors.validUntil && <span className="inline-field-error-lbl">{errors.validUntil}</span>}
            </div>
          </div>

          <div className="form-row-two">
            <div className="form-group-item">
              <label htmlFor="form-coupon-status">Manual Status Override</label>
              <select
                id="form-coupon-status"
                value={status}
                onChange={(e) => handleFieldChange(setStatus, e.target.value)}
              >
                <option value="Draft">Draft (stays inactive)</option>
                <option value="Active">Enable Auto Schedule</option>
                <option value="Disabled">Disable Campaign</option>
              </select>
            </div>

            <div className="form-group-item">
              <label htmlFor="form-coupon-theme">Card Preview Theme</label>
              <select
                id="form-coupon-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="Luxury Wine">Luxury Wine</option>
                <option value="Festive">Festive Gold (Coming Soon)</option>
                <option value="Minimal">Minimal (Coming Soon)</option>
                <option value="Dark">Classic Dark (Coming Soon)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Website Preview Card */}
        <div className="coupon-preview-column">
          <span className="preview-column-title">Client-Website Card Preview</span>
          
          <div className={`luxury-wine-coupon-card ${animatePreview ? "edit-scaled" : ""}`}>
            {/* Header border design */}
            <div className="card-top-header">
              <span className="card-scope-label">🌍 Applicable On All Products</span>
              <div className="coupon-ribbon-tag">Claim</div>
            </div>

            <div className="card-inner-body">
              <h4 className="preview-card-code">{code || "COUPONCODE"}</h4>
              <h3 className="preview-card-value">{getPreviewDiscountText()}</h3>
              <p className="preview-card-title">{title || "Campaign Title Placeholder"}</p>
            </div>

            <div className="card-dashed-divider">
              <div className="card-notch notch-left"></div>
              <div className="card-notch notch-right"></div>
            </div>

            <div className="card-footer-details">
              <div className="footer-meta-row">
                <span>Minimum Order:</span>
                <strong>₹{minimumOrderAmount || "0"}</strong>
              </div>
              <div className="footer-meta-row">
                <span>Valid Until:</span>
                <strong>{getPreviewExpiryText()}</strong>
              </div>
            </div>
          </div>

          <div className="preview-auto-status-indicator">
            <span>Predicted Launch Status:</span>
            <strong className={`predicted-status-badge predicted-${status.toLowerCase()}`}>
              {status}
            </strong>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="modal-actions-full-row">
          <button
            type="button"
            className="modal-cancel-btn-toolbar"
            onClick={handleCloseAttempt}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="modal-submit-btn-toolbar"
            disabled={loading}
          >
            {loading ? "Saving Campaign..." : coupon ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CouponFormModal;
