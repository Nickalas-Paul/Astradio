'use client';

import React, { useState } from 'react';
import ChartDisplay from '../../components/ChartDisplay';
import AudioControls from '../../components/AudioControls';
import Navigation from '../../components/Navigation';
import SandboxVisualizer from '../../components/SandboxVisualizer';
import ExportShare from '../../components/ExportShare';
import GeneratedTextDisplay from '../../components/GeneratedTextDisplay';
import { AstroChart, AudioStatus } from '../../types';

export default function SandboxPage() {
  const [chart, setChart] = useState<AstroChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    isPlaying: false,
    isLoading: false,
    currentSession: null,
    error: null
  });
  const [audioConfig, setAudioConfig] = useState({
    tempo: 120,
    duration: 60,
    volume: 0.8,
    reverb: 0.3,
    delay: 0.1
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  const handleAudioStatusChange = (status: AudioStatus) => {
    setAudioStatus(status);
  };

  const handlePlay = () => {
    // TODO: Implement play functionality
    console.log('Play audio');
  };

  const handleStop = () => {
    // TODO: Implement stop functionality
    console.log('Stop audio');
  };

  const handlePause = () => {
    // TODO: Implement pause functionality
    console.log('Pause audio');
  };

  const handleSandboxAudio = async () => {
    if (!chart) {
      setError('No chart available for audio generation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/audio/sandbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart_data: chart,
          configuration: audioConfig,
          mode: 'sandbox'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAudioStatus(prev => ({
          ...prev,
          isPlaying: true,
          isLoading: false,
          currentSession: data.data.session,
          error: null
        }));
      } else {
        throw new Error(data.error || 'Failed to generate sandbox audio');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate sandbox audio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 glow-text">
            Astrological Sandbox
          </h1>
          <p className="text-xl text-gray-300">
            Experiment with charts and create custom soundscapes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sandbox Controls */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                          <h2 className="text-2xl font-bold mb-6 text-center glow-text">
                Sandbox Controls
              </h2>
            
            <div className="space-y-4">
              <button
                onClick={createMockChart}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 glow"
              >
                Create Mock Chart
              </button>

              {/* Audio Configuration Controls */}
              {chart && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold mb-3 text-purple-300">Audio Configuration</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Tempo (BPM)</label>
                      <input
                        type="range"
                        min="60"
                        max="200"
                        value={audioConfig.tempo}
                        onChange={(e) => setAudioConfig(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioConfig.tempo} BPM</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Duration (seconds)</label>
                      <input
                        type="range"
                        min="30"
                        max="300"
                        value={audioConfig.duration}
                        onChange={(e) => setAudioConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioConfig.duration}s</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={audioConfig.volume}
                        onChange={(e) => setAudioConfig(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{Math.round(audioConfig.volume * 100)}%</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Reverb</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={audioConfig.reverb}
                        onChange={(e) => setAudioConfig(prev => ({ ...prev, reverb: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{Math.round(audioConfig.reverb * 100)}%</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Delay</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={audioConfig.delay}
                        onChange={(e) => setAudioConfig(prev => ({ ...prev, delay: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{Math.round(audioConfig.delay * 100)}%</span>
                    </div>

                    <button
                      onClick={handleSandboxAudio}
                      disabled={isLoading || audioStatus.isPlaying}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </span>
                      ) : (
                        'Generate Sandbox Audio'
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold mb-3 text-purple-300">Coming Soon</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Manual planet position editing</li>
                  <li>• Custom frequency mappings</li>
                  <li>• Real-time audio parameter adjustment</li>
                  <li>• Save and load custom configurations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chart Display and Audio */}
          <div>
            {chart ? (
              <>
                <ChartDisplay chart={chart} />
                <div className="mt-6">
                  <AudioControls 
                    audioStatus={audioStatus}
                    onPlay={handlePlay}
                    onStop={handleStop}
                    onPause={handlePause}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                <h3 className="text-xl font-semibold mb-4 text-purple-300">
                  Ready to Create
                </h3>
                <p className="text-gray-300 mb-6">
                  Click "Create Mock Chart" to start experimenting with astrological audio generation
                </p>
                <button
                  onClick={createMockChart}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
                >
                  Start Creating
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">❌ {error}</p>
          </div>
        )}

        {/* AI Interpretation */}
        {chart && (
          <div className="mt-8">
            <GeneratedTextDisplay 
              chart={chart}
              session={audioStatus.currentSession}
              mode="sandbox"
            />
          </div>
        )}

        {/* Audio Visualizer */}
        <div className="mt-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold glow-text">
              Sandbox Visualization
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <SandboxVisualizer 
                session={audioStatus.currentSession}
                isPlaying={audioStatus.isPlaying}
                audioConfig={audioConfig}
              />
            </div>
            
            {/* Export & Share */}
            {audioStatus.currentSession && (
              <div>
                <ExportShare session={audioStatus.currentSession} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 