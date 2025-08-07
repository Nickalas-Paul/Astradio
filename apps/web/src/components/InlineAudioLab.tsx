import React, { useEffect } from 'react';
import Navigation from './Navigation';
import ChartDisplay from './ChartDisplay';
import UnifiedAudioControls from './UnifiedAudioControls';
import GenreDropdown from './GenreDropdown';
import BirthDataForm from './BirthDataForm';
import BlankChartWheel from './BlankChartWheel';
import GeneratedTextDisplay from './GeneratedTextDisplay';
import ChartLayoutWrapper from './ChartLayoutWrapper';
import AudioLabModeSwitcher from './AudioLabModeSwitcher';
import ChartMergeAnimation from './ChartMergeAnimation';
import SandboxMode from './SandboxMode';
import AudioTextGenerator from './AudioTextGenerator';
import { FormData } from '../types';
import { useGenre } from '../context/GenreContext';
import { buildSecureAPIUrl, clientRateLimiter } from '../lib/security';
import getToneAudioService from '../lib/toneAudioService';
import { useAudioLabStore } from '../stores/audioLabStore';

export default function InlineAudioLab() {
  const { selectedGenre, getRandomGenre } = useGenre();
  const {
    viewMode,
    setViewMode,
    activeLabMode,
    setActiveLabMode,
    charts,
    setCharts,
    audioStatus,
    setAudioStatus,
    isLoading,
    setIsLoading,
    error,
    setError,
    isMerging,
    setIsMerging,
    mergeComplete,
    setMergeComplete,
    showInterpretation,
    setShowInterpretation,
    sandboxPlanets,
    setSandboxPlanets,
    dailyChart,
    setDailyChart,
    activateLabMode,
    resetToDaily
  } = useAudioLabStore();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Load daily chart on component mount
  useEffect(() => {
    if (viewMode === 'daily') {
      loadDailyChart();
    }
  }, [viewMode]);

  // Set up Tone.js audio service callbacks
  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return;
    
    const toneAudioService = getToneAudioService();
    
    toneAudioService.onTimeUpdateCallback((time: number) => {
      setAudioStatus((prev: any) => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          currentTime: time
        } : null
      }));
    });

    toneAudioService.onErrorCallback((error: string) => {
      setAudioStatus((prev: any) => ({ ...prev, isLoading: false, error }));
    });

    // Handle user interaction to enable audio
    const handleUserInteraction = async () => {
      try {
        // Try to resume audio context on first user interaction
        if (typeof window !== 'undefined' && window.Tone) {
          await window.Tone.context.resume();
          console.log('🎵 Audio context resumed on user interaction');
        }
      } catch (error) {
        console.error('❌ Failed to resume audio context:', error);
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      toneAudioService.stop();
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [setAudioStatus]);

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
        setDailyChart(data.data.chart);
        setCharts((prev: any) => ({
          ...prev,
          chart2: data.data.chart
        }));
      }
    } catch (error) {
      console.error('Failed to load daily chart:', error);
      setError('Failed to load daily chart');
    }
  };

  const handleFormSubmit = async (formData: FormData, chartNumber: 1 | 2) => {
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
          mode: activeLabMode,
          genre: selectedGenre || getRandomGenre()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCharts((prev: any) => ({
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
    console.log('Genre changed to:', newGenre);
  };

  const handleStartMerge = () => {
    setIsMerging(true);
    setMergeComplete(false);
    setShowInterpretation(false);
  };

  const handleMergeComplete = () => {
    setMergeComplete(true);
    setTimeout(() => {
      handleOverlaySubmit();
    }, 500);
    
    setTimeout(() => {
      setShowInterpretation(true);
    }, 1500);
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

  const generateOverlayAudio = async (chart1: any, chart2: any, genre: string) => {
    if (!chart1 || !chart2) {
      throw new Error('Both charts are required for overlay audio');
    }

    setAudioStatus((prev: any) => ({ ...prev, isLoading: true, error: null }));

    try {
      const mergedChartData = {
        ...chart1,
        overlay_chart: chart2,
        mode: 'overlay',
        enhanced_metadata: {
          chart1_planets: Object.keys(chart1.planets || {}).length,
          chart2_planets: Object.keys(chart2.planets || {}).length,
          total_aspects: 0,
          harmony_score: 0.8, // Placeholder
          compatibility_rating: 0.7 // Placeholder
        }
      };

      const toneAudioService = getToneAudioService();
      const noteEvents = toneAudioService.generateNoteEvents(mergedChartData, genre);
      
      if (noteEvents.length === 0) {
        throw new Error('No musical events generated from overlay data');
      }

      const success = await toneAudioService.playNoteEvents(noteEvents);
      
      if (success) {
        setAudioStatus((prev: any) => ({ 
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
              harmony_score: 0.8,
              compatibility_rating: 0.7
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
      setAudioStatus((prev: any) => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
      throw error;
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
    setAudioStatus((prev: any) => ({ ...prev, isPlaying: false }));
  };

  const handlePause = () => {
    const toneAudioService = getToneAudioService();
    toneAudioService.pause();
    setAudioStatus((prev: any) => ({ ...prev, isPlaying: false }));
  };

  const handleSandboxPlanetsChange = (planets: any[]) => {
    setSandboxPlanets(planets);
  };

  const canGenerateOverlay = charts.chart1 && charts.chart2;

  // Daily View
  if (viewMode === 'daily') {
    return (
      <ChartLayoutWrapper
        title="Astradio"
        subtitle="Your daily cosmic soundtrack"
        genre={selectedGenre || 'ambient'}
        showGenre={true}
      >
        <Navigation />
        
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 font-sans">
              Your Daily Cosmic Soundtrack
            </h1>
            <p className="text-lg text-slate-300 mb-8 font-light">
              Experience today's astrological energy through music
            </p>
          </div>

          {/* Daily Chart Display */}
          {dailyChart ? (
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 max-w-4xl mx-auto mb-8 shadow-lg">
              <ChartDisplay chart={dailyChart} />
            </div>
          ) : (
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 max-w-4xl mx-auto mb-8 shadow-lg">
              <div className="text-center">
                <BlankChartWheel 
                  size={400}
                  message="Loading today's cosmic energy..."
                  showGrid={true}
                />
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="text-center mb-8">
            <button
              onClick={activateLabMode}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-semibold transition-colors text-lg shadow-lg"
            >
              Discover What Your Chart Sounds Like
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

          {error && (
            <div className="mt-6 p-6 bg-red-500/20 border border-red-500/30 rounded-xl max-w-4xl mx-auto">
              <p className="text-red-300 font-sans text-center">{error}</p>
            </div>
          )}
        </div>
      </ChartLayoutWrapper>
    );
  }

  // Lab View
  return (
    <ChartLayoutWrapper
      title="Audio Lab"
      subtitle="Your cosmic sound studio - generate, compare, and experiment with astrological audio"
      genre={selectedGenre || 'ambient'}
      showGenre={true}
    >
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        {/* Back to Daily Button */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={resetToDaily}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors shadow-md"
          >
            ← Back to Daily Chart
          </button>
        </div>

        {/* Mode Switcher */}
        <AudioLabModeSwitcher
          currentMode={activeLabMode as any}
          onModeChange={(mode) => setActiveLabMode(mode as any)}
          disabled={isLoading}
        />

        {/* Genre Selection */}
        <div className="mb-8 w-full max-w-md mx-auto">
          <GenreDropdown
            selectedGenre={selectedGenre || 'ambient'}
            onGenreChange={handleGenreChange}
            disabled={isLoading}
          />
        </div>

        {/* Audio Text Generator - Always visible in lab mode */}
        <AudioTextGenerator
          mode={activeLabMode as any}
          chartA={charts.chart1}
          chartB={charts.chart2}
          isVisible={viewMode === 'lab'}
        />

        {/* Generate Mode */}
        {activeLabMode === 'natal' && (
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 max-w-4xl mx-auto mb-8 shadow-lg">
            <h2 className="section-header text-2xl mb-6 font-sans">
              Generate Your Natal Chart
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
                  message="Enter your birth info to generate your natal chart"
                  showGrid={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Overlay Mode */}
        {activeLabMode === 'compare' && (
          <div className="space-y-8">
            {/* Single Chart Input */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 max-w-4xl mx-auto shadow-lg">
              <h2 className="section-header text-2xl mb-6 font-sans">
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

            {/* Chart Merge Animation */}
            {canGenerateOverlay && (
              <ChartMergeAnimation
                chart1={charts.chart1!}
                chart2={charts.chart2!}
                isMerging={isMerging}
                onMergeComplete={handleMergeComplete}
                onStartMerge={handleStartMerge}
              />
            )}
          </div>
        )}

        {/* Sandbox Mode */}
        {activeLabMode === 'sandbox' && (
          <SandboxMode onPlanetsChange={handleSandboxPlanetsChange} />
        )}

        {/* Unified Audio Controls */}
        {canGenerateOverlay && activeLabMode === 'compare' && (
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
            <p className="text-red-300 font-sans text-center">{error}</p>
          </div>
        )}

        {/* AI Interpretation */}
        {canGenerateOverlay && charts.chart1 && (showInterpretation || activeLabMode === 'compare') && (
          <div className="mt-12">
            <GeneratedTextDisplay 
              chart={charts.chart1}
              secondChart={charts.chart2}
              session={audioStatus.currentSession}
              mode="overlay"
            />
          </div>
        )}
      </div>
    </ChartLayoutWrapper>
  );
} 