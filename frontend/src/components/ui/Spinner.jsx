// frontend/src/components/ui/Spinner.jsx
import React from 'react';

function Spinner({ size = 'medium', fullscreen = false }) {
  const spinnerStyles = `
    .ui-spinner-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .ui-spinner-fullscreen {
      position: fixed;
      inset: 0;
      background-color: rgba(255, 253, 249, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
    }

    .ui-spinner-ring {
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: var(--radius-round);
      animation: ui-spin 0.8s linear infinite;
    }

    /* Sizes */
    .ui-spinner-sm {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }
    .ui-spinner-md {
      width: 40px;
      height: 40px;
      border-width: 3px;
    }
    .ui-spinner-lg {
      width: 60px;
      height: 60px;
      border-width: 4px;
    }

    @keyframes ui-spin {
      to { transform: rotate(360deg); }
    }
  `;

  const spinnerMarkup = (
    <div className="ui-spinner-container">
      <div className={`ui-spinner-ring ui-spinner-${size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'}`} />
    </div>
  );

  return (
    <>
      <style>{spinnerStyles}</style>
      {fullscreen ? (
        <div className="ui-spinner-fullscreen">
          {spinnerMarkup}
        </div>
      ) : (
        spinnerMarkup
      )}
    </>
  );
}

export default Spinner;
