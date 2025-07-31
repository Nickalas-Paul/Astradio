'use client';

import React, { useState, useEffect } from 'react';
import BirthDataForm from '../../components/BirthDataForm';
import ChartDisplay from '../../components/ChartDisplay';
import UnifiedAudioControls from '../../components/UnifiedAudioControls';
import Navigation from '../../components/Navigation';
import UnifiedAstrologicalWheel from '../../components/UnifiedAstrologicalWheel';
import BlankChartWheel from '../../components/BlankChartWheel';
import GeneratedTextDisplay from '../../components/GeneratedTextDisplay';
import ChartLayoutWrapper from '../../components/ChartLayoutWrapper';
import GenreDropdown from '../../components/GenreDropdown';
import { FormData, AstroChart, AudioStatus } from '../../types';
import { useGenre } from '../../context/GenreContext';
import toneAudioService from '../../lib/toneAudioService';

export default function ChartPage() {
  const [chart, setChart] = useState<AstroChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    isPlaying: false,
    isLoading: false,
    currentSession: null,
    error: null
  });
  const [isMuted, setIsMuted] = useState(false);
  const [currentHouse, setCurrentHouse] = useState(1);
  const [volume, setVolume] = useState(0.7);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [wheelSize, setWheelSize] = useState(400);

  const { selectedGenre, getRandomGenre } = useGenre();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Initialize audio service and calculate wheel size
  useEffect(() => {
    const calculateWheelSize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) { // Mobile
        return Math.min(screenWidth - 48, 320);
      } else if (screenWidth < 1024) { // Tablet
        return 450;
      } else { // Desktop
        return 550;
      }
    };
    
    setWheelSize(calculateWheelSize());

    // Set up Tone.js audio service callbacks
    toneAudioService.onTimeUpdateCallback((time) => {
      // Update audio status with current time
      setAudioStatus(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          currentTime: time
        } : null
      }));
    });

    toneAudioService.onErrorCallback((error) => {
      setAudioError(error);
      setAudioStatus(prev => ({ ...prev, isLoading: false, error }));
    });

    return () => {
      toneAudioService.stop();
    };
  }, []);

  const handleFormSubmit = async (formData: FormData) => {
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
          mode: 'sequential',
          genre: selectedGenre || getRandomGenre()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setChart(data.data.chart);
        
        // Generate audio immediately with Tone.js
        const genre = selectedGenre || getRandomGenre();
        await generateToneAudio(data.data.chart, genre);
      } else {
        throw new Error(data.error || 'Failed to generate chart');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate chart');
    } finally {
      setIsLoading(false);
    }
  };

  const generateToneAudio = async (chartData: AstroChart, genre: string) => {
    if (!chartData) return;

    setAudioStatus(prev => ({ ...prev, isLoading: true, error: null }));
    setAudioError(null);

    try {
      // Generate note events using Tone.js
      const noteEvents = toneAudioService.generateNoteEvents(chartData, genre);
      
      if (noteEvents.length === 0) {
        throw new Error('No musical events generated from chart data');
      }

      // Play the note events
      const success = await toneAudioService.playNoteEvents(noteEvents);
      
      if (success) {
        setAudioStatus(prev => ({ 
          ...prev, 
          isLoading: false,
          currentSession: {
            id: `session_${Date.now()}`,
            chartId: chartData.metadata?.birth_datetime || 'personal_chart',
            configuration: {
              mode: 'sequential',
              duration: toneAudioService.getDuration(),
              genre: genre as any
            },
            isPlaying: true,
            currentHouse: 1,
            duration: toneAudioService.getDuration(),
            genre: genre as any
          }
        }));
        console.log('Tone.js audio generated and playing successfully');
      } else {
        throw new Error('Failed to start Tone.js playback');
      }
    } catch (error) {
      console.error('Failed to generate Tone.js audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio';
      setAudioError(errorMessage);
      setAudioStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
    }
  };

  const handlePlay = async () => {
    if (!chart) {
      setAudioError('No chart data available. Please generate a chart first.');
      return;
    }
    
    const genre = selectedGenre || getRandomGenre();
    await generateToneAudio(chart, genre);
  };

  const handleStop = () => {
    toneAudioService.stop();
    setAudioStatus(prev => ({ ...prev, isPlaying: false }));
  };

  const handlePause = () => {
    toneAudioService.pause();
    setAudioStatus(prev => ({ ...prev, isPlaying: false }));
  };

  const handleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    toneAudioService.setVolume(newMutedState ? 0 : volume);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (!isMuted) {
      toneAudioService.setVolume(newVolume);
    }
  };

  const handleHouseClick = (houseNumber: number) => {
    // For Tone.js, we can't seek to specific times easily
    // Instead, we can highlight the house visually
    setCurrentHouse(houseNumber);
  };

  const handleGenreChange = async (genre: string) => {
    if (chart) {
      await generateToneAudio(chart, genre);
    }
  };

  return (
    <ChartLayoutWrapper
      title="Your Astrological Chart"
      subtitle="Discover your cosmic blueprint"
      genre={selectedGenre || 'ambient'}
      showGenre={true}
    >
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-lg text-gray-300 mb-8 leading-relaxed tracking-wide font-mystical max-w-3xl mx-auto">
            Enter your birth details to generate your personalized astrological chart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Birth Data Form */}
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 cosmic-glow">
            <h3 className="section-header text-xl">
              Birth Information
            </h3>
            <BirthDataForm 
              onSubmit={handleFormSubmit} 
              isLoading={isLoading} 
            />
            
            {error && (
              <div className="mt-6 p-6 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-300 font-mystical text-center">{error}</p>
              </div>
            )}
          </div>

          {/* Chart Display */}
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 cosmic-glow">
            <h3 className="section-header text-xl">
              Chart Visualization
            </h3>
            
            {chart ? (
              <>
                <div className="mb-8 flex justify-center">
                  <div className="chart-container" style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
                    <UnifiedAstrologicalWheel
                      planets={Object.entries(chart.planets).map(([name, data]) => ({
                        name,
                        symbol: name, // Will be mapped to proper symbol in component
                        angle: data.longitude,
                        color: '#10b981', // Default color, can be enhanced
                        house: data.house,
                        sign: data.sign.name,
                        degree: data.sign.degree
                      }))}
                      aspects={[]} // Aspects not available in current chart structure
                      size={wheelSize}
                      isPlaying={audioStatus.isPlaying}
                      currentHouse={currentHouse}
                      showHighlight={true}
                      onHouseClick={handleHouseClick}
                      onGenreChange={handleGenreChange}
                    />
                  </div>
                </div>
                <ChartDisplay chart={chart} />
              </>
            ) : (
              <div className="text-center py-8">
                <BlankChartWheel 
                  size={wheelSize}
                  message="Enter your birth info to hear your chart"
                  showGrid={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Genre Selection */}
        {chart && (
          <div className="mt-8 w-full max-w-md mx-auto">
            <GenreDropdown
              selectedGenre={selectedGenre || 'ambient'}
              onGenreChange={handleGenreChange}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Unified Audio Controls */}
        {chart && (
          <div className="mt-8 w-full max-w-lg mx-auto">
            <UnifiedAudioControls
              chartData={chart}
              genre={selectedGenre || 'ambient'}
              mode="moments"
              onPlay={handlePlay}
              onStop={handleStop}
              onPause={handlePause}
              showExport={true}
            />
          </div>
        )}

        {/* Chart Details */}
        {chart && (
          <div className="mt-12 space-y-8">
            <div className="glass-morphism rounded-3xl p-8 border border-emerald-500/20">
              <h3 className="section-header text-xl">
                Planetary Positions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Object.entries(chart.planets).map(([planet, data]) => (
                  <div key={planet} className="text-center p-4 glass-morphism-strong rounded-xl border border-emerald-500/10">
                    <div className="text-sm font-semibold text-emerald-300 leading-relaxed tracking-wide font-mystical">{planet}</div>
                    <div className="text-xs text-gray-400 leading-relaxed tracking-wide font-mystical">{data.sign.name}</div>
                    <div className="text-xs text-gray-400 leading-relaxed tracking-wide font-mystical">House {data.house}</div>
                    {data.retrograde && (
                      <div className="text-xs text-orange-400 leading-relaxed tracking-wide font-mystical">Retrograde</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* AI Interpretation */}
            <GeneratedTextDisplay 
              chart={chart}
              session={audioStatus.currentSession}
              mode="individual"
            />
          </div>
        )}
      </div>
    </ChartLayoutWrapper>
  );
} 