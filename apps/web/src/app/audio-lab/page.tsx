'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import { useGenre } from '../../context/GenreContext';
import AudioLabInterface from '../../components/AudioLabInterface';
import ChartLayoutWrapper from '../../components/ChartLayoutWrapper';
import DualChartMerge from '../../components/DualChartMerge';
import { FormData, AstroChart, AudioStatus } from '../../types';
import { buildSecureAPIUrl, clientRateLimiter } from '../../lib/security';
import toneAudioService from '../../lib/toneAudioService';

interface ChartData {
  chart: AstroChart | null;
  mode: 'birth' | 'transit' | 'sandbox';
  formData?: FormData;
}

interface AudioLabState {
  chartA: ChartData;
  chartB: ChartData;
  isGenerating: boolean;
  audioStatus: AudioStatus;
  error: string | null;
  showChartB: boolean;
  isMerging: boolean;
  mergeComplete: boolean;
  selectedGenre?: string;
}

export default function AudioLabPage() {
  const router = useRouter();
  const { selectedGenre, setSelectedGenre } = useGenre();
  const [state, setState] = useState<AudioLabState>({
    chartA: { chart: null, mode: 'birth' },
    chartB: { chart: null, mode: 'transit' },
    isGenerating: false,
    audioStatus: {
      isPlaying: false,
      isLoading: false,
      currentSession: null,
      error: null
    },
    error: null,
    showChartB: false,
    isMerging: false,
    mergeComplete: false,
    selectedGenre: selectedGenre || 'ambient'
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Set up Tone.js audio service callbacks
  useEffect(() => {
    toneAudioService.onTimeUpdateCallback((time) => {
      setState(prev => ({
        ...prev,
        audioStatus: {
          ...prev.audioStatus,
          currentSession: prev.audioStatus.currentSession ? {
            ...prev.audioStatus.currentSession,
            currentTime: time
          } : null
        }
      }));
    });

    toneAudioService.onErrorCallback((error) => {
      setState(prev => ({
        ...prev,
        audioStatus: { ...prev.audioStatus, isLoading: false, error }
      }));
    });

    return () => {
      toneAudioService.stop();
    };
  }, []);

  const handleStateChange = (newState: any) => {
    setState(newState);
    // Update genre context when it changes
    if (newState.selectedGenre && newState.selectedGenre !== selectedGenre) {
      setSelectedGenre(newState.selectedGenre as any);
    }
  };

  return (
    <ChartLayoutWrapper
      title="ASTRADIO"
      subtitle="Core Audio Lab"
      genre={selectedGenre || 'ambient'}
      showGenre={true}
    >
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 glow-text gradient-text-cosmic font-mystical">
            Core Audio Lab
          </h1>
          <p className="text-xl text-gray-300 font-mystical">
            Unified astrological composition studio with progressive disclosure
          </p>
        </div>

        {/* Progressive Interface */}
        <AudioLabInterface
          state={state}
          onStateChange={handleStateChange}
        />

        {/* Merge Animation (when both charts are present) */}
        {state.chartA.chart && state.chartB.chart && (
          <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20 mt-8">
            <DualChartMerge
              chart1={state.chartA.chart}
              chart2={state.chartB.chart}
              isMerging={state.isMerging}
              onStartMerge={() => setState(prev => ({ ...prev, isMerging: true }))}
              onMergeComplete={() => setState(prev => ({ ...prev, mergeComplete: true }))}
            />
          </div>
        )}
      </div>
    </ChartLayoutWrapper>
  );
} 