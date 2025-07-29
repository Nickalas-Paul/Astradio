'use client';

import React, { useState } from 'react';
import BirthDataForm from '../../components/BirthDataForm';
import ChartDisplay from '../../components/ChartDisplay';
import AudioControls from '../../components/AudioControls';
import Navigation from '../../components/Navigation';
import AnimatedChartWheel from '../../components/AnimatedChartWheel';
import GeneratedTextDisplay from '../../components/GeneratedTextDisplay';
import { FormData, AstroChart, AudioStatus } from '../../types';

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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
          mode: 'daily'
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 glow-text leading-[1.2] tracking-tight gradient-text-cosmic cosmic-glow-text">
            Your Astrological Chart
          </h1>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300 leading-[1.25] tracking-tight">
            Discover your cosmic blueprint
          </h2>
          <p className="text-base text-gray-300 mb-4 leading-[1.4] tracking-normal">
            Enter your birth details to generate your personalized astrological chart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Birth Data Form */}
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 cosmic-glow">
            <h3 className="text-xl font-bold mb-6 text-center glow-text leading-[1.2] tracking-tight text-cosmic">
              Birth Information
            </h3>
            <BirthDataForm 
              onSubmit={handleFormSubmit} 
              isLoading={isLoading} 
            />
            
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300">❌ {error}</p>
              </div>
            )}
          </div>

          {/* Chart Display */}
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 cosmic-glow">
            <h3 className="text-xl font-bold mb-6 text-center glow-text leading-[1.2] tracking-tight text-cosmic">
              Chart Visualization
            </h3>
            
            {chart ? (
              <>
                <div className="mb-6">
                  <AnimatedChartWheel 
                    chart={chart} 
                    isPlaying={audioStatus.isPlaying}
                    currentHouse={audioStatus.currentSession?.currentHouse || 1}
                    duration={audioStatus.currentSession?.duration || 60}
                  />
                </div>
                <ChartDisplay chart={chart} />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-64 h-64 chart-wheel rounded-full border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl star-twinkle">🔮</span>
                </div>
                <p className="text-gray-300 leading-[1.4] tracking-normal">
                  Enter your birth details to see your chart
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audio Controls */}
        {chart && (
          <div className="mt-8">
            <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 cosmic-glow">
              <h3 className="text-xl font-bold mb-6 text-center glow-text leading-[1.2] tracking-tight text-cosmic">
                Audio Generation
              </h3>
              <AudioControls 
                audioStatus={audioStatus}
                onPlay={handlePlay}
                onStop={handleStop}
                onPause={handlePause}
              />
            </div>
          </div>
        )}

        {/* Chart Details */}
        {chart && (
          <div className="mt-8 space-y-8">
            <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-bold mb-4 text-center glow-text leading-[1.2] tracking-tight text-cosmic">
                Planetary Positions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Object.entries(chart.planets).map(([planet, data]) => (
                  <div key={planet} className="text-center p-4 glass-morphism-strong rounded-lg border border-emerald-500/10">
                    <div className="text-sm font-semibold text-emerald-300 leading-[1.25] tracking-tight">{planet}</div>
                    <div className="text-xs text-gray-400 leading-[1.4] tracking-normal">{data.sign.name}</div>
                    <div className="text-xs text-gray-400 leading-[1.25] tracking-normal">House {data.house}</div>
                    {data.retrograde && (
                      <div className="text-xs text-orange-400 leading-[1.25] tracking-normal">Retrograde</div>
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
    </div>
  );
} 