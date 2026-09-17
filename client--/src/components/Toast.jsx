import { useState } from 'react';

/**
 * Toast – self-dismissing notification.
 *
 * Props:
 *  toasts  – array of { id, message, type: 'success' | 'error' }
 *  onClose – callback(id) to remove a toast
 */
export default function Toast({ toasts, onClose }) {
    return (
        <div className="toast-container">
            {toasts.map((t) => (
                <div key={t.id} className={`toast ${t.type}`}>
                    <span className="toast-icon">
                        {t.type === 'success' ? '✅' : '❌'}
                    </span>
                    <span>{t.message}</span>
                    <button
                        className="toast-close"
                        onClick={() => onClose(t.id)}
                        aria-label="Dismiss notification"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
