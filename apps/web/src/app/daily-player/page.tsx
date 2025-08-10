'use client';

import React from 'react';
import { DailyChartPlayer } from '../../components/DailyChartPlayer';

export default function DailyPlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Astradio Daily Chart Player
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Experience today's planetary energies as real-time generated music
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <DailyChartPlayer 
              defaultGenre="ambient"
              showGenreSelector={true}
              showVolumeControl={true}
              autoLoad={true}
            />
          </div>

          <div className="text-white space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">🌟</span>
                  Real-time planetary positions calculated using Swiss Ephemeris
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">🎵</span>
                  Each planet maps to specific musical elements (frequency, instrument, volume)
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">🏠</span>
                  Astrological houses influence timing and spatial positioning
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">✨</span>
                  Zodiac signs modify musical characteristics and harmonies
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Genre Selection</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-blue-300">Ambient</h3>
                  <p className="text-gray-300">Ethereal soundscapes for meditation and relaxation</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-purple-300">Techno</h3>
                  <p className="text-gray-300">Electronic beats with synthetic textures and driving rhythm</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-300">World Music</h3>
                  <p className="text-gray-300">Organic instruments with global cultural influences</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-yellow-300">Hip-Hop</h3>
                  <p className="text-gray-300">Urban beats with strong rhythmic elements</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Technical Features</h2>
              <ul className="space-y-2 text-gray-200">
                <li>• Real-time browser audio synthesis using Tone.js</li>
                <li>• Dynamic tempo calculation from planetary aspects</li>
                <li>• Musical key derived from Sun sign</li>
                <li>• Volume modulation based on house positions</li>
                <li>• Harmonic structures from planetary aspects</li>
                <li>• Genre-specific instrument selection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
