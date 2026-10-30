// frontend/src/components/ui/Button.jsx

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const isBtnDisabled = disabled || loading;

  const btnStyles = `
    .ui-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-body);
      font-weight: 600;
      border-radius: var(--radius-8);
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: all var(--transition-fast);
      outline: none;
      white-space: nowrap;
      position: relative;
    }
    
    .ui-btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    /* Variants */
    .ui-btn-primary {
      background-color: var(--primary);
      color: var(--surface);
    }
    .ui-btn-primary:hover:not(:disabled) {
      background-color: var(--primary-hover);
      transform: translateY(-1px);
    }
    .ui-btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .ui-btn-secondary {
      background-color: var(--secondary);
      color: var(--text-primary);
    }
    .ui-btn-secondary:hover:not(:disabled) {
      background-color: var(--accent);
      color: var(--surface);
      transform: translateY(-1px);
    }

    .ui-btn-outline {
      background-color: transparent;
      border-color: var(--primary);
      color: var(--primary);
    }
    .ui-btn-outline:hover:not(:disabled) {
      background-color: var(--primary);
      color: var(--surface);
    }

    .ui-btn-ghost {
      background-color: transparent;
      color: var(--text-primary);
    }
    .ui-btn-ghost:hover:not(:disabled) {
      background-color: var(--background);
      color: var(--primary);
    }

    .ui-btn-danger {
      background-color: var(--error);
      color: var(--surface);
    }
    .ui-btn-danger:hover:not(:disabled) {
      background-color: #b91c1c;
      transform: translateY(-1px);
    }

    /* Sizes */
    .ui-btn-small {
      padding: var(--space-8) var(--space-16);
      font-size: 13px;
    }
    .ui-btn-medium {
      padding: var(--space-12) var(--space-24);
      font-size: 15px;
    }
    .ui-btn-large {
      padding: var(--space-16) var(--space-32);
      font-size: 17px;
      border-radius: var(--radius-12);
    }

    /* Loading Spinner */
    .ui-btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: var(--radius-round);
      animation: ui-btn-spin 0.6s linear infinite;
      margin-right: var(--space-8);
    }

    @keyframes ui-btn-spin {
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{btnStyles}</style>
      <button
        type={type}
        disabled={isBtnDisabled}
        onClick={onClick}
        className={`ui-btn ui-btn-${variant} ui-btn-${size} ${className}`}
        {...props}
      >
        {loading && <span className="ui-btn-spinner" />}
        {children}
      </button>
    </>
  );
}

export default Button;
