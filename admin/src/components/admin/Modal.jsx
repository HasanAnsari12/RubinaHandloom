import React, { useEffect, useRef } from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-container-generic ${className}`}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header-generic">
          {title && <h3 className="modal-title-generic">{title}</h3>}
          <button className="modal-close-btn-generic" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <div className="modal-body-generic">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
