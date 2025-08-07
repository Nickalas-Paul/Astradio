'use client';

import React, { useState, useEffect } from 'react';
import ChartDisplay from './ChartDisplay';
import UnifiedAudioControls from './UnifiedAudioControls';
import Navigation from './Navigation';
import SandboxComposer from './SandboxComposer';
import SandboxControls from './SandboxControls';
import BlankChartWheel from './BlankChartWheel';
import GeneratedTextDisplay from './GeneratedTextDisplay';
import ChartLayoutWrapper from './ChartLayoutWrapper';
import GenreDropdown from './GenreDropdown';
import { AstroChart, AudioStatus, AspectData } from '../types';
import { useGenre } from '../context/GenreContext';
import { sandboxInterpretationService, PlanetPlacement, PlacementInterpretation } from '../lib/sandboxInterpretationService';

export default function SandboxAudioClientOnly() {
  const [chart, setChart] = useState<AstroChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    isPlaying: false,
    isLoading: false,
    currentSession: null,
    error: null
  });
  const [detectedAspects, setDetectedAspects] = useState<AspectData[]>([]);
  const [audioConfig, setAudioConfig] = useState({
    tempo: 120,
    duration: 60,
    volume: 0.8,
    reverb: 0.3,
    delay: 0.1
  });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [placementInterpretations, setPlacementInterpretations] = useState<PlacementInterpretation[]>([]);
  const [currentPlacement, setCurrentPlacement] = useState<PlacementInterpretation | null>(null);
  const [toneAudioService, setToneAudioService] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  const { selectedGenre, getRandomGenre } = useGenre();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize ToneAudioService only on client side
  useEffect(() => {
    if (!isClient) return;
    
    const initializeAudio = async () => {
      try {
        const { default: getToneAudioService } = await import('../lib/toneAudioService');
        const service = getToneAudioService();
        setToneAudioService(service);
        
        // Set up callbacks
        service.onTimeUpdateCallback((time: number) => {
          setAudioStatus(prev => ({
            ...prev,
            currentSession: prev.currentSession ? {
              ...prev.currentSession,
              currentTime: time
            } : null
          }));
        });

        service.onErrorCallback((error: string) => {
          setAudioStatus(prev => ({ ...prev, isLoading: false, error }));
        });
      } catch (error) {
        console.error('Failed to initialize audio service:', error);
      }
    };

    initializeAudio();
  }, [isClient]);

  const handleGenreChange = (newGenre: string) => {
    console.log('Genre changed to:', newGenre);
  };

  // Monitor audio service status
  useEffect(() => {
    if (!toneAudioService || !isClient) return;
    
    const checkAudioStatus = () => {
      setIsAudioPlaying(toneAudioService.getIsPlaying());
    };

    const interval = setInterval(checkAudioStatus, 100);
    return () => clearInterval(interval);
  }, [toneAudioService, isClient]);

  const createMockChart = () => {
    const mockChart: AstroChart = {
      metadata: {
        conversion_method: 'sandbox',
        ayanamsa_correction: 24,
        birth_datetime: new Date().toISOString(),
        coordinate_system: 'tropical'
      },
      planets: {
        Sun: { longitude: 120, sign: { name: 'Leo', element: 'Fire', modality: 'Fixed', degree: 0 }, house: 5, retrograde: false },
        Moon: { longitude: 30, sign: { name: 'Aries', element: 'Fire', modality: 'Cardinal', degree: 0 }, house: 2, retrograde: false },
        Mercury: { longitude: 150, sign: { name: 'Virgo', element: 'Earth', modality: 'Mutable', degree: 0 }, house: 6, retrograde: false },
        Venus: { longitude: 90, sign: { name: 'Cancer', element: 'Water', modality: 'Cardinal', degree: 0 }, house: 4, retrograde: false },
        Mars: { longitude: 210, sign: { name: 'Libra', element: 'Air', modality: 'Cardinal', degree: 0 }, house: 8, retrograde: false },
        Jupiter: { longitude: 270, sign: { name: 'Capricorn', element: 'Earth', modality: 'Cardinal', degree: 0 }, house: 10, retrograde: false },
        Saturn: { longitude: 330, sign: { name: 'Pisces', element: 'Water', modality: 'Mutable', degree: 0 }, house: 12, retrograde: false }
      },
      houses: {
        '1': { cusp_longitude: 0, sign: { name: 'Aries', element: 'Fire', modality: 'Cardinal', degree: 0 } },
        '2': { cusp_longitude: 30, sign: { name: 'Taurus', element: 'Earth', modality: 'Fixed', degree: 0 } },
        '3': { cusp_longitude: 60, sign: { name: 'Gemini', element: 'Air', modality: 'Mutable', degree: 0 } },
        '4': { cusp_longitude: 90, sign: { name: 'Cancer', element: 'Water', modality: 'Cardinal', degree: 0 } },
        '5': { cusp_longitude: 120, sign: { name: 'Leo', element: 'Fire', modality: 'Fixed', degree: 0 } },
        '6': { cusp_longitude: 150, sign: { name: 'Virgo', element: 'Earth', modality: 'Mutable', degree: 0 } },
        '7': { cusp_longitude: 180, sign: { name: 'Libra', element: 'Air', modality: 'Cardinal', degree: 0 } },
        '8': { cusp_longitude: 210, sign: { name: 'Scorpio', element: 'Water', modality: 'Fixed', degree: 0 } },
        '9': { cusp_longitude: 240, sign: { name: 'Sagittarius', element: 'Fire', modality: 'Mutable', degree: 0 } },
        '10': { cusp_longitude: 270, sign: { name: 'Capricorn', element: 'Earth', modality: 'Cardinal', degree: 0 } },
        '11': { cusp_longitude: 300, sign: { name: 'Aquarius', element: 'Air', modality: 'Fixed', degree: 0 } },
        '12': { cusp_longitude: 330, sign: { name: 'Pisces', element: 'Water', modality: 'Mutable', degree: 0 } }
      }
    };

    setChart(mockChart);
  };

  const handleChartUpdate = async (updatedChart: AstroChart) => {
    setChart(updatedChart);
    
    // Generate interpretations for new placements
    if (updatedChart.planets) {
      const placements: PlanetPlacement[] = Object.entries(updatedChart.planets).map(([planet, data]) => ({
        planet,
        house: data.house,
        sign: data.sign.name,
        degree: data.sign.degree
      }));
      
      const interpretations = placements.map(placement => 
        sandboxInterpretationService.generatePlacementInterpretation(placement)
      );
      
      setPlacementInterpretations(interpretations);
    }

    // Generate real-time audio for the updated chart
    if (updatedChart.planets && Object.keys(updatedChart.planets).length > 0) {
      await generateSandboxAudio(updatedChart);
    }
  };

  const generateSandboxAudio = async (chartData: AstroChart) => {
    if (!chartData || !toneAudioService || !isClient) return;

    try {
      // Stop any existing audio
      toneAudioService.stop();

      // Generate note events for the sandbox chart with enhanced processing
      const genre = selectedGenre || getRandomGenre();
      const enhancedChartData = {
        ...chartData,
        sandbox_metadata: {
          total_planets: Object.keys(chartData.planets || {}).length,
          active_aspects: detectedAspects.length,
          complexity_score: calculateComplexityScore(chartData),
          energy_level: calculateEnergyLevel(chartData),
          harmonic_density: calculateHarmonicDensity(chartData)
        }
      };

      const noteEvents = toneAudioService.generateNoteEvents(enhancedChartData, genre);
      
      if (noteEvents.length === 0) {
        console.warn('No musical events generated from sandbox chart');
        return;
      }

      // Apply real-time sandbox processing
      const processedEvents = await applySandboxProcessing(noteEvents, enhancedChartData, genre);

      // Play the sandbox note events with enhanced configuration
      const success = await toneAudioService.playNoteEvents(processedEvents);
      
      if (success) {
        setAudioStatus(prev => ({ 
          ...prev, 
          isLoading: false,
          isPlaying: true,
          currentSession: {
            id: `sandbox_session_${Date.now()}`,
            chartId: 'sandbox_chart',
            configuration: {
              mode: 'sandbox',
              duration: toneAudioService.getDuration(),
              genre: genre as any,
              complexity_score: enhancedChartData.sandbox_metadata.complexity_score,
              energy_level: enhancedChartData.sandbox_metadata.energy_level,
              harmonic_density: enhancedChartData.sandbox_metadata.harmonic_density
            },
            isPlaying: true,
            currentHouse: 1,
            duration: toneAudioService.getDuration(),
            genre: genre as any
          }
        }));
        console.log('Sandbox audio generated and playing successfully');
      }
    } catch (error) {
      console.error('Failed to generate sandbox audio:', error);
    }
  };

  // Calculate complexity score for sandbox
  const calculateComplexityScore = (chartData: AstroChart): number => {
    const planets = Object.keys(chartData.planets || {});
    const aspects = detectedAspects.length;
    const houses = Object.keys(chartData.houses || {});
    
    // Complexity based on number of active elements
    const planetComplexity = planets.length * 0.2;
    const aspectComplexity = aspects * 0.3;
    const houseComplexity = houses.length * 0.1;
    
    return Math.min(planetComplexity + aspectComplexity + houseComplexity, 1);
  };

  // Calculate energy level
  const calculateEnergyLevel = (chartData: AstroChart): number => {
    const planets = Object.values(chartData.planets || {});
    let energyLevel = 0;
    
    planets.forEach(planet => {
      // Fire signs have high energy
      if (planet.sign?.element === 'Fire') energyLevel += 0.3;
      // Air signs have medium energy
      else if (planet.sign?.element === 'Air') energyLevel += 0.2;
      // Earth signs have low energy
      else if (planet.sign?.element === 'Earth') energyLevel += 0.1;
      // Water signs have medium-low energy
      else if (planet.sign?.element === 'Water') energyLevel += 0.15;
    });
    
    return Math.min(energyLevel, 1);
  };

  // Calculate harmonic density
  const calculateHarmonicDensity = (chartData: AstroChart): number => {
    const aspects = detectedAspects;
    let harmonicDensity = 0;
    
    aspects.forEach(aspect => {
      switch (aspect.type) {
        case 'conjunction':
          harmonicDensity += 0.4;
          break;
        case 'trine':
          harmonicDensity += 0.3;
          break;
        case 'sextile':
          harmonicDensity += 0.2;
          break;
        case 'square':
          harmonicDensity += 0.1;
          break;
        case 'opposition':
          harmonicDensity += 0.25;
          break;
      }
    });
    
    return Math.min(harmonicDensity, 1);
  };

  // Apply sandbox-specific processing
  const applySandboxProcessing = async (noteEvents: any[], chartData: AstroChart, genre: string): Promise<any[]> => {
    const processedEvents = noteEvents.map(event => {
      const enhancedEvent = { ...event };
      
      // Apply complexity-based modifications
      const complexity = calculateComplexityScore(chartData);
      const energy = calculateEnergyLevel(chartData);
      const harmony = calculateHarmonicDensity(chartData);
      
      // Adjust velocity based on energy level
      enhancedEvent.velocity = Math.min(event.velocity * (0.8 + energy * 0.4), 0.9);
      
      // Adjust duration based on complexity
      enhancedEvent.duration = event.duration * (1 + complexity * 0.3);
      
      // Apply genre-specific enhancements
      switch (genre) {
        case 'ambient':
          enhancedEvent.velocity *= 0.8;
          enhancedEvent.duration *= 1.2;
          break;
        case 'techno':
          enhancedEvent.velocity *= 1.2;
          enhancedEvent.duration *= 0.8;
          break;
        case 'classical':
          enhancedEvent.velocity *= 1.1;
          enhancedEvent.duration *= 1.1;
          break;
        case 'experimental':
          // Add randomization for experimental genre
          enhancedEvent.velocity *= (0.7 + Math.random() * 0.6);
          enhancedEvent.duration *= (0.8 + Math.random() * 0.4);
          break;
      }
      
      return enhancedEvent;
    });
    
    return processedEvents;
  };

  const handleAspectsDetected = (aspects: AspectData[]) => {
    setDetectedAspects(aspects);
  };

  const handlePlacementSelect = (placement: PlacementInterpretation) => {
    setCurrentPlacement(placement);
  };

  const handleReset = () => {
    setChart(null);
    setDetectedAspects([]);
    setPlacementInterpretations([]);
    setCurrentPlacement(null);
    if (toneAudioService) {
      toneAudioService.stop();
    }
    setIsAudioPlaying(false);
  };

  const handlePlay = async () => {
    if (!chart) {
      setError('No chart available. Please initialize a chart first.');
      return;
    }
    
    await generateSandboxAudio(chart);
  };

  const handleStop = () => {
    if (toneAudioService) {
      toneAudioService.stop();
    }
    setAudioStatus(prev => ({ ...prev, isPlaying: false }));
  };

  const handlePause = () => {
    if (toneAudioService) {
      toneAudioService.pause();
    }
    setAudioStatus(prev => ({ ...prev, isPlaying: false }));
  };

  // Don't render anything until we're on the client
  if (!isClient) {
    return null;
  }

  return (
    <ChartLayoutWrapper
      title="Astrological Sandbox"
      subtitle="Experiment with charts and create custom soundscapes through interactive planetary placement"
      genre={selectedGenre || 'ambient'}
      showGenre={true}
    >
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-lg text-gray-300 mb-8 leading-relaxed tracking-wide font-mystical max-w-3xl mx-auto">
            Drag planets, adjust placements, and hear real-time audio generation
          </p>
        </div>

        {/* Initialize Chart */}
        {!chart && (
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 max-w-2xl mx-auto mb-8 text-center">
            <h2 className="section-header text-2xl mb-6">
              Start Your Composition
            </h2>
            <p className="text-gray-300 mb-8 leading-relaxed tracking-wide font-mystical">
              Create a base chart to begin your astrological audio exploration
            </p>
            <button
              onClick={createMockChart}
              className="px-8 py-4 btn-cosmic rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-mystical text-base tracking-wide"
            >
              Initialize Chart
            </button>
          </div>
        )}

        {/* Genre Selection */}
        <div className="mb-8 w-full max-w-md mx-auto">
          <GenreDropdown
            selectedGenre={selectedGenre || 'ambient'}
            onGenreChange={handleGenreChange}
            disabled={isLoading}
          />
        </div>

        {/* Sandbox Composer */}
        {chart && (
          <div className="mb-12">
            <SandboxComposer 
              onChartUpdate={handleChartUpdate}
              currentChart={chart}
              onAspectsDetected={handleAspectsDetected}
              onPlacementSelect={handlePlacementSelect}
            />
          </div>
        )}

        {/* Unified Audio Controls */}
        {chart && (
          <div className="mb-8 w-full max-w-lg mx-auto">
            <UnifiedAudioControls
              chartData={chart}
              genre={selectedGenre || 'ambient'}
              mode="sandbox"
              onPlay={handlePlay}
              onStop={handleStop}
              onPause={handlePause}
              showExport={true}
              audioStatus={audioStatus}
            />
          </div>
        )}

        {/* Sandbox Controls */}
        {chart && (
          <div className="mb-8">
            <SandboxControls
              chart={chart}
              aspects={detectedAspects}
              audioConfig={audioConfig}
              onReset={handleReset}
              onChartUpdate={handleChartUpdate}
              isAudioPlaying={isAudioPlaying}
              onAudioStatusChange={(isPlaying) => setIsAudioPlaying(isPlaying)}
            />
          </div>
        )}

        {/* Chart Display and Interpretations */}
        {chart ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <ChartDisplay chart={chart} />
            </div>
            <div>
              {/* Placement Interpretations */}
              {placementInterpretations.length > 0 && (
                <div className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20 mb-6">
                  <h3 className="section-header text-lg mb-4">Placement Interpretations</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {placementInterpretations.map((interpretation, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/20 transition-colors"
                        onClick={() => setCurrentPlacement(interpretation)}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-semibold text-emerald-300">
                            {interpretation.planet}
                          </span>
                          <span className="text-xs text-gray-400">
                            House {interpretation.house} ({interpretation.sign})
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mb-2 line-clamp-3">
                          {interpretation.meaning}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {interpretation.keywords.slice(0, 4).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-emerald-500/20 rounded text-xs text-emerald-300"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Placement Detail */}
              {currentPlacement && (
                <div className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20">
                  <h3 className="section-header text-lg mb-4">Detailed Interpretation</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-300 mb-2">
                        {currentPlacement.planet} in {currentPlacement.sign}
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {currentPlacement.meaning}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-emerald-300 mb-1">Musical Influence</h5>
                      <p className="text-xs text-gray-300">
                        {currentPlacement.musicalInfluence}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-emerald-300 mb-1">Keywords</h5>
                      <div className="flex flex-wrap gap-1">
                        {currentPlacement.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-emerald-500/20 rounded text-xs text-emerald-300"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BlankChartWheel 
              size={400}
              message="Start by dragging planets or selecting a house to place them"
              showGrid={true}
            />
          </div>
        )}

        {error && (
          <div className="mt-6 p-6 bg-red-500/20 border border-red-500/30 rounded-xl max-w-4xl mx-auto">
            <p className="text-red-300 font-mystical text-center">{error}</p>
          </div>
        )}

        {/* AI Interpretation */}
        {chart && (
          <div className="mt-12">
            <GeneratedTextDisplay 
              chart={chart}
              session={audioStatus.currentSession}
              mode="sandbox"
            />
          </div>
        )}
      </div>
    </ChartLayoutWrapper>
  );
} 