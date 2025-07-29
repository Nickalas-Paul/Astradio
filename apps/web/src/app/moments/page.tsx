'use client';

import React, { useState } from 'react';
import BirthDataForm from '../../components/BirthDataForm';
import ChartDisplay from '../../components/ChartDisplay';
import AudioControls from '../../components/AudioControls';
import Navigation from '../../components/Navigation';
import MomentsVisualizer from '../../components/MomentsVisualizer';
import ExportShare from '../../components/ExportShare';
import { FormData, AstroChart, AudioStatus } from '../../types';
import AnimatedChartWheel from '../../components/AnimatedChartWheel';

export default function MomentsPage() {
  const [chart, setChart] = useState<AstroChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentHouse, setCurrentHouse] = useState(1);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    isPlaying: false,
    isLoading: false,
    currentSession: null,
    error: null
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

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
          mode: 'moments'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setChart(data.data.chart);
      } else {
        throw new Error(data.error || 'Failed to generate chart');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate chart');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 glow-text">
            Astrological Moments
          </h1>
          <p className="text-xl text-gray-300">
            Discover your personal astrological soundtrack
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <BirthDataForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300">❌ {error}</p>
              </div>
            )}
          </div>

          <div>
            {chart && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Animated Wheel */}
                  <div className="flex flex-col items-center">
                    <h4 className="text-lg font-semibold mb-4 text-purple-300">
                      Interactive Wheel
                    </h4>
                    <AnimatedChartWheel
                      chart={chart}
                      isPlaying={audioStatus.isPlaying}
                      currentHouse={currentHouse}
                      duration={360} // 6 minutes for full composition
                      onHouseChange={setCurrentHouse}
                    />
                  </div>
                  
                  {/* Chart Details */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-purple-300">
                      Chart Details
                    </h4>
                    <ChartDisplay chart={chart} />
                  </div>
                </div>
                
                <div className="mt-6">
                  <AudioControls 
                    audioStatus={audioStatus}
                    onPlay={handlePlay}
                    onStop={handleStop}
                    onPause={handlePause}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Audio Visualizer */}
        <div className="mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 text-center glow-text">
              Live Audio Visualization
            </h2>
            <MomentsVisualizer 
              session={audioStatus.currentSession}
              isPlaying={audioStatus.isPlaying}
            />
          </div>
        </div>

        {/* Export & Share */}
        {audioStatus.currentSession && (
          <div className="mt-8">
            <ExportShare session={audioStatus.currentSession} />
          </div>
        )}
      </div>
    </div>
  );
} 