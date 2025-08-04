'use client';

import React, { useState, useEffect } from 'react';
import toneAudioService from '../../lib/toneAudioService';

export default function TestAudioPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);

  // Sample chart data for testing
  const sampleChart = {
    planets: {
      Sun: { longitude: 45, house: 1, sign: { name: 'Taurus' } },
      Moon: { longitude: 120, house: 4, sign: { name: 'Leo' } },
      Mercury: { longitude: 60, house: 2, sign: { name: 'Gemini' } },
      Venus: { longitude: 90, house: 3, sign: { name: 'Cancer' } },
      Mars: { longitude: 150, house: 5, sign: { name: 'Virgo' } }
    },
    aspects: [
      { type: 'conjunction', planet1: 'Sun', planet2: 'Mercury', orb: 5 },
      { type: 'trine', planet1: 'Moon', planet2: 'Venus', orb: 3 }
    ]
  };

  const handlePlay = async () => {
    try {
      setIsPlaying(true);
      setError(null);
      
      console.log('🎵 Starting audio test...');
      const events = toneAudioService.generateNoteEvents(sampleChart, 'ambient');
      console.log('🎵 Generated events:', events.length);
      
      const success = await toneAudioService.playNoteEvents(events);
      console.log('🎵 Playback success:', success);
      
      if (!success) {
        setError('Failed to start audio playback');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('❌ Audio test failed:', error);
      setError('Audio test failed');
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    toneAudioService.stop();
    setIsPlaying(false);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    toneAudioService.setVolume(newVolume);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Audio Test Page</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl mb-4">Audio Controls</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={handlePlay}
                disabled={isPlaying}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded"
              >
                ▶️ Play Test Audio
              </button>
              
              <button
                onClick={handleStop}
                disabled={!isPlaying}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded"
              >
                ⏹️ Stop
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <span>🔊 Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span>{Math.round(volume * 100)}%</span>
            </div>
            
            {error && (
              <div className="text-red-400">
                ❌ Error: {error}
              </div>
            )}
            
            {isPlaying && (
              <div className="text-green-400">
                ✅ Playing audio...
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Test Chart Data</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(sampleChart, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 