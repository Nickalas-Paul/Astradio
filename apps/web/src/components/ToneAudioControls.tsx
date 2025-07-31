'use client';

import React, { useState, useEffect } from 'react';
import toneAudioService, { NoteEvent } from '../lib/toneAudioService';

interface ToneAudioControlsProps {
  chartData: any;
  genre?: string;
  onPlay?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  className?: string;
}

interface AudioStatus {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
}

export default function ToneAudioControls({ 
  chartData, 
  genre = 'ambient',
  onPlay,
  onStop,
  onPause,
  className = ''
}: ToneAudioControlsProps) {
  const [status, setStatus] = useState<AudioStatus>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    error: null
  });

  const [noteEvents, setNoteEvents] = useState<NoteEvent[]>([]);

  useEffect(() => {
    // Set up event listeners
    toneAudioService.onTimeUpdateCallback((time) => {
      setStatus(prev => ({ ...prev, currentTime: time }));
    });

    toneAudioService.onErrorCallback((error) => {
      setStatus(prev => ({ ...prev, error, isLoading: false }));
    });

    // Generate note events when chart data changes
    if (chartData) {
      const events = toneAudioService.generateNoteEvents(chartData, genre);
      setNoteEvents(events);
      setStatus(prev => ({ ...prev, duration: toneAudioService.getDuration() }));
    }

    // Cleanup
    return () => {
      toneAudioService.stop();
    };
  }, [chartData, genre]);

  const handlePlay = async () => {
    if (!chartData) {
      setStatus(prev => ({ ...prev, error: 'No chart data available' }));
      return;
    }

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const success = await toneAudioService.playNoteEvents(noteEvents);
      
      if (success) {
        setStatus(prev => ({ 
          ...prev, 
          isPlaying: true, 
          isLoading: false,
          currentTime: 0
        }));
        onPlay?.();
      } else {
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to start playback' 
        }));
      }
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  };

  const handleStop = () => {
    toneAudioService.stop();
    setStatus(prev => ({ 
      ...prev, 
      isPlaying: false, 
      currentTime: 0 
    }));
    onStop?.();
  };

  const handlePause = () => {
    toneAudioService.pause();
    setStatus(prev => ({ ...prev, isPlaying: false }));
    onPause?.();
  };

  const handleVolumeChange = (newVolume: number) => {
    toneAudioService.setVolume(newVolume);
    setStatus(prev => ({ ...prev, volume: newVolume }));
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-center glow-text">
        🎵 Live Audio Controls
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>{formatTime(status.currentTime)}</span>
          <span>{formatTime(status.duration)}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={handlePlay}
          disabled={status.isLoading || status.isPlaying}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          ▶️ Play
        </button>
        
        <button
          onClick={handlePause}
          disabled={status.isLoading || !status.isPlaying}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          ⏸️ Pause
        </button>
        
        <button
          onClick={handleStop}
          disabled={status.isLoading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          ⏹️ Stop
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-sm text-gray-300">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={status.volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-sm text-gray-300 w-12">
          {Math.round(status.volume * 100)}%
        </span>
      </div>

      {/* Status Indicators */}
      {status.isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
          <p className="text-sm text-gray-300 mt-2">Initializing audio...</p>
        </div>
      )}
      
      {status.isPlaying && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Live Audio Playing</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {noteEvents.length} notes • {genre} genre
          </p>
        </div>
      )}
      
      {status.error && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded">
          <p className="text-sm text-red-300">❌ {status.error}</p>
        </div>
      )}

      {/* Audio Info */}
      {noteEvents.length > 0 && (
        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
          <p className="text-xs text-blue-300">
            🎼 Generated {noteEvents.length} musical events from chart data
          </p>
        </div>
      )}
    </div>
  );
} 