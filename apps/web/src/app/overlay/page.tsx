'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import ChartDisplay from '../../components/ChartDisplay';
import UnifiedAudioControls from '../../components/UnifiedAudioControls';
import GenreDropdown from '../../components/GenreDropdown';
import BirthDataForm from '../../components/BirthDataForm';
import OverlayVisualizer from '../../components/OverlayVisualizer';
import BlankChartWheel from '../../components/BlankChartWheel';
import GeneratedTextDisplay from '../../components/GeneratedTextDisplay';
import DualChartMerge from '../../components/DualChartMerge';
import ChartLayoutWrapper from '../../components/ChartLayoutWrapper';
import { AstroChart, AudioStatus, FormData } from '../../types';
import { useGenre } from '../../context/GenreContext';
import { melodicGenerator } from '@astradio/audio-mappings';
import { buildSecureAPIUrl, clientRateLimiter } from '../../lib/security';
import getToneAudioService from '../../lib/toneAudioService';

interface DualChartData {
  chart1: AstroChart | null;
  chart2: AstroChart | null;
}

export default function OverlayPage() {
  const [charts, setCharts] = useState<DualChartData>({
    chart1: null,
    chart2: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    isPlaying: false,
    isLoading: false,
    currentSession: null,
    error: null
  });
  const [comparisonMode, setComparisonMode] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeComplete, setMergeComplete] = useState(false);
  const [showInterpretation, setShowInterpretation] = useState(false);

  const { selectedGenre, getRandomGenre } = useGenre();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Load daily chart on component mount
  useEffect(() => {
    loadDailyChart();
  }, []);

  // Set up Tone.js audio service callbacks
  useEffect(() => {
    const toneAudioService = getToneAudioService();
    
    toneAudioService.onTimeUpdateCallback((time: number) => {
      setAudioStatus(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          currentTime: time
        } : null
      }));
    });

    toneAudioService.onErrorCallback((error: string) => {
      setAudioStatus(prev => ({ ...prev, isLoading: false, error }));
    });

    return () => {
      toneAudioService.stop();
    };
  }, []);

  const loadDailyChart = async () => {
    try {
      if (!clientRateLimiter.canMakeRequest('daily')) {
        console.warn('Rate limit exceeded for daily chart request');
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const apiUrl = buildSecureAPIUrl(`daily/${today}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCharts(prev => ({
          ...prev,
          chart2: data.data.chart
        }));
      }
    } catch (error) {
      console.error('Failed to load daily chart:', error);
      setError('Failed to load daily chart');
    }
  };

  const handleFormSubmit = async (formData: any, chartNumber: 1 | 2) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/charts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birth_data: formData,
          mode: 'overlay',
          genre: selectedGenre || getRandomGenre()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCharts(prev => ({
          ...prev,
          [`chart${chartNumber}`]: data.data.chart
        }));
      } else {
        throw new Error(data.error || 'Failed to generate chart');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate chart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreChange = (newGenre: string) => {
    // Update genre context
    // Note: This would need to be implemented in the genre context
    console.log('Genre changed to:', newGenre);
  };

  const handleStartMerge = () => {
    setIsMerging(true);
    setMergeComplete(false);
    setShowInterpretation(false);
  };

  const handleMergeComplete = () => {
    setMergeComplete(true);
    // Start audio generation after merge completes
    setTimeout(() => {
      handleOverlaySubmit();
    }, 500);
    
    // Show interpretation after audio starts
    setTimeout(() => {
      setShowInterpretation(true);
    }, 1500);
  };

  const generateOverlayAudio = async (chart1: AstroChart, chart2: AstroChart, genre: string) => {
    if (!chart1 || !chart2) {
      throw new Error('Both charts are required for overlay audio');
    }

    setAudioStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create a merged chart data structure for overlay with enhanced processing
      const mergedChartData = {
        ...chart1,
        overlay_chart: chart2,
        mode: 'overlay',
        // Add enhanced metadata for better audio generation
        enhanced_metadata: {
          chart1_planets: Object.keys(chart1.planets || {}).length,
          chart2_planets: Object.keys(chart2.planets || {}).length,
          total_aspects: 0, // Aspects not available in current chart structure
          harmony_score: calculateHarmonyScore(chart1, chart2),
          compatibility_rating: calculateCompatibilityRating(chart1, chart2)
        }
      };

      // Generate note events for the overlay with enhanced processing
      const toneAudioService = getToneAudioService();
      const noteEvents = toneAudioService.generateNoteEvents(mergedChartData, genre);
      
      if (noteEvents.length === 0) {
        throw new Error('No musical events generated from overlay data');
      }

      // Apply real-time audio processing
      const processedEvents = await applyRealTimeProcessing(noteEvents, genre);

      // Play the overlay note events with enhanced configuration
      const success = await toneAudioService.playNoteEvents(processedEvents);
      
      if (success) {
        setAudioStatus(prev => ({ 
          ...prev, 
          isLoading: false,
          isPlaying: true,
          currentSession: {
            id: `overlay_session_${Date.now()}`,
            chartId: `${chart1.metadata?.birth_datetime || 'chart1'}_${chart2.metadata?.birth_datetime || 'chart2'}`,
            configuration: {
              mode: 'overlay',
              duration: toneAudioService.getDuration(),
              genre: genre as any,
              harmony_score: mergedChartData.enhanced_metadata.harmony_score,
              compatibility_rating: mergedChartData.enhanced_metadata.compatibility_rating
            },
            isPlaying: true,
            currentHouse: 1,
            duration: toneAudioService.getDuration(),
            genre: genre as any
          }
        }));
        console.log('Overlay audio generated and playing successfully');
      } else {
        throw new Error('Failed to start overlay playback');
      }
    } catch (error) {
      console.error('Failed to generate overlay audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate overlay audio';
      setAudioStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
      throw error;
    }
  };

  // Enhanced harmony calculation
  const calculateHarmonyScore = (chart1: AstroChart, chart2: AstroChart): number => {
    const planets1 = Object.keys(chart1.planets || {});
    const planets2 = Object.keys(chart2.planets || {});
    
    // Calculate harmonic relationships between charts
    let harmonyScore = 0;
    let totalComparisons = 0;
    
    planets1.forEach(planet1 => {
      planets2.forEach(planet2 => {
        if (planet1 === planet2) {
          const pos1 = chart1.planets[planet1];
          const pos2 = chart2.planets[planet2];
          
          // Calculate harmonic distance
          const distance = Math.abs(pos1.longitude - pos2.longitude);
          const harmonicValue = calculateHarmonicValue(distance);
          harmonyScore += harmonicValue;
          totalComparisons++;
        }
      });
    });
    
    return totalComparisons > 0 ? harmonyScore / totalComparisons : 0;
  };

  // Calculate harmonic value based on astrological aspects
  const calculateHarmonicValue = (distance: number): number => {
    const aspects = [
      { angle: 0, value: 1.0 },    // Conjunction
      { angle: 60, value: 0.8 },   // Sextile
      { angle: 90, value: 0.3 },   // Square
      { angle: 120, value: 0.9 },  // Trine
      { angle: 180, value: 0.5 }   // Opposition
    ];
    
    const tolerance = 8; // Orb tolerance
    let bestValue = 0;
    
    aspects.forEach(aspect => {
      const aspectDistance = Math.abs(distance - aspect.angle);
      if (aspectDistance <= tolerance) {
        const value = aspect.value * (1 - aspectDistance / tolerance);
        bestValue = Math.max(bestValue, value);
      }
    });
    
    return bestValue;
  };

  // Calculate compatibility rating
  const calculateCompatibilityRating = (chart1: AstroChart, chart2: AstroChart): number => {
    const harmonyScore = calculateHarmonyScore(chart1, chart2);
    const elementCompatibility = calculateElementCompatibility(chart1, chart2);
    const houseCompatibility = calculateHouseCompatibility(chart1, chart2);
    
    return (harmonyScore * 0.5 + elementCompatibility * 0.3 + houseCompatibility * 0.2);
  };

  // Calculate element compatibility
  const calculateElementCompatibility = (chart1: AstroChart, chart2: AstroChart): number => {
    const elements = ['Fire', 'Earth', 'Air', 'Water'];
    const elementCounts1 = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const elementCounts2 = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    
    // Count elements in both charts
    Object.values(chart1.planets || {}).forEach(planet => {
      if (planet.sign?.element) {
        elementCounts1[planet.sign.element as keyof typeof elementCounts1]++;
      }
    });
    
    Object.values(chart2.planets || {}).forEach(planet => {
      if (planet.sign?.element) {
        elementCounts2[planet.sign.element as keyof typeof elementCounts2]++;
      }
    });
    
    // Calculate compatibility based on element harmony
    let compatibility = 0;
    elements.forEach(element => {
      const count1 = elementCounts1[element as keyof typeof elementCounts1];
      const count2 = elementCounts2[element as keyof typeof elementCounts2];
      compatibility += Math.min(count1, count2) * 0.25; // Same elements are harmonious
    });
    
    return Math.min(compatibility, 1);
  };

  // Calculate house compatibility
  const calculateHouseCompatibility = (chart1: AstroChart, chart2: AstroChart): number => {
    const houses1 = Object.values(chart1.planets || {}).map(p => p.house);
    const houses2 = Object.values(chart2.planets || {}).map(p => p.house);
    
    let compatibility = 0;
    let comparisons = 0;
    
    houses1.forEach(house1 => {
      houses2.forEach(house2 => {
        const houseDistance = Math.abs(house1 - house2);
        // Houses in harmony: 1-7, 2-8, 3-9, 4-10, 5-11, 6-12
        const isHarmonious = houseDistance === 6 || houseDistance === 0;
        compatibility += isHarmonious ? 1 : 0.3;
        comparisons++;
      });
    });
    
    return comparisons > 0 ? compatibility / comparisons : 0;
  };

  // Apply real-time audio processing
  const applyRealTimeProcessing = async (noteEvents: any[], genre: string): Promise<any[]> => {
    // Enhanced processing based on genre and chart characteristics
    const processedEvents = noteEvents.map(event => {
      // Apply genre-specific enhancements
      const enhancedEvent = { ...event };
      
      switch (genre) {
        case 'ambient':
          enhancedEvent.velocity = Math.min(event.velocity * 0.8, 0.7);
          enhancedEvent.duration = event.duration * 1.2;
          break;
        case 'techno':
          enhancedEvent.velocity = Math.min(event.velocity * 1.2, 0.9);
          enhancedEvent.duration = event.duration * 0.8;
          break;
        case 'classical':
          enhancedEvent.velocity = Math.min(event.velocity * 1.1, 0.8);
          enhancedEvent.duration = event.duration * 1.1;
          break;
        default:
          // Default processing
          break;
      }
      
      return enhancedEvent;
    });
    
    return processedEvents;
  };

  const handleOverlaySubmit = async () => {
    if (!charts.chart1 || !charts.chart2) {
      setError('Both charts must be generated before creating overlay');
      return;
    }

    try {
      const genre = selectedGenre || getRandomGenre();
      await generateOverlayAudio(charts.chart1, charts.chart2, genre);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate overlay audio');
    }
  };

  const handlePlay = async () => {
    if (!charts.chart1 || !charts.chart2) {
      setError('Both charts must be generated before creating overlay');
      return;
    }
    
    const genre = selectedGenre || getRandomGenre();
    await generateOverlayAudio(charts.chart1, charts.chart2, genre);
  };

  const handleStop = () => {
    const toneAudioService = getToneAudioService();
    toneAudioService.stop();
    setAudioStatus(prev => ({ ...prev, isPlaying: false }));
  };

  const handlePause = () => {
    const toneAudioService = getToneAudioService();
    toneAudioService.pause();
    setAudioStatus(prev => ({ ...prev, isPlaying: false }));
  };

  const canGenerateOverlay = charts.chart1 && charts.chart2;

  return (
    <ChartLayoutWrapper
      title="Astrological Overlay"
      subtitle="Merge your natal chart with today's cosmic energy to create harmonious overlays"
      genre={selectedGenre || 'ambient'}
      showGenre={true}
    >
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-lg text-gray-300 mb-8 leading-relaxed tracking-wide font-mystical max-w-3xl mx-auto">
            Compare two astrological charts and generate harmonious audio compositions
          </p>
        </div>

        {/* Comparison Mode Toggle */}
        <div className="text-center mb-8">
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 font-mystical tracking-wide ${
              comparisonMode
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cosmic-glow'
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}
          >
            {comparisonMode ? 'Manual Comparison Mode' : 'Default Mode (Your Chart + Daily)'}
          </button>
        </div>

        {/* Genre Selection */}
        <div className="mb-8 w-full max-w-md mx-auto">
          <GenreDropdown
            selectedGenre={selectedGenre || 'ambient'}
            onGenreChange={handleGenreChange}
            disabled={isLoading}
          />
        </div>

        {/* Single Chart Input (Default Mode) */}
        {!comparisonMode && (
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 max-w-4xl mx-auto mb-8">
            <h2 className="section-header text-2xl">
              Your Natal Chart
            </h2>
            <BirthDataForm 
              onSubmit={(data) => handleFormSubmit(data, 1)} 
              isLoading={isLoading} 
            />
            {charts.chart1 ? (
              <div className="mt-8">
                <ChartDisplay chart={charts.chart1} />
              </div>
            ) : (
              <div className="mt-8 text-center">
                <BlankChartWheel 
                  size={300}
                  message="Enter your birth info to compare with today's chart"
                  showGrid={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Dual Chart Comparison (Manual Mode) */}
        {comparisonMode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Chart 1 */}
            <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20">
              <h2 className="section-header text-xl">
                First Chart
              </h2>
              <BirthDataForm 
                onSubmit={(data) => handleFormSubmit(data, 1)} 
                isLoading={isLoading} 
              />
              {charts.chart1 ? (
                <div className="mt-6">
                  <ChartDisplay chart={charts.chart1} />
                </div>
              ) : (
                <div className="mt-6 text-center">
                  <BlankChartWheel 
                    size={250}
                    message="Enter first chart"
                    showGrid={true}
                  />
                </div>
              )}
            </div>

            {/* Chart 2 */}
            <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20">
              <h2 className="section-header text-xl">
                Second Chart
              </h2>
              <BirthDataForm 
                onSubmit={(data) => handleFormSubmit(data, 2)} 
                isLoading={isLoading} 
              />
              {charts.chart2 ? (
                <div className="mt-6">
                  <ChartDisplay chart={charts.chart2} />
                </div>
              ) : (
                <div className="mt-6 text-center">
                  <BlankChartWheel 
                    size={250}
                    message="Enter second chart"
                    showGrid={true}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chart Merge Animation */}
        {canGenerateOverlay && !comparisonMode && (
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 max-w-6xl mx-auto mb-8">
            <h2 className="section-header text-2xl">
              Chart Merge
            </h2>
            <DualChartMerge
              chart1={charts.chart1}
              chart2={charts.chart2}
              onMergeComplete={handleMergeComplete}
              isMerging={isMerging}
              onStartMerge={handleStartMerge}
            />
          </div>
        )}

        {/* Unified Audio Controls */}
        {canGenerateOverlay && (
          <div className="mb-8 w-full max-w-lg mx-auto">
            <UnifiedAudioControls
              chartData={charts.chart1!}
              genre={selectedGenre || 'ambient'}
              mode="overlay"
              onPlay={handlePlay}
              onStop={handleStop}
              onPause={handlePause}
              showExport={true}
              audioStatus={audioStatus}
            />
          </div>
        )}

        {error && (
          <div className="mt-6 p-6 bg-red-500/20 border border-red-500/30 rounded-xl max-w-4xl mx-auto">
            <p className="text-red-300 font-mystical text-center">{error}</p>
          </div>
        )}

        {/* AI Interpretation */}
        {canGenerateOverlay && charts.chart1 && (showInterpretation || comparisonMode) && (
          <div className="mt-12">
            <GeneratedTextDisplay 
              chart={charts.chart1}
              secondChart={charts.chart2}
              session={audioStatus.currentSession}
              mode="overlay"
            />
          </div>
        )}

        {/* Audio Visualizer */}
        <div className="mt-12">
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20">
            <h2 className="section-header text-2xl">
              Dual Chart Visualization
            </h2>
            <OverlayVisualizer 
              session={audioStatus.currentSession}
              isPlaying={audioStatus.isPlaying}
              chart1={charts.chart1}
              chart2={charts.chart2}
            />
          </div>
        </div>
      </div>
    </ChartLayoutWrapper>
  );
} 