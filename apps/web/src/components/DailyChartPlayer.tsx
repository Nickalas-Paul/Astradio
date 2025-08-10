'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FrontendAstroMusicEngine } from '../lib/astroMusicEngine';

interface DailyChartPlayerProps {
  className?: string;
  defaultGenre?: 'ambient' | 'techno' | 'world' | 'hip-hop';
  showGenreSelector?: boolean;
  showVolumeControl?: boolean;
  autoLoad?: boolean;
}

export const DailyChartPlayer: React.FC<DailyChartPlayerProps> = ({
  className = '',
  defaultGenre = 'ambient',
  showGenreSelector = true,
  showVolumeControl = true,
  autoLoad = true
}) => {
  const [musicEngine, setMusicEngine] = useState<FrontendAstroMusicEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [selectedGenre, setSelectedGenre] = useState<'ambient' | 'techno' | 'world' | 'hip-hop'>(defaultGenre);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize music engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        const engine = new FrontendAstroMusicEngine();
        await engine.initialize();
        setMusicEngine(engine);
        setIsInitialized(true);
        
        if (autoLoad) {
          await loadDaily(engine, selectedGenre);
        }
      } catch (err) {
        console.error('Failed to initialize music engine:', err);
        setError('Failed to initialize audio engine');
      }
    };

    initEngine();

    return () => {
      if (musicEngine) {
        musicEngine.dispose();
      }
    };
  }, []);

  // Load daily chart
  const loadDaily = useCallback(async (engine: FrontendAstroMusicEngine, genre: typeof selectedGenre) => {
    try {
      setIsLoading(true);
      setError(null);
      await engine.loadDailyChart(genre);
      console.log('🎵 Daily chart loaded successfully');
    } catch (err) {
      console.error('Failed to load daily chart:', err);
      setError('Failed to load daily chart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (!musicEngine) return;

    try {
      if (isPlaying) {
        musicEngine.pause();
        setIsPlaying(false);
      } else {
        await musicEngine.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Failed to toggle playback:', err);
      setError('Playback failed');
    }
  }, [musicEngine, isPlaying]);

  // Handle stop
  const handleStop = useCallback(() => {
    if (!musicEngine) return;

    musicEngine.stop();
    setIsPlaying(false);
  }, [musicEngine]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (musicEngine) {
      musicEngine.setVolume(newVolume);
    }
  }, [musicEngine]);

  // Handle genre change
  const handleGenreChange = useCallback(async (genre: typeof selectedGenre) => {
    if (!musicEngine) return;

    try {
      setSelectedGenre(genre);
      setIsPlaying(false);
      musicEngine.stop();
      await loadDaily(musicEngine, genre);
    } catch (err) {
      console.error('Failed to change genre:', err);
      setError('Failed to change genre');
    }
  }, [musicEngine, loadDaily]);

  const genres = FrontendAstroMusicEngine.getAvailableGenres();

  return (
    <div className={`daily-chart-player ${className}`}>
      <div className="player-header">
        <h3 className="player-title">Today's Astrological Music</h3>
        <p className="player-subtitle">
          Generated from current planetary positions
        </p>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button 
            onClick={() => setError(null)}
            className="error-dismiss"
          >
            ×
          </button>
        </div>
      )}

      {showGenreSelector && (
        <div className="genre-selector">
          <label className="genre-label">Genre:</label>
          <select 
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value as typeof selectedGenre)}
            disabled={isLoading}
            className="genre-select"
          >
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="player-controls">
        <button
          onClick={handlePlayPause}
          disabled={!isInitialized || isLoading}
          className={`play-button ${isPlaying ? 'playing' : ''}`}
        >
          {isLoading ? (
            <span className="loading-spinner">⟳</span>
          ) : isPlaying ? (
            <span>⏸️</span>
          ) : (
            <span>▶️</span>
          )}
          <span className="button-text">
            {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
          </span>
        </button>

        <button
          onClick={handleStop}
          disabled={!isInitialized || isLoading}
          className="stop-button"
        >
          <span>⏹️</span>
          <span className="button-text">Stop</span>
        </button>
      </div>

      {showVolumeControl && (
        <div className="volume-control">
          <label className="volume-label">Volume:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
          />
          <span className="volume-value">{Math.round(volume * 100)}%</span>
        </div>
      )}

      <div className="player-info">
        <p className="current-genre">
          <strong>Current:</strong> {genres.find(g => g.id === selectedGenre)?.name || selectedGenre}
        </p>
        <p className="genre-description">
          {genres.find(g => g.id === selectedGenre)?.description}
        </p>
      </div>

      <style jsx>{`
        .daily-chart-player {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 24px;
          color: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          margin: 0 auto;
        }

        .player-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .player-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0 0 8px 0;
        }

        .player-subtitle {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0;
        }

        .error-message {
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.4);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-dismiss {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
          margin: 0;
        }

        .genre-selector {
          margin-bottom: 20px;
        }

        .genre-label {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .genre-select {
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.9rem;
        }

        .genre-select option {
          background: #333;
          color: white;
        }

        .player-controls {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .play-button, .stop-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .play-button:hover, .stop-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .play-button:disabled, .stop-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .play-button.playing {
          background: rgba(255, 193, 7, 0.3);
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .volume-label {
          font-size: 0.9rem;
          opacity: 0.9;
          min-width: 60px;
        }

        .volume-slider {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.3);
          outline: none;
          cursor: pointer;
        }

        .volume-value {
          font-size: 0.8rem;
          opacity: 0.8;
          min-width: 40px;
          text-align: right;
        }

        .player-info {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 16px;
        }

        .current-genre, .genre-description {
          margin: 0 0 8px 0;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .genre-description {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};