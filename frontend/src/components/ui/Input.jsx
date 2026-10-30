// frontend/src/components/ui/Input.jsx
import { useState } from 'react';

function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const inputStyles = `
    .ui-input-container {
      display: flex;
      flex-direction: column;
      font-family: var(--font-body);
      margin-bottom: var(--space-16);
      width: 100%;
    }

    .ui-input-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-8);
      text-align: left;
    }

    .ui-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .ui-input-field {
      width: 100%;
      padding: var(--space-12) var(--space-16);
      font-family: var(--font-body);
      font-size: 15px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-8);
      background-color: var(--surface);
      color: var(--text-primary);
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .ui-input-field:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
    }

    .ui-input-field:disabled {
      background-color: var(--background);
      cursor: not-allowed;
      opacity: 0.8;
    }

    /* Error state */
    .ui-input-error .ui-input-field {
      border-color: var(--error);
    }
    .ui-input-error .ui-input-field:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .ui-input-error-text {
      color: var(--error);
      font-size: 12px;
      margin-top: var(--space-4);
      font-weight: 500;
      text-align: left;
    }

    .ui-input-helper-text {
      color: var(--text-secondary);
      font-size: 12px;
      margin-top: var(--space-4);
      text-align: left;
    }

    /* Password Toggle Button */
    .ui-input-password-toggle {
      position: absolute;
      right: var(--space-16);
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 14px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
    }
    
    .ui-input-password-toggle:hover {
      color: var(--primary);
    }
  `;

  return (
    <>
      <style>{inputStyles}</style>
      <div className={`ui-input-container ${error ? 'ui-input-error' : ''} ${className}`}>
        {label && (
          <label className="ui-input-label">
            {label}
            {required && <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <div className="ui-input-wrapper">
          <input
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="ui-input-field"
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="ui-input-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          )}
        </div>
        {error && <span className="ui-input-error-text">{error}</span>}
        {!error && helperText && <span className="ui-input-helper-text">{helperText}</span>}
      </div>
    </>
  );
}

export default Input;
