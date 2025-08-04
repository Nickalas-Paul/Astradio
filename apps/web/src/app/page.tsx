'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useGenre } from '../context/GenreContext';
import UnifiedAstrologicalWheel from '../components/UnifiedAstrologicalWheel';
import UnifiedAudioControls from '../components/UnifiedAudioControls';
import ChartLayoutWrapper from '../components/ChartLayoutWrapper';
import GenreDropdown from '../components/GenreDropdown';
import DebugOverlay from '../components/DebugOverlay';
import toneAudioService from '../lib/toneAudioService';

export default function HomePage() {
  const router = useRouter();
  const { selectedGenre, setSelectedGenre } = useGenre();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentHouse, setCurrentHouse] = useState(1);
  const [houseHighlight, setHouseHighlight] = useState(1);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [wheelSize, setWheelSize] = useState(400);
  const [dailyChart, setDailyChart] = useState<any>(null);
  const [audioStatus, setAudioStatus] = useState({
    isPlaying: false,
    isLoading: false,
    currentSession: null as any,
    error: null as string | null
  });
  const [isClient, setIsClient] = useState(false);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    audioInitTime: 0,
    chartRenderTime: 0
  });
  const loadStartTime = useRef<number>(0);

  // Helper functions for planet data
  const getPlanetSymbol = (name: string) => {
    const symbols: { [key: string]: string } = {
      'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
      'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇'
    };
    return symbols[name] || '•';
  };

  const getPlanetColor = (name: string) => {
    const colors: { [key: string]: string } = {
      'Sun': '#fbbf24', 'Moon': '#a3a3a3', 'Mercury': '#34d399', 'Venus': '#f87171', 'Mars': '#ef4444',
      'Jupiter': '#8b5cf6', 'Saturn': '#64748b', 'Uranus': '#06b6d4', 'Neptune': '#3b82f6', 'Pluto': '#1f2937'
    };
    return colors[name] || '#ffffff';
  };

  // Client-side initialization to prevent hydration mismatch
  useEffect(() => {
    loadStartTime.current = performance.now();
    setIsClient(true);
    
    // Calculate wheel size based on screen width
    const calculateWheelSize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) { // Mobile
        return Math.min(screenWidth - 48, 320); // Full width minus padding
      } else if (screenWidth < 1024) { // Tablet
        return 450;
      } else { // Desktop
        return 550;
      }
    };
    
    setWheelSize(calculateWheelSize());
    
    // Load today's chart data
    loadDailyChart();
    
    // Track performance
    const loadTime = performance.now() - loadStartTime.current;
    setPerformanceMetrics(prev => ({ ...prev, loadTime: Math.round(loadTime) }));
    
    // Enable debug overlay in development
    if (process.env.NODE_ENV === 'development') {
      setShowDebugOverlay(true);
    }
  }, []);

  // House highlighting effect when playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setHouseHighlight(prev => prev === 12 ? 1 : prev + 1);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    } else {
      setHouseHighlight(1); // Reset to house 1 when not playing
    }
  }, [isPlaying]);

  const loadDailyChart = async () => {
    const chartStartTime = performance.now();
    setIsLoading(true);
    setAudioError(null);
    
    try {
      // FORCE TODAY'S DATE - NO CACHING, NO FALLBACKS
      const today = new Date().toISOString().split('T')[0];
      console.log('🎵 Loading daily chart for date:', today);
      
      // 1. FETCH REAL CHART DATA
      const chartResponse = await fetch(`/api/daily/${today}`);
      console.log('🎵 Chart response status:', chartResponse.status);
      
      if (!chartResponse.ok) {
        throw new Error(`Chart API failed: ${chartResponse.status} ${chartResponse.statusText}`);
      }
      
      const chartData = await chartResponse.json();
      console.log('🎵 Chart data received:', chartData.success ? 'SUCCESS' : 'FAILED');
      
      if (!chartData.success) {
        throw new Error(chartData.error || 'Chart generation failed');
      }
      
      const dailyChart = chartData.data.chart;
      
      // Convert planets object to array format expected by the wheel component
      const planetsArray = Object.entries(dailyChart.planets || {}).map(([name, planet]: [string, any]) => ({
        id: name.toLowerCase(),
        name: name,
        symbol: getPlanetSymbol(name),
        angle: planet.longitude || 0,
        color: getPlanetColor(name),
        house: planet.house || 1,
        sign: planet.sign?.name || 'Aries',
        degree: Math.floor((planet.longitude || 0) % 30)
      }));
      
      const processedChart = {
        ...dailyChart,
        planets: planetsArray,
        aspects: dailyChart.aspects || []
      };
      
      setDailyChart(processedChart);
      console.log('🎵 Chart processed with', planetsArray.length, 'planets');
      
      // Track chart rendering performance
      const chartRenderTime = performance.now() - chartStartTime;
      setPerformanceMetrics(prev => ({ ...prev, chartRenderTime: Math.round(chartRenderTime) }));
      
      // 2. SET UP TRACK INFO FOR TONE.JS
      const genre = selectedGenre || 'ambient';
      const dailyMusic = {
        title: `Today's Cosmic Symphony - ${genre}`,
        chart: processedChart,
        genre: genre
      };
      
      setCurrentTrack(dailyMusic);
      
      // 3. GENERATE INTERPRETATION
      const dailyInterpretation = generateDailyInterpretation(processedChart);
      setInterpretation(dailyInterpretation);
      
      setAudioError(null);
      
      // 4. AUTO-PLAY TODAY'S CHART (optional - can be disabled)
      // Uncomment the next line to enable auto-play on landing page
      // await autoPlayDailyChart(processedChart, genre);
      
    } catch (error) {
      console.error('❌ Daily chart loading failed:', error);
      setAudioError(`Failed to load daily chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // NO FALLBACK DATA - FAIL HARD
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-play functionality for landing page
  const autoPlayDailyChart = async (chartData: any, genre: string) => {
    try {
      console.log('🎵 Auto-playing today\'s chart...');
      
      // Generate note events
      const events = toneAudioService.generateNoteEvents(chartData, genre);
      console.log('🎵 Generated', events.length, 'note events for auto-play');
      
      // Play the events
      const success = await toneAudioService.playNoteEvents(events);
      
      if (success) {
        console.log('🎵 Auto-play started successfully');
        setIsPlaying(true);
        setAudioStatus({
          isPlaying: true,
          isLoading: false,
          currentSession: { id: Date.now().toString() },
          error: null
        });
      } else {
        console.log('🎵 Auto-play failed - user can manually start');
      }
    } catch (error) {
      console.error('❌ Auto-play failed:', error);
      // Don't show error to user for auto-play failures
    }
  };

  const generateDailyInterpretation = (chart: any) => {
    // Generate AI interpretation based on real chart data
    const planetNames = chart.planets?.map((p: any) => p.name) || [];
    const aspectCount = chart.aspects?.length || 0;
    
    const interpretations = [
      `Today's celestial alignment features ${planetNames.join(', ')} creating a dynamic cosmic symphony. With ${aspectCount} planetary aspects, the energy flows through multiple houses, creating a rich tapestry of musical elements that reflect today's astrological energy.`,
      `The current planetary positions create a unique harmonic resonance. ${planetNames.slice(0, 3).join(', ')} dominate the chart, bringing their distinct qualities to today's composition. This creates a musical landscape that speaks to the day's cosmic journey.`,
      `Today's planetary configuration emphasizes ${chart.planets?.[0]?.sign || 'cosmic'} energy, with ${aspectCount} aspects creating a complex interplay of musical themes. The celestial bodies work together to create an otherworldly atmosphere.`,
      `The placement of planets across multiple houses creates a rich tapestry of musical elements, from the structured rhythms of earth signs to the flowing melodies of water elements. Today's cosmic symphony reflects the unique energy of this celestial moment.`
    ];
    
    return interpretations[Math.floor(Math.random() * interpretations.length)];
  };

  const handlePlay = async () => {
    if (!dailyChart) return;
    
    try {
      setIsPlaying(true);
      setAudioError(null);
      setAudioStatus({
        isPlaying: false,
        isLoading: true,
        currentSession: null,
        error: null
      });
      
      // Generate and play audio using the tone audio service
      const events = toneAudioService.generateNoteEvents(dailyChart, selectedGenre || 'ambient');
      const success = await toneAudioService.playNoteEvents(events);
      
      if (success) {
        setAudioStatus({
          isPlaying: true,
          isLoading: false,
          currentSession: { id: Date.now().toString() },
          error: null
        });
      } else {
        setAudioError('Failed to start audio playback');
        setIsPlaying(false);
        setAudioStatus({
          isPlaying: false,
          isLoading: false,
          currentSession: null,
          error: 'Failed to start audio playback'
        });
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      setAudioError('Audio playback failed');
      setIsPlaying(false);
      setAudioStatus({
        isPlaying: false,
        isLoading: false,
        currentSession: null,
        error: 'Audio playback failed'
      });
    }
  };

  const handleStop = () => {
    toneAudioService.stop();
    setIsPlaying(false);
    setAudioStatus({
      isPlaying: false,
      isLoading: false,
      currentSession: null,
      error: null
    });
  };

  const handlePause = () => {
    toneAudioService.pause();
    setIsPlaying(false);
    setAudioStatus({
      isPlaying: false,
      isLoading: false,
      currentSession: null,
      error: null
    });
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    toneAudioService.setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCTAClick = () => {
    router.push('/chart');
  };

  const handleGenreChange = (newGenre: string) => {
    setSelectedGenre(newGenre as any);
    // Regenerate chart with new genre
    loadDailyChart();
  };

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <ChartLayoutWrapper
        title="ASTRADIO"
        subtitle="Today's soundtrack:"
        genre="ambient"
        showGenre={true}
      >
        <Navigation />
        <div className="container mx-auto px-6 py-12">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 content-center">
            <div className="text-center mb-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="text-gray-400 font-mystical mt-2">Loading cosmic symphony...</p>
            </div>
          </div>
        </div>
      </ChartLayoutWrapper>
    );
  }

  return (
    <ChartLayoutWrapper
      title="ASTRADIO"
      subtitle="Today's soundtrack:"
      genre={selectedGenre || 'ambient'}
      showGenre={true}
    >
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        {/* Logo and Title Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 content-center">
          {/* Astradio Logo and Name */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded flex items-center justify-center mr-4">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <h1 className="text-6xl font-bold glow-text leading-tight tracking-tight gradient-text-cosmic cosmic-glow-text font-mystical">
                ASTRADIO
              </h1>
            </div>
          </div>

          {/* Today's Soundtrack Section */}
          <div className="mb-12 w-full max-w-4xl">
            {/* Daily Astrological Wheel */}
            <div className="glass-morphism-strong rounded-3xl p-6 border border-emerald-500/20 mx-auto">
              <div className="flex justify-center mb-6 content-center">
                {dailyChart && (
                  <div className="chart-container content-center" style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
                    <UnifiedAstrologicalWheel
                      planets={dailyChart.planets || []}
                      aspects={dailyChart.aspects || []}
                      size={wheelSize}
                      isPlaying={isPlaying}
                      currentHouse={houseHighlight}
                      showHighlight={isPlaying}
                    />
                  </div>
                )}
              </div>
              
              {/* Chart Info */}
              <div className="text-center">
                <h4 className="text-xl font-semibold mb-4 font-mystical text-emerald-300">
                  Today's Astrological Energy
                </h4>
                <p className="text-gray-300 leading-relaxed tracking-wide font-mystical">
                  The current planetary positions create a unique cosmic symphony. Explore how today's celestial alignment influences your musical composition.
                </p>
              </div>
            </div>
          </div>

          {/* Genre Selection */}
          <div className="mb-8 w-full max-w-md">
            <GenreDropdown
              selectedGenre={selectedGenre || 'ambient'}
              onGenreChange={handleGenreChange}
              disabled={isLoading}
            />
          </div>

          {/* Unified Audio Controls */}
          {!isLoading && currentTrack && dailyChart && (
            <div className="mb-8 w-full max-w-lg">
              <UnifiedAudioControls
                chartData={dailyChart}
                genre={selectedGenre || 'ambient'}
                mode="moments"
                onPlay={handlePlay}
                onStop={handleStop}
                onPause={handlePause}
                onVolumeChange={handleVolumeChange}
                audioStatus={audioStatus}
                showExport={true}
              />
            </div>
          )}

          {/* Daily Interpretation */}
          {!isLoading && interpretation && (
            <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20 max-w-2xl mx-auto mb-8">
              <h4 className="text-lg font-semibold mb-4 font-mystical text-emerald-300 text-center">
                Today's Cosmic Interpretation
              </h4>
              <p className="text-gray-300 leading-relaxed tracking-wide font-mystical text-center">
                {interpretation}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center mb-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="text-gray-400 font-mystical mt-2">Loading today's cosmic symphony...</p>
            </div>
          )}

          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleCTAClick}
              className="px-8 py-4 btn-cosmic rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-mystical text-base tracking-wide"
            >
              Find out what your birth chart sounds like
            </button>
            <button 
              onClick={() => router.push('/audio-lab')}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-mystical text-base tracking-wide border border-purple-400/30"
            >
              🎛️ Try the Audio Lab
            </button>
          </div>
        </div>

        {/* Navigation at Bottom */}
        <div className="mt-auto">
          <Navigation />
        </div>
      </div>
      
      {/* Debug Overlay (Development Only) */}
      <DebugOverlay
        chartData={dailyChart}
        audioStatus={audioStatus}
        performanceMetrics={performanceMetrics}
        isVisible={showDebugOverlay}
        onToggle={() => setShowDebugOverlay(!showDebugOverlay)}
      />
    </ChartLayoutWrapper>
  );
} 