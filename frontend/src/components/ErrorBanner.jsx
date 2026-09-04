import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message, onRetry, onDismiss }) {
  if (!message) return null;

  return (
    <div className="error-banner">
      <div className="error-icon-wrap">
        <AlertCircle size={20} />
      </div>
      <div className="error-body">
        <h4 className="error-title">Recommendation Notice</h4>
        <p className="error-message">
          {message || 'Something went wrong while finding matches. Please try again.'}
        </p>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button type="button" className="error-btn-retry" onClick={onRetry}>
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="error-btn-close"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
