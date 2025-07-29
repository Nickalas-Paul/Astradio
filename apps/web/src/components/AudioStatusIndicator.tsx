'use client';

import React from 'react';

interface AudioStatusIndicatorProps {
  isPlaying: boolean;
  isLoading: boolean;
  currentHouse?: number;
  duration?: number;
  className?: string;
}

export default function AudioStatusIndicator({ 
  isPlaying, 
  isLoading, 
  currentHouse = 1,
  duration = 60,
  className = "" 
}: AudioStatusIndicatorProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-purple-300 ${className}`}>
        <div className="flex space-x-1">
          <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="w-1 h-5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>Loading audio...</span>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-gray-400 ${className}`}>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <span>Audio paused</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-sm text-purple-300 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="w-1 h-5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span>Playing House {currentHouse}</span>
      {duration && (
        <span className="text-xs text-gray-400">
          ({Math.floor(duration / 12)}s per house)
        </span>
      )}
    </div>
  );
} 