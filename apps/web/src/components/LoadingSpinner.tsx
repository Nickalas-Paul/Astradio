'use client';
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'default' | 'astrological';
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md', 
  theme = 'astrological' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinnerClasses = {
    default: 'border-white',
    astrological: 'border-purple-400'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-t-transparent ${spinnerClasses[theme]}`}></div>
      {message && (
        <p className="mt-2 text-sm text-gray-300 text-center">{message}</p>
      )}
    </div>
  );
} 