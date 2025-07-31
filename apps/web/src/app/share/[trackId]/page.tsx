'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '../../../components/Navigation';
import AnimatedChartWheel from '../../../components/AnimatedChartWheel';
import { AstroChart } from '../../../types';

interface SharedTrack {
  id: string;
  title: string;
  chartData: AstroChart;
  genre: string;
  interpretation: string;
  timestamp: Date;
  mode: 'daily' | 'overlay' | 'sandbox';
  creator: string;
}

export default function SharePage() {
  const params = useParams();
  const trackId = params.trackId as string;
  
  const [track, setTrack] = useState<SharedTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSharedTrack();
  }, [trackId]);

  const loadSharedTrack = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would fetch from an API
      // For now, we'll simulate loading a shared track
      setTimeout(() => {
        const mockTrack: SharedTrack = {
          id: trackId,
          title: 'Cosmic Harmony',
          chartData: {} as AstroChart, // Mock chart data
          genre: 'ambient',
          interpretation: 'A peaceful composition reflecting the harmonious alignment of planets in your chart. The gentle ambient tones mirror the flowing energy of your astrological landscape.',
          timestamp: new Date(),
          mode: 'daily',
          creator: 'CosmicHarmony'
        };
        
        setTrack(mockTrack);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      setError('Failed to load shared track');
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    // In a real app, this would start audio playback
    console.log('Playing shared track:', track?.id);
  };

  const handleSave = () => {
    // In a real app, this would save to user's library
    console.log('Saving track to library:', track?.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
        <Navigation />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <p className="text-gray-300 font-mystical">Loading shared track...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
        <Navigation />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-semibold text-red-300 font-mystical mb-2">
              Track Not Found
            </h2>
            <p className="text-gray-400 font-mystical">
              This shared track may have been removed or is no longer available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 glow-text leading-tight tracking-tight gradient-text-cosmic cosmic-glow-text font-mystical">
            Shared Track
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed tracking-wide font-mystical">
            A cosmic composition shared with you
          </p>
        </div>

        {/* Track Display */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 mb-8">
            {/* Track Info */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white font-mystical mb-2">
                {track.title}
              </h2>
              <p className="text-emerald-300 font-mystical capitalize mb-2">
                {track.genre} • {track.mode} mode
              </p>
              <p className="text-gray-400 font-mystical text-sm">
                Shared by {track.creator} • {track.timestamp.toLocaleDateString()}
              </p>
            </div>

            {/* Chart Wheel */}
            <div className="flex justify-center mb-8">
              <div className="w-80 h-80 chart-wheel rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center cosmic-glow">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="text-center mb-8">
              <h3 className="section-header text-xl mb-4">
                Interpretation
              </h3>
              <p className="text-gray-300 font-mystical leading-relaxed max-w-2xl mx-auto">
                {track.interpretation}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handlePlay}
                className="px-8 py-4 btn-cosmic rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-mystical text-base tracking-wide"
              >
                Play Track
              </button>
              
              <button
                onClick={handleSave}
                className="px-8 py-4 bg-violet-500/20 border border-violet-500/30 rounded-xl hover:bg-violet-500/30 transition-all duration-200 font-mystical text-violet-300"
              >
                Save to Library
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="px-8 py-4 bg-gray-600/20 border border-gray-500/30 rounded-xl hover:bg-gray-600/30 transition-all duration-200 font-mystical text-gray-300"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Share Info */}
          <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20 text-center">
            <h3 className="text-lg font-semibold text-emerald-300 font-mystical mb-4">
              Share This Track
            </h3>
            <p className="text-gray-400 font-mystical mb-4">
              Love this track? Share it with your friends and family!
            </p>
            <div className="flex justify-center space-x-4">
              <button className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all duration-200">
                <span className="text-2xl">𝕏</span>
              </button>
              <button className="p-3 bg-violet-500/20 border border-violet-500/30 rounded-xl hover:bg-violet-500/30 transition-all duration-200">
                <span className="text-2xl">📷</span>
              </button>
              <button className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl hover:bg-orange-500/30 transition-all duration-200">
                <span className="text-2xl">📤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 