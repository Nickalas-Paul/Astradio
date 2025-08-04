'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DebugOverlayProps {
  chartData?: any;
  audioStatus?: any;
  performanceMetrics?: {
    loadTime: number;
    audioInitTime: number;
    chartRenderTime: number;
  };
  isVisible: boolean;
  onToggle: () => void;
}

export default function DebugOverlay({
  chartData,
  audioStatus,
  performanceMetrics,
  isVisible,
  onToggle
}: DebugOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-emerald-500/30 p-4 max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-emerald-300">🐛 Debug Overlay</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  {isExpanded ? '−' : '+'}
                </button>
                <button
                  onClick={onToggle}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`${audioStatus?.isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
                  {audioStatus?.isPlaying ? 'Playing' : 'Stopped'}
                </span>
              </div>
              
              {chartData && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Planets:</span>
                  <span className="text-white">{chartData.planets?.length || 0}</span>
                </div>
              )}
              
              {performanceMetrics && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Load Time:</span>
                  <span className="text-white">{performanceMetrics.loadTime}ms</span>
                </div>
              )}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-700"
                >
                  <div className="space-y-3 text-xs">
                    {/* Chart Data */}
                    {chartData && (
                      <div>
                        <h4 className="text-emerald-300 mb-2">Chart Data:</h4>
                        <div className="bg-gray-800/50 rounded p-2 max-h-32 overflow-y-auto">
                          <pre className="text-xs text-gray-300">
                            {JSON.stringify({
                              planets: chartData.planets?.length || 0,
                              aspects: chartData.aspects?.length || 0,
                              houses: chartData.houses?.length || 0
                            }, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Audio Status */}
                    {audioStatus && (
                      <div>
                        <h4 className="text-emerald-300 mb-2">Audio Status:</h4>
                        <div className="bg-gray-800/50 rounded p-2">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Playing:</span>
                              <span className={audioStatus.isPlaying ? 'text-green-400' : 'text-gray-400'}>
                                {audioStatus.isPlaying ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Loading:</span>
                              <span className={audioStatus.isLoading ? 'text-yellow-400' : 'text-gray-400'}>
                                {audioStatus.isLoading ? 'Yes' : 'No'}
                              </span>
                            </div>
                            {audioStatus.error && (
                              <div className="text-red-400 text-xs">
                                Error: {audioStatus.error}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {performanceMetrics && (
                      <div>
                        <h4 className="text-emerald-300 mb-2">Performance:</h4>
                        <div className="bg-gray-800/50 rounded p-2">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Load Time:</span>
                              <span className="text-white">{performanceMetrics.loadTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Audio Init:</span>
                              <span className="text-white">{performanceMetrics.audioInitTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Chart Render:</span>
                              <span className="text-white">{performanceMetrics.chartRenderTime}ms</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                      <h4 className="text-emerald-300 mb-2">Quick Actions:</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            console.log('Chart Data:', chartData);
                            console.log('Audio Status:', audioStatus);
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                        >
                          Log Data
                        </button>
                        <button
                          onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                        >
                          Clear Cache
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 