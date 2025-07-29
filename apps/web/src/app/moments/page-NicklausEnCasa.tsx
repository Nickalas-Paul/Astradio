'use client';

import React, { useState } from 'react';
import Navigation from '../../components/Navigation';

interface Moment {
  id: number;
  title: string;
  description: string;
  duration: string;
  mood: string;
  planets: string[];
  timestamp: string;
}

export default function MomentsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMoment, setCurrentMoment] = useState<Moment | null>(null);

  const sampleMoments: Moment[] = [
    {
      id: 1,
      title: 'Sun in Leo',
      description: 'A powerful moment of self-expression and creativity',
      duration: '2:34',
      mood: 'Energetic',
      planets: ['Sun', 'Mars'],
      timestamp: '2024-10-15 14:30'
    },
    {
      id: 2,
      title: 'Moon in Cancer',
      description: 'Deep emotional resonance and intuitive flow',
      duration: '3:12',
      mood: 'Contemplative',
      planets: ['Moon', 'Neptune'],
      timestamp: '2024-10-15 15:45'
    },
    {
      id: 3,
      title: 'Mercury Retrograde',
      description: 'Complex communication patterns and mental processing',
      duration: '1:58',
      mood: 'Complex',
      planets: ['Mercury'],
      timestamp: '2024-10-15 16:20'
    }
  ];

  const generateNewMoment = async () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentMoment({
        id: Date.now(),
        title: 'Venus in Libra',
        description: 'Harmonious relationships and artistic inspiration',
        duration: '2:45',
        mood: 'Harmonious',
        planets: ['Venus', 'Jupiter'],
        timestamp: new Date().toISOString()
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-[1.2] tracking-tight gradient-text-cosmic cosmic-glow-text">
            Musical Moments
          </h1>
          <p className="text-xl text-gray-300 mb-6 leading-[1.4] tracking-normal">
            Capture and generate musical moments from your astrological chart
          </p>
        </div>

        {/* Generate New Moment */}
        <div className="glass-morphism-strong rounded-3xl p-8 mb-8 cosmic-glow">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-mystical font-semibold text-cosmic mb-4">
              Generate New Moment
            </h2>
            <p className="text-gray-300 mb-6">
              Create a musical moment based on current planetary positions
            </p>
            <button
              onClick={generateNewMoment}
              disabled={isGenerating}
              className="btn-cosmic px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </span>
              ) : (
                'Generate Moment'
              )}
            </button>
          </div>
        </div>

        {/* Current Moment */}
        {currentMoment && (
          <div className="glass-morphism rounded-2xl p-6 mb-8 cosmic-glow">
            <h3 className="text-xl font-mystical font-semibold text-cosmic mb-4">
              Current Moment
            </h3>
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl p-6 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-emerald-300">{currentMoment.title}</h4>
                <span className="text-sm text-gray-400">{currentMoment.duration}</span>
              </div>
              <p className="text-gray-300 mb-4">{currentMoment.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-300 text-sm font-medium">{currentMoment.mood}</span>
                  <div className="flex space-x-1">
                    {currentMoment.planets.map((planet, index) => (
                      <span key={index} className="text-xs bg-emerald-500/20 px-2 py-1 rounded text-emerald-300">
                        {planet}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn-cosmic px-4 py-2 rounded-lg text-sm font-medium">
                  Play
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Moments */}
        <div className="glass-morphism rounded-2xl p-6">
          <h3 className="text-xl font-mystical font-semibold text-cosmic mb-6">
            Recent Moments
          </h3>
          
          <div className="space-y-4">
            {sampleMoments.map((moment) => (
              <div key={moment.id} className="glass-morphism-strong rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-emerald-300">{moment.title}</h4>
                  <span className="text-sm text-gray-400">{moment.duration}</span>
                </div>
                <p className="text-gray-300 mb-3">{moment.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-300 text-sm font-medium">{moment.mood}</span>
                    <div className="flex space-x-1">
                      {moment.planets.map((planet, index) => (
                        <span key={index} className="text-xs bg-emerald-500/20 px-2 py-1 rounded text-emerald-300">
                          {planet}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="btn-cosmic px-3 py-1 rounded text-xs font-medium">
                      Play
                    </button>
                    <button className="px-3 py-1 rounded text-xs font-medium text-gray-400 hover:text-emerald-300 transition-colors">
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 