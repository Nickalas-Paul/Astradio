'use client';

import React from 'react';

interface AudioStatus {
  isPlaying: boolean;
  isLoading: boolean;
  currentSession: any;
  error: string | null;
}

interface AudioControlsProps {
  audioStatus: AudioStatus;
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  onMute?: () => void;
  isMuted?: boolean;
}

export default function AudioControls({ audioStatus, onPlay, onStop, onPause, onMute, isMuted = false }: AudioControlsProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
      <h3 className="text-lg font-semibold mb-3 text-center glow-text">
        Audio Controls
      </h3>
      
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onPlay}
          disabled={audioStatus.isLoading || audioStatus.isPlaying}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          ▶️ Play
        </button>
        
        <button
          onClick={onPause}
          disabled={audioStatus.isLoading || !audioStatus.isPlaying}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          ⏸️ Pause
        </button>
        
        <button
          onClick={onStop}
          disabled={audioStatus.isLoading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          ⏹️ Stop
        </button>
        
        {onMute && (
          <button
            onClick={onMute}
            disabled={audioStatus.isLoading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isMuted ? '🔇' : '🔊'} Mute
          </button>
        )}
      </div>
      
      {audioStatus.isLoading && (
        <div className="mt-3 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
          <p className="text-sm text-gray-300 mt-2">Loading audio...</p>
        </div>
      )}
      
      {audioStatus.isPlaying && (
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Audio Playing</span>
          </div>
        </div>
      )}
      
      {audioStatus.error && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded">
          <p className="text-sm text-red-300">❌ {audioStatus.error}</p>
        </div>
      )}
    </div>
  );
} 