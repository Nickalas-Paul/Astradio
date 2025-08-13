'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getTodayChart, generateAudio, streamUrl } from '@/lib/api';

interface Planet {
  longitude: number;
  sign: {
    name: string;
    degree: number;
    element: string;
    modality: string;
  };
  house: number;
  retrograde: boolean;
}

interface Chart {
  planets: { [key: string]: Planet };
  houses: { [key: string]: any };
  metadata: {
    conversion_method: string;
    birth_datetime: string;
    coordinate_system: string;
  };
}

export default function HomePage() {
  const [chart, setChart] = useState<Chart | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [genre, setGenre] = useState('ambient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioId, setAudioId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Test API connection on mount
  useEffect(() => {
    testApiConnection();
  }, []);

  // Load chart and generate audio when API is ready
  useEffect(() => {
    if (apiStatus === 'success' && !chart) {
      fetchTodaysChart();
    }
  }, [apiStatus, chart]);

  const testApiConnection = async () => {
    setApiStatus('loading');
    try {
      const response = await fetch('https://astradio-1.onrender.com/health');
      if (response.ok) {
        setApiStatus('success');
        console.log('✅ API connection successful');
      } else {
        throw new Error(`API health check failed: ${response.status}`);
      }
    } catch (err) {
      setApiStatus('error');
      setError(`API connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('❌ API connection failed:', err);
    }
  };

  const fetchTodaysChart = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching today\'s chart...');
      
      // Fetch today's chart
      const todayData = await getTodayChart();
      console.log('✅ Chart loaded:', todayData.chart.planets);
      setChart(todayData.chart);

      // Generate audio
      console.log('🔄 Generating audio for genre:', genre);
      const audioData = await generateAudio({ 
        mode: 'personal', 
        chartA: todayData.chart,
        genre: genre
      });
      console.log('✅ Audio generated:', audioData.audioId);
      setAudioId(audioData.audioId);
      
      // Set up audio stream URL
      const url = streamUrl(audioData.audioId);
      setAudioUrl(url);
      console.log('✅ Audio URL set:', url);
      
    } catch (err) {
      console.error('❌ Error in fetchTodaysChart:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chart');
    } finally {
      setLoading(false);
    }
  };

  const playMusic = async () => {
    try {
      if (!audioRef.current || !audioUrl) {
        console.error('❌ No audio element or URL available');
        return;
      }

      console.log('🔄 Playing music...');
      
      // Set volume
      audioRef.current.volume = volume;
      
      // Play audio
      await audioRef.current.play();
      setIsPlaying(true);
      console.log('✅ Music playing successfully');
      
    } catch (err) {
      console.error('❌ Error playing music:', err);
      setError('Failed to play music. Please try clicking the play button again.');
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    console.log('⏹️ Music stopped');
  };

  const handleGenreChange = async (newGenre: string) => {
    console.log('🔄 Changing genre to:', newGenre);
    setGenre(newGenre);
    if (chart) {
      // Regenerate audio with new genre
      try {
        setLoading(true);
        const audioData = await generateAudio({ 
          mode: 'personal', 
          chartA: chart,
          genre: newGenre
        });
        setAudioId(audioData.audioId);
        const url = streamUrl(audioData.audioId);
        setAudioUrl(url);
        console.log('✅ New audio generated for genre:', newGenre);
        
        // Stop current playback
        if (isPlaying) {
          stopMusic();
        }
      } catch (err) {
        console.error('❌ Error regenerating audio:', err);
        setError('Failed to change genre');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const renderChartWheel = () => {
    if (!chart) return null;

    return (
      <div className="chart-wheel">
        <div className="wheel-container">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Outer circle */}
            <circle cx="150" cy="150" r="140" fill="none" stroke="#333" strokeWidth="2" />
            
            {/* House lines */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30) * (Math.PI / 180);
              const x1 = 150 + 100 * Math.cos(angle);
              const y1 = 150 + 100 * Math.sin(angle);
              const x2 = 150 + 140 * Math.cos(angle);
              const y2 = 150 + 140 * Math.sin(angle);
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#666"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* House numbers */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = ((i * 30) + 15) * (Math.PI / 180);
              const x = 150 + 120 * Math.cos(angle);
              const y = 150 + 120 * Math.sin(angle);
              
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#666"
                >
                  {i + 1}
                </text>
              );
            })}
            
            {/* Planets */}
            {Object.entries(chart.planets).map(([name, planet]) => {
              const angle = (planet.longitude - 90) * (Math.PI / 180); // -90 to start at top
              const x = 150 + 80 * Math.cos(angle);
              const y = 150 + 80 * Math.sin(angle);
              
              const planetSymbols: { [key: string]: string } = {
                Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂'
              };
              
              return (
                <g key={name}>
                  <circle cx={x} cy={y} r="8" fill="#4f46e5" />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                  >
                    {planetSymbols[name] || name[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        <div className="planet-list">
          {Object.entries(chart.planets).map(([name, planet]) => (
            <div key={name} className="planet-info">
              <strong>{name}</strong>: {planet.sign.name} {planet.sign.degree}°
              {planet.retrograde && ' ℞'}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStatus = () => {
    if (apiStatus === 'loading') {
      return <div className="status loading">🔄 Connecting to API...</div>;
    }
    if (apiStatus === 'error') {
      return <div className="status error">❌ API connection failed</div>;
    }
    if (loading) {
      return <div className="status loading">🔄 Loading chart and generating music...</div>;
    }
    if (audioUrl) {
      return <div className="status success">✅ Ready to play music!</div>;
    }
    return null;
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🎵 Astradio - Daily Chart Music</h1>
        <p>Today&apos;s planetary positions converted to music</p>
      </header>

      {renderStatus()}

      {error && (
        <div className="error">
          ❌ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="main-content">
        <div className="chart-section">
          <h2>Today&apos;s Chart</h2>
          {chart ? (
            renderChartWheel()
          ) : (
            <div className="loading">Loading chart...</div>
          )}
        </div>

        <div className="controls-section">
          <h2>Music Player</h2>
          
          <div className="genre-selector">
            <label>Genre:</label>
            <select value={genre} onChange={(e) => handleGenreChange(e.target.value)} disabled={loading}>
              <option value="ambient">Ambient</option>
              <option value="techno">Techno</option>
              <option value="world">World</option>
              <option value="hiphop">Hip-Hop</option>
            </select>
          </div>

          <div className="playback-controls">
            <button
              onClick={isPlaying ? stopMusic : playMusic}
              disabled={!audioUrl || loading}
              className="play-button"
            >
              {isPlaying ? '⏹️ Stop' : '▶️ Play'}
            </button>
          </div>

          <div className="volume-control">
            <label>Volume:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            />
            <span>{Math.round(volume * 100)}%</span>
          </div>

          {audioUrl && (
            <div className="audio-info">
              <p>✅ Audio ready: {audioId}</p>
              <p>Genre: {genre}</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header h1 {
          color: #4f46e5;
          margin-bottom: 10px;
        }

        .status {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 500;
        }

        .status.loading {
          background: #dbeafe;
          color: #1e40af;
        }

        .status.success {
          background: #d1fae5;
          color: #065f46;
        }

        .status.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .main-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .main-content {
            grid-template-columns: 1fr;
          }
        }

        .chart-section, .controls-section {
          background: #f8fafc;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .wheel-container {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .planet-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .planet-info {
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }

        .genre-selector, .volume-control {
          margin-bottom: 20px;
        }

        .genre-selector label, .volume-control label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .genre-selector select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
        }

        .play-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 18px;
          cursor: pointer;
          width: 100%;
          margin-bottom: 20px;
        }

        .play-button:hover {
          background: #4338ca;
        }

        .play-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .volume-control input {
          width: 100%;
          margin-bottom: 8px;
        }

        .audio-info {
          background: #d1fae5;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          color: #065f46;
        }
      `}</style>
      
      {/* Audio element for streaming */}
      <audio 
        ref={audioRef} 
        preload="auto" 
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio error:', e);
          setError('Audio playback error. Please try again.');
        }}
      />
    </div>
  );
}