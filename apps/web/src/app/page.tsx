'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import AutoPlayer from '../components/AutoPlayer';
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

interface MusicEvent {
  planet: string;
  frequency: number;
  startTime: number;
  duration: number;
  volume: number;
  instrument: string;
}

export default function HomePage() {
  const [chart, setChart] = useState<Chart | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [genre, setGenre] = useState('ambient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioId, setAudioId] = useState<string | null>(null);
  const [needsTap, setNeedsTap] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchTodaysChart();
  }, []);

  const fetchTodaysChart = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch today's chart
      const todayData = await getTodayChart();
      setChart(todayData.chart);

      // Generate audio
      const audioData = await generateAudio({ 
        mode: 'personal', 
        chartA: todayData.chart 
      });
      setAudioId(audioData.audioId);
      
      // Set up audio stream
      const url = streamUrl(audioData.audioId);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play().catch(() => setNeedsTap(true));
      }
      
    } catch (err) {
      console.error('Error fetching chart:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chart');
    } finally {
      setLoading(false);
    }
  };

  const startAudioContext = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      setAudioStarted(true);
    }
  };

  const playMusic = async () => {
    try {
      await startAudioContext();
      
      if (!chart) return;

      // Stop any existing audio
      Tone.getTransport().stop();
      Tone.getTransport().cancel();

      // Generate music events from chart
      const events = generateMusicEvents(chart, genre);
      
      // Set volume
      Tone.getDestination().volume.value = Tone.gainToDb(volume);

      // Create synths and schedule events
      events.forEach((event) => {
        const synth = new Tone.Synth({
          oscillator: { type: event.instrument as any },
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.7,
            release: 0.8
          }
        }).toDestination();

        Tone.getTransport().schedule((time) => {
          synth.triggerAttackRelease(
            Tone.Frequency(event.frequency, 'hz').toNote(),
            event.duration,
            time,
            event.volume * volume
          );
        }, event.startTime);
      });

      Tone.getTransport().start();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing music:', err);
      setError('Failed to play music');
    }
  };

  const stopMusic = () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    setIsPlaying(false);
  };

  const generateMusicEvents = (chart: Chart, genre: string): MusicEvent[] => {
    const events: MusicEvent[] = [];
    const planets = Object.entries(chart.planets);
    
    planets.forEach(([name, data], index) => {
      const baseFreq: { [key: string]: number } = {
        Sun: 261.63, Moon: 293.66, Mercury: 329.63, Venus: 349.23, Mars: 392.00
      };
      
      const frequency = (baseFreq[name] || 440) * (1 + (data.longitude / 360) * 0.5);
      const startTime = index * 2; // 2 seconds apart
      const duration = genre === 'techno' ? 1.5 : genre === 'ambient' ? 4 : 2;
      
      events.push({
        planet: name,
        frequency: Math.round(frequency),
        startTime,
        duration,
        volume: 0.6,
        instrument: genre === 'techno' ? 'square' : genre === 'ambient' ? 'sine' : 'triangle'
      });
    });
    
    return events;
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

  return (
    <div className="container">
      <header className="header">
        <h1>🎵 Astradio - Daily Chart Music</h1>
        <p>Today&apos;s planetary positions converted to music</p>
      </header>

      {error && (
        <div className="error">
          ❌ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="main-content">
        <div className="chart-section">
          <h2>Today&apos;s Chart</h2>
          {loading ? (
            <div className="loading">Loading chart...</div>
          ) : chart ? (
            renderChartWheel()
          ) : (
            <div className="error">No chart data available</div>
          )}
        </div>

        <div className="controls-section">
          <h2>Music Player</h2>
          
          <div className="genre-selector">
            <label>Genre:</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="ambient">Ambient</option>
              <option value="techno">Techno</option>
              <option value="world">World</option>
              <option value="hiphop">Hip-Hop</option>
            </select>
          </div>

          <div className="playback-controls">
            <button
              onClick={isPlaying ? stopMusic : playMusic}
              disabled={!chart || loading}
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
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
            <span>{Math.round(volume * 100)}%</span>
          </div>

          {!audioStarted && (
            <div className="audio-note">
              💡 Click Play to start audio (browser requires user interaction)
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

        .audio-note {
          background: #dbeafe;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          color: #1e40af;
        }
      `}</style>
      
      {/* Audio element for streaming */}
      <audio ref={audioRef} preload="auto" />
      
      {/* Tap to play button */}
      {needsTap && (
        <button 
          onClick={() => audioRef.current?.play()}
          className="play-button"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          Start soundtrack
        </button>
      )}
      
      {/* Loading and error states */}
      {!chart && !error && <p>Loading chart…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
    </div>
  );
}