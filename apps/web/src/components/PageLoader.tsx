'use client';
import React from 'react';

interface PageLoaderProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  theme?: 'default' | 'astrological';
}

export default function PageLoader({ 
  message = 'Loading...', 
  showProgress = false,
  progress = 0,
  theme = 'astrological'
}: PageLoaderProps) {
  const themeStyles = {
    default: {
      spinner: 'border-white',
      text: 'text-gray-300',
      accent: 'text-purple-300'
    },
    astrological: {
      spinner: 'border-purple-400',
      text: 'text-purple-200',
      accent: 'text-purple-300'
    }
  };

  const styles = themeStyles[theme];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {/* Astrological-themed loading animation */}
        <div className="relative mb-6">
          <div className={`w-16 h-16 animate-spin rounded-full border-4 border-t-transparent ${styles.spinner} mx-auto`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl">⭐</div>
          </div>
        </div>

        {/* Loading message */}
        <h2 className={`text-xl font-semibold mb-2 ${styles.accent}`}>
          {message}
        </h2>
        
        {/* Progress bar */}
        {showProgress && (
          <div className="w-full bg-white/10 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        )}

        {/* Subtitle */}
        <p className={`text-sm ${styles.text} opacity-75`}>
          Preparing your astrological experience...
        </p>

        {/* Animated dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
} 