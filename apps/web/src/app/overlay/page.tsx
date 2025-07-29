'use client';

import React, { useState } from 'react';
import BirthDataForm from '../../components/BirthDataForm';
import ChartDisplay from '../../components/ChartDisplay';
import AudioControls from '../../components/AudioControls';
import Navigation from '../../components/Navigation';
import OverlayVisualizer from '../../components/OverlayVisualizer';
import GeneratedTextDisplay from '../../components/GeneratedTextDisplay';
import { FormData, AstroChart, AudioStatus } from '../../types';

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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
          mode: 'overlay'
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

  const handleOverlaySubmit = async () => {
    if (!charts.chart1 || !charts.chart2) {
      setError('Both charts must be generated before creating overlay');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/audio/overlay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart1_data: charts.chart1,
          chart2_data: charts.chart2,
          mode: 'overlay'
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
        throw new Error(data.error || 'Failed to generate overlay audio');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate overlay audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioStatusChange = (status: AudioStatus) => {
    setAudioStatus(status);
  };

  const canGenerateOverlay = charts.chart1 && charts.chart2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 glow-text">
            Astrological Overlay
          </h1>
          <p className="text-xl text-gray-300">
            Compare two charts and create harmonious overlays
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chart 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 text-center glow-text">
              Chart 1
            </h2>
            <BirthDataForm 
              onSubmit={(data) => handleFormSubmit(data, 1)} 
              isLoading={isLoading} 
            />
            {charts.chart1 && (
              <div className="mt-6">
                <ChartDisplay chart={charts.chart1} />
              </div>
            )}
          </div>

          {/* Chart 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 text-center glow-text">
              Chart 2
            </h2>
            <BirthDataForm 
              onSubmit={(data) => handleFormSubmit(data, 2)} 
              isLoading={isLoading} 
            />
            {charts.chart2 && (
              <div className="mt-6">
                <ChartDisplay chart={charts.chart2} />
              </div>
            )}
          </div>
        </div>

        {/* Overlay Audio Controls */}
        {canGenerateOverlay && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 text-center glow-text">
              Overlay Audio
            </h2>
            <p className="text-center text-gray-300 mb-6">
              Generate harmonious audio from both charts
            </p>
            
            <div className="text-center mb-6">
              <button
                onClick={handleOverlaySubmit}
                disabled={isLoading || audioStatus.isPlaying}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 glow"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Overlay...
                  </span>
                ) : (
                  'Generate Overlay Audio'
                )}
              </button>
            </div>

            {audioStatus.isPlaying && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full pulse-glow"></div>
                  <span className="text-green-400 font-medium">Overlay Playing</span>
                </div>
                
                <div className="text-sm text-gray-300 mb-4">
                  <p>Chart 1: {charts.chart1?.metadata.birth_datetime}</p>
                  <p>Chart 2: {charts.chart2?.metadata.birth_datetime}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">❌ {error}</p>
          </div>
        )}

        {/* AI Interpretation */}
        {canGenerateOverlay && charts.chart1 && (
          <div className="mt-8">
            <GeneratedTextDisplay 
              chart={charts.chart1}
              secondChart={charts.chart2}
              session={audioStatus.currentSession}
              mode="overlay"
            />
          </div>
        )}

        {/* Audio Visualizer */}
        <div className="mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 text-center glow-text">
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
    </div>
  );
} 