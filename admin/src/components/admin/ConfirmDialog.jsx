import React from "react";
import Modal from "./Modal";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  loading = false,
  children,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title} className="confirm-dialog-width">
      <div className="confirm-dialog-content">
        <p className="confirm-dialog-message">{message}</p>
        
        {/* Slot for custom preview content (e.g., product image and name) */}
        {children && <div className="confirm-dialog-preview-slot">{children}</div>}

        <div className="confirm-dialog-footer">
          <button
            className="confirm-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-btn-action ${isDanger ? "danger-action" : ""}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="confirm-dialog-spinner-container">
                <span className="confirm-spinner"></span>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
