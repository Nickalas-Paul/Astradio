'use client';
import { useEffect, useRef, useState } from 'react';
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [genre, setGenre] = useState('ambient');
  const [audioId, setAudioId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    (async () => {
      const startTime = Date.now();
      console.time('page-load');
      try {
        // Start both requests immediately for parallel loading
        const [chartData] = await Promise.all([
          getTodayChart(),
          // Could add other parallel requests here
        ]);

        setChart(chartData.chart);
        
        // Generate audio immediately after chart loads
        const { audioId } = await generateAudio({ 
          mode: 'personal', 
          chartA: chartData.chart,
          genre: genre
        });
        
        const url = streamUrl(audioId);
        setAudioId(audioId);
        setAudioUrl(url);

        // Try to start playback immediately
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.volume = volume;
          
          try {
            await audioRef.current.play();
            setIsPlaying(true);
            console.log('✅ Auto-play successful');
          } catch (playError) {
            console.log('⚠️ Auto-play blocked, showing play button');
            setNeedsTap(true);
          }
        }
        
        const endTime = Date.now();
        setLoadTime(endTime - startTime);
        setLoading(false);
        console.timeEnd('page-load');
        console.log(`🚀 Page loaded in ${endTime - startTime}ms`);
        
      } catch (e: any) {
        console.error('❌ Page load error:', e);
        setErr(e?.message ?? 'Failed to load chart and audio');
        setLoading(false);
        console.timeEnd('page-load');
      }
    })();
  }, []);

  // Optional UX nicety - show friendly fallback if request exceeds ~6s
  useEffect(() => {
    const id = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(id);
  }, []);

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
      setNeedsTap(false);
      console.log('✅ Music playing successfully');
      
    } catch (err) {
      console.error('❌ Error playing music:', err);
      setErr('Failed to play music. Please try clicking the play button again.');
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
        
        // Try to start new audio
        if (audioRef.current) {
          audioRef.current.src = url;
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (playError) {
            setNeedsTap(true);
          }
        }
      } catch (err) {
        console.error('❌ Error regenerating audio:', err);
        setErr('Failed to change genre');
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

  return (
    <div className="container">
      <header className="header">
        <h1>🎵 Astradio - Daily Chart Music</h1>
        <p>Today&apos;s planetary positions converted to music</p>
        {loadTime && (
          <div className="load-time">
            ⚡ Loaded in {loadTime}ms
          </div>
        )}
      </header>

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <div>Loading chart and generating music…</div>
          {slow && !err && <p>Still preparing your soundtrack… one moment.</p>}
        </div>
      )}
      
      {needsTap && (
        <div className="play-prompt">
          <button onClick={playMusic} className="play-button-large">
            ▶️ Tap to Play Music
          </button>
        </div>
      )}
      
      {err && (
        <div className="error-message">
          ❌ {err}
          <button onClick={() => setErr(null)} className="error-close">×</button>
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
              {isPlaying && <p>🎵 Now playing...</p>}
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

        .load-time {
          color: #10b981;
          font-size: 14px;
          font-weight: 500;
        }

        .loading-indicator {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .play-prompt {
          text-align: center;
          padding: 20px;
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .play-button-large {
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 20px 40px;
          border-radius: 12px;
          font-size: 20px;
          cursor: pointer;
          font-weight: 600;
        }

        .play-button-large:hover {
          background: #0284c7;
        }

        .error-message {
          color: #ef4444;
          background: #fee2e2;
          border: 1px solid #fecaca;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #ef4444;
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
        playsInline
        crossOrigin="anonymous"
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio error:', e);
          setErr('Audio playback error. Please try again.');
        }}
      />
    </div>
  );
}