'use client';
import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  type = 'error' 
}: ErrorDisplayProps) {
  const typeStyles = {
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-300',
      icon: '❌'
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      text: 'text-yellow-300',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
      icon: 'ℹ️'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={`p-4 ${styles.bg} border ${styles.border} rounded-lg`}>
      <div className="flex items-start space-x-3">
        <div className="text-lg">{styles.icon}</div>
        <div className="flex-1">
          <p className={`${styles.text} font-medium`}>{error}</p>
          <div className="flex space-x-2 mt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 