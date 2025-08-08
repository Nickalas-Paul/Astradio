'use client';

import React, { useState, useEffect } from 'react';
import getUnifiedAudioController from '../lib/unifiedAudioController';

const GENRES = [
  { id: 'ambient', name: 'Ambient', description: 'Peaceful, atmospheric sounds' },
  { id: 'techno', name: 'Techno', description: 'Electronic, rhythmic beats' },
  { id: 'world', name: 'World', description: 'Global, cultural influences' },
  { id: 'hip-hop', name: 'Hip-Hop', description: 'Urban, rhythmic patterns' }
];

export default function DailyChartPlayer() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGenre, setCurrentGenre] = useState('ambient');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    // Initialize audio controller
    const audioController = getUnifiedAudioController();
    
    // Set up status callback
    audioController.onStatusChangeCallback((status) => {
      setIsLoading(status.isLoading);
      setIsPlaying(status.isPlaying);
      setCurrentTime(status.currentTime);
      setDuration(status.duration);
      setError(status.error);
    });

    // Load today's chart on mount
    loadTodayChart();

    return () => {
      audioController.destroy();
    };
  }, []);

  const loadTodayChart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const today = new Date().toISOString().split('T')[0];
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/api/daily/${today}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setChartData(data.data);
      
      console.log('📊 Today\'s chart loaded:', data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart');
      console.error('❌ Chart loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const playDailyAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const audioController = getUnifiedAudioController();
      
      if (chartData && chartData.chart) {
        // Use real-time chart-based music generation
        const success = await audioController.playChartAudio(chartData.chart, currentGenre, 60);
        
        if (!success) {
          throw new Error('Failed to start chart-based audio playback');
        }
        
        console.log(`🎵 Playing chart-based music in ${currentGenre} genre`);
      } else {
        // Fallback to API-based audio
        const success = await audioController.playDailyAudio(currentGenre, 60);
        
        if (!success) {
          throw new Error('Failed to start audio playback');
        }
        
        console.log(`🎵 Playing daily audio in ${currentGenre} genre`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play audio');
      console.error('❌ Audio playback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    const audioController = getUnifiedAudioController();
    audioController.stop();
    console.log('⏹️ Audio stopped');
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    const audioController = getUnifiedAudioController();
    audioController.setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Today's Astrological Music</h2>
        <p className="text-slate-300">
          Experience music generated from today's planetary positions using real-time astrological algorithms
        </p>
      </div>

      {/* Chart Info */}
      {chartData && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Today's Chart</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(chartData.chart?.planets || {}).slice(0, 4).map(([planet, data]: [string, any]) => (
              <div key={planet} className="text-center">
                <div className="text-emerald-400 font-medium">{planet}</div>
                <div className="text-slate-300">{data.sign?.name || 'Unknown'}</div>
              </div>
            ))}
          </div>
          {chartData.chart?.aspects && (
            <div className="mt-3 text-center text-xs text-slate-400">
              {chartData.chart.aspects.length} aspects detected
            </div>
          )}
        </div>
      )}

      {/* Genre Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Choose Genre</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setCurrentGenre(genre.id)}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                currentGenre === genre.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <div className="font-semibold">{genre.name}</div>
              <div className="text-xs opacity-75">{genre.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Volume Control */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Volume</h3>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm">0%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-slate-300 text-sm">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="mb-6">
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={playDailyAudio}
            disabled={isLoading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg text-white font-medium flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <span>▶️</span>
                Play Today's Music
              </>
            )}
          </button>
          
          <button
            onClick={stopAudio}
            disabled={!isPlaying}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-white font-medium"
          >
            ⏹️ Stop
          </button>
        </div>

        {/* Progress Bar */}
        {isPlaying && (
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Time Display */}
        {isPlaying && (
          <div className="text-center text-sm text-slate-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500/20 rounded-lg">
          <div className="text-red-400 font-medium">Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      )}

      {/* Status */}
      <div className="text-center text-sm text-slate-400">
        {isPlaying ? (
          <span className="text-emerald-400">🎵 Playing {currentGenre} music from today's chart</span>
        ) : isLoading ? (
          <span className="text-yellow-400">⏳ Loading...</span>
        ) : (
          <span>Ready to play today's astrological music</span>
        )}
      </div>

      {/* Technical Info */}
      <div className="mt-6 p-3 bg-slate-800/30 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Technical Details</h4>
        <div className="text-xs text-slate-400 space-y-1">
          <div>• Real-time music generation using Tone.js</div>
          <div>• Planetary positions converted to musical frequencies</div>
          <div>• Zodiac signs influence rhythm and harmony</div>
          <div>• Astrological aspects create harmonic relationships</div>
          <div>• Houses determine volume and tempo characteristics</div>
        </div>
      </div>
    </div>
  );
}
