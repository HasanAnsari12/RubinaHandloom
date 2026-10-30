// frontend/src/components/ui/Modal.jsx
import { useEffect } from 'react';

function Modal({ isOpen, onClose, title, children }) {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalStyles = `
    .ui-modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(46, 46, 46, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: ui-modal-fade var(--transition-normal);
    }

    .ui-modal-wrapper {
      background-color: var(--surface);
      border-radius: var(--radius-16);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
      width: 90%;
      max-width: 550px;
      max-height: 85vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      animation: ui-modal-scale var(--transition-normal);
      font-family: var(--font-body);
    }

    .ui-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-20) var(--space-24);
      border-bottom: 1px solid var(--border);
    }

    .ui-modal-title {
      font-family: var(--font-heading);
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .ui-modal-close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: color var(--transition-fast), transform var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      border-radius: var(--radius-round);
    }

    .ui-modal-close-btn:hover {
      color: var(--primary);
      background-color: var(--background);
      transform: rotate(90deg);
    }

    .ui-modal-content {
      padding: var(--space-24);
      color: var(--text-primary);
      overflow-y: auto;
      font-size: 15px;
      line-height: 1.6;
    }

    @keyframes ui-modal-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes ui-modal-scale {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `;

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('ui-modal-overlay')) {
      onClose();
    }
  };

  return (
    <>
      <style>{modalStyles}</style>
      <div className="ui-modal-overlay" onClick={handleOutsideClick}>
        <div className="ui-modal-wrapper">
          <div className="ui-modal-header">
            <h3 className="ui-modal-title">{title || 'Notification'}</h3>
            <button className="ui-modal-close-btn" onClick={onClose} aria-label="Close modal">
              &times;
            </button>
          </div>
          <div className="ui-modal-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;
