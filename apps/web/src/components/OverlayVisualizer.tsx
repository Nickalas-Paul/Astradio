'use client';

import React from 'react';

interface AstroChart {
  metadata: {
    birth_datetime: string;
  };
  planets: Record<string, any>;
  houses: Record<string, any>;
}

interface OverlayVisualizerProps {
  session: any;
  isPlaying: boolean;
  chart1: AstroChart | null;
  chart2: AstroChart | null;
}

export default function OverlayVisualizer({ session, isPlaying, chart1, chart2 }: OverlayVisualizerProps) {
  if (!chart1 || !chart2) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Generate both charts to see the overlay visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dual Chart Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 Visualization */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-lg font-semibold mb-3 text-center text-purple-300">
            Chart 1
          </h4>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-400">Birth:</span>
              <span className="ml-2 text-white">
                {new Date(chart1.metadata.birth_datetime).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Planets:</span>
              <span className="ml-2 text-white">
                {Object.keys(chart1.planets).length}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Houses:</span>
              <span className="ml-2 text-white">
                {Object.keys(chart1.houses).length}
              </span>
            </div>
          </div>
        </div>

        {/* Chart 2 Visualization */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-lg font-semibold mb-3 text-center text-pink-300">
            Chart 2
          </h4>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-400">Birth:</span>
              <span className="ml-2 text-white">
                {new Date(chart2.metadata.birth_datetime).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Planets:</span>
              <span className="ml-2 text-white">
                {Object.keys(chart2.planets).length}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Houses:</span>
              <span className="ml-2 text-white">
                {Object.keys(chart2.houses).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay Visualization */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
        <h4 className="text-lg font-semibold mb-4 text-center glow-text">
          🎵 Overlay Visualization
        </h4>
        
        {isPlaying ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Overlay Audio Playing</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Chart 1:</span>
                <span className="ml-2 text-white">
                  {new Date(chart1.metadata.birth_datetime).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Chart 2:</span>
                <span className="ml-2 text-white">
                  {new Date(chart2.metadata.birth_datetime).toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            {session && (
              <div className="text-xs text-gray-400">
                Session ID: {session.id}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Generate overlay audio to see the visualization</p>
          </div>
        )}
      </div>

      {/* Audio Waveform Placeholder */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Audio Waveform</h4>
        <div className="h-16 bg-white/5 rounded border border-white/10 flex items-center justify-center">
          <p className="text-xs text-gray-400">
            {isPlaying ? '🎵 Audio visualization coming soon...' : 'Generate audio to see waveform'}
          </p>
        </div>
      </div>
    </div>
  );
} 