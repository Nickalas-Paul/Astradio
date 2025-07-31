'use client';

import React, { useState } from 'react';
import Navigation from '../../components/Navigation';
import { useTextGenerator } from '../../lib/useTextGenerator';
import GeneratedTextDisplay from '../../components/GeneratedTextDisplay';
import { type ChartData } from '../../lib/textGenerator';

interface Overlay {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: string;
  planets: string[];
  status: string;
}

type OverlayMode = 'daily' | 'connection';

export default function OverlayPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOverlay, setCurrentOverlay] = useState<Overlay | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('daily');
  const [generatedText, setGeneratedText] = useState<any>(null);
  
  const { generateDailyAlignment, generateChartComparison, isGenerating: isTextGenerating } = useTextGenerator({
    onGenerated: (text) => setGeneratedText(text),
    onError: (error) => console.error('Text generation error:', error)
  });

  const sampleOverlays: Overlay[] = [
    {
      id: 1,
      title: 'Cosmic Flow',
      description: 'Fluid visual patterns that follow planetary movements',
      duration: '3:45',
      type: 'Particle System',
      planets: ['Sun', 'Moon', 'Venus'],
      status: 'Ready'
    },
    {
      id: 2,
      title: 'Stellar Grid',
      description: 'Geometric patterns representing astrological houses',
      duration: '2:30',
      type: 'Geometric',
      planets: ['Mars', 'Jupiter'],
      status: 'Playing'
    },
    {
      id: 3,
      title: 'Nebula Drift',
      description: 'Ethereal cloud formations responding to musical frequencies',
      duration: '4:12',
      type: 'Organic',
      planets: ['Neptune', 'Uranus'],
      status: 'Paused'
    }
  ];

  // Sample chart data for demonstration
  const sampleUserChart: ChartData = {
    planets: {
      'Sun': { planet: 'Sun', sign: 'Libra', house: 5, degree: 15 },
      'Moon': { planet: 'Moon', sign: 'Cancer', house: 2, degree: 8 },
      'Mercury': { planet: 'Mercury', sign: 'Libra', house: 5, degree: 12 },
      'Venus': { planet: 'Venus', sign: 'Virgo', house: 4, degree: 25 },
      'Mars': { planet: 'Mars', sign: 'Scorpio', house: 6, degree: 18 }
    },
    houses: {
      1: { sign: 'Leo', degree: 0 },
      2: { sign: 'Virgo', degree: 0 },
      3: { sign: 'Libra', degree: 0 },
      4: { sign: 'Scorpio', degree: 0 },
      5: { sign: 'Sagittarius', degree: 0 },
      6: { sign: 'Capricorn', degree: 0 },
      7: { sign: 'Aquarius', degree: 0 },
      8: { sign: 'Pisces', degree: 0 },
      9: { sign: 'Aries', degree: 0 },
      10: { sign: 'Taurus', degree: 0 },
      11: { sign: 'Gemini', degree: 0 },
      12: { sign: 'Cancer', degree: 0 }
    },
    ascendant: { sign: 'Leo', degree: 0 },
    midheaven: { sign: 'Taurus', degree: 0 }
  };

  const sampleTransits: ChartData = {
    planets: {
      'Sun': { planet: 'Sun', sign: 'Capricorn', house: 10, degree: 22 },
      'Moon': { planet: 'Moon', sign: 'Pisces', house: 12, degree: 15 },
      'Mercury': { planet: 'Mercury', sign: 'Capricorn', house: 10, degree: 18 },
      'Venus': { planet: 'Venus', sign: 'Sagittarius', house: 9, degree: 8 },
      'Mars': { planet: 'Mars', sign: 'Aquarius', house: 11, degree: 5 }
    },
    houses: {
      1: { sign: 'Libra', degree: 0 },
      2: { sign: 'Scorpio', degree: 0 },
      3: { sign: 'Sagittarius', degree: 0 },
      4: { sign: 'Capricorn', degree: 0 },
      5: { sign: 'Aquarius', degree: 0 },
      6: { sign: 'Pisces', degree: 0 },
      7: { sign: 'Aries', degree: 0 },
      8: { sign: 'Taurus', degree: 0 },
      9: { sign: 'Gemini', degree: 0 },
      10: { sign: 'Cancer', degree: 0 },
      11: { sign: 'Leo', degree: 0 },
      12: { sign: 'Virgo', degree: 0 }
    },
    ascendant: { sign: 'Libra', degree: 0 },
    midheaven: { sign: 'Cancer', degree: 0 }
  };

  const samplePartnerChart: ChartData = {
    planets: {
      'Sun': { planet: 'Sun', sign: 'Aries', house: 1, degree: 12 },
      'Moon': { planet: 'Moon', sign: 'Pisces', house: 12, degree: 8 },
      'Mercury': { planet: 'Mercury', sign: 'Aries', house: 1, degree: 15 },
      'Venus': { planet: 'Venus', sign: 'Taurus', house: 2, degree: 3 },
      'Mars': { planet: 'Mars', sign: 'Gemini', house: 3, degree: 20 }
    },
    houses: {
      1: { sign: 'Aries', degree: 0 },
      2: { sign: 'Taurus', degree: 0 },
      3: { sign: 'Gemini', degree: 0 },
      4: { sign: 'Cancer', degree: 0 },
      5: { sign: 'Leo', degree: 0 },
      6: { sign: 'Virgo', degree: 0 },
      7: { sign: 'Libra', degree: 0 },
      8: { sign: 'Scorpio', degree: 0 },
      9: { sign: 'Sagittarius', degree: 0 },
      10: { sign: 'Capricorn', degree: 0 },
      11: { sign: 'Aquarius', degree: 0 },
      12: { sign: 'Pisces', degree: 0 }
    },
    ascendant: { sign: 'Aries', degree: 0 },
    midheaven: { sign: 'Capricorn', degree: 0 }
  };

  const generateOverlay = async () => {
    setIsGenerating(true);
    
    try {
      // Generate text based on mode
      if (overlayMode === 'daily') {
        await generateDailyAlignment(sampleTransits, sampleUserChart);
      } else {
        await generateChartComparison(sampleUserChart, samplePartnerChart);
      }
      
      // Simulate overlay generation
      setTimeout(() => {
        setCurrentOverlay({
          id: Date.now(),
          title: overlayMode === 'daily' ? 'Daily Resonance' : 'Connection Blend',
          description: overlayMode === 'daily' 
            ? 'Today\'s planetary positions harmonizing with your birth chart'
            : 'Two charts blending in cosmic harmony',
          duration: '3:20',
          type: overlayMode === 'daily' ? 'Daily Alignment' : 'Connection Overlay',
          planets: overlayMode === 'daily' ? ['Sun', 'Moon', 'Mercury'] : ['Venus', 'Mars', 'Jupiter'],
          status: 'Generated'
        });
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to generate overlay:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-[1.2] tracking-tight gradient-text-cosmic cosmic-glow-text">
            Merge Tracks
          </h1>
          <p className="text-xl text-gray-300 mb-6 leading-[1.4] tracking-normal">
            Blend astrological charts into unified musical experiences
          </p>
        </div>

        {/* Mode Selector */}
        <div className="glass-morphism-strong rounded-3xl p-8 mb-8 cosmic-glow">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-mystical font-semibold text-cosmic mb-4">
              Choose Overlay Mode
            </h2>
            
            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-800/50 rounded-xl p-1 border border-emerald-500/20">
                <button
                  onClick={() => setOverlayMode('daily')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    overlayMode === 'daily'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-emerald-300'
                  }`}
                >
                  <span className="text-lg">🪐</span>
                  <span>Daily Alignment</span>
                </button>
                <button
                  onClick={() => setOverlayMode('connection')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    overlayMode === 'connection'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-purple-300'
                  }`}
                >
                  <span className="text-lg">🤝</span>
                  <span>Connection Overlay</span>
                </button>
              </div>
            </div>

            {/* Mode Description */}
            <div className="text-center mb-6">
              {overlayMode === 'daily' ? (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-300 mb-2">Today + My Chart</h3>
                  <p className="text-gray-300">Hear how today's sky resonates with your birth chart</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">My Chart + Another</h3>
                  <p className="text-gray-300">Blend your chart with someone else's — friend, partner, or family</p>
                </div>
              )}
            </div>

            {/* Mode-Specific Form */}
            {overlayMode === 'daily' ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-emerald-300 font-medium mb-2">Your Birth Chart</label>
                    <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                      <option>Alex - Libra Sun, Cancer Moon</option>
                      <option>Sarah - Aries Sun, Pisces Moon</option>
                      <option>Mike - Capricorn Sun, Scorpio Moon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-emerald-300 font-medium mb-2">Today's Focus</label>
                    <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                      <option>All Planets</option>
                      <option>Personal Planets (Sun, Moon, Mercury, Venus, Mars)</option>
                      <option>Social Planets (Jupiter, Saturn)</option>
                      <option>Outer Planets (Uranus, Neptune, Pluto)</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-300 font-medium mb-2">Your Chart</label>
                    <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-purple-500/20 text-white focus:border-purple-500/40 focus:outline-none">
                      <option>Alex - Libra Sun, Cancer Moon</option>
                      <option>Sarah - Aries Sun, Pisces Moon</option>
                      <option>Mike - Capricorn Sun, Scorpio Moon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-purple-300 font-medium mb-2">Partner's Chart</label>
                    <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-purple-500/20 text-white focus:border-purple-500/40 focus:outline-none">
                      <option>Select a chart...</option>
                      <option>Sarah - Aries Sun, Pisces Moon</option>
                      <option>Mike - Capricorn Sun, Scorpio Moon</option>
                      <option>Emma - Gemini Sun, Taurus Moon</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-purple-300 font-medium mb-2">Connection Type</label>
                  <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-purple-500/20 text-white focus:border-purple-500/40 focus:outline-none">
                    <option>Romantic Partnership</option>
                    <option>Friendship</option>
                    <option>Family</option>
                    <option>Professional</option>
                    <option>General Compatibility</option>
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={generateOverlay}
              disabled={isGenerating || isTextGenerating}
              className={`mt-6 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 ${
                overlayMode === 'daily' ? 'btn-cosmic' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {(isGenerating || isTextGenerating) ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isTextGenerating ? 'Generating Text...' : 'Generating Overlay...'}
                </span>
              ) : (
                `Generate ${overlayMode === 'daily' ? 'Daily' : 'Connection'} Overlay`
              )}
            </button>
          </div>
        </div>

        {/* Generated Text Display */}
        {generatedText && (
          <div className="mb-8">
            <div className="mb-4 p-4 glass-morphism rounded-xl border border-emerald-500/20">
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Generated Interpretation</h3>
              <p className="text-gray-300">{generatedText}</p>
            </div>
          </div>
        )}

        {/* Current Overlay */}
        {currentOverlay && (
          <div className="glass-morphism rounded-2xl p-6 mb-8 cosmic-glow">
            <h3 className="text-xl font-mystical font-semibold text-cosmic mb-4">
              Current Overlay
            </h3>
            <div className={`rounded-xl p-6 border ${
              overlayMode === 'daily' 
                ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-emerald-500/30'
                : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-lg font-semibold ${
                  overlayMode === 'daily' ? 'text-emerald-300' : 'text-purple-300'
                }`}>
                  {currentOverlay.title}
                </h4>
                <span className="text-sm text-gray-400">{currentOverlay.duration}</span>
              </div>
              <p className="text-gray-300 mb-4">{currentOverlay.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    overlayMode === 'daily' ? 'text-emerald-300' : 'text-purple-300'
                  }`}>
                    {currentOverlay.type}
                  </span>
                  <div className="flex space-x-1">
                    {currentOverlay.planets.map((planet, index) => (
                      <span key={index} className={`text-xs px-2 py-1 rounded ${
                        overlayMode === 'daily' 
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {planet}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    overlayMode === 'daily' ? 'btn-cosmic' : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}>
                    Play
                  </button>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:transition-colors border ${
                    overlayMode === 'daily' 
                      ? 'hover:text-emerald-300 border-emerald-500/30'
                      : 'hover:text-purple-300 border-purple-500/30'
                  }`}>
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overlay Library */}
        <div className="glass-morphism rounded-2xl p-6">
          <h3 className="text-xl font-mystical font-semibold text-cosmic mb-6">
            Overlay Library
          </h3>
          
          <div className="space-y-4">
            {sampleOverlays.map((overlay) => (
              <div key={overlay.id} className="glass-morphism-strong rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-emerald-300">{overlay.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{overlay.duration}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      overlay.status === 'Playing' ? 'bg-green-500/20 text-green-300' :
                      overlay.status === 'Paused' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {overlay.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-3">{overlay.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-300 text-sm font-medium">{overlay.type}</span>
                    <div className="flex space-x-1">
                      {overlay.planets.map((planet, index) => (
                        <span key={index} className="text-xs bg-emerald-500/20 px-2 py-1 rounded text-emerald-300">
                          {planet}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="btn-cosmic px-3 py-1 rounded text-xs font-medium">
                      {overlay.status === 'Playing' ? 'Pause' : 'Play'}
                    </button>
                    <button className="px-3 py-1 rounded text-xs font-medium text-gray-400 hover:text-emerald-300 transition-colors">
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overlay Settings */}
        <div className="glass-morphism rounded-2xl p-6 mt-8">
          <h3 className="text-xl font-mystical font-semibold text-cosmic mb-6">
            Overlay Settings
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Visual Style</label>
                <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                  <option>Particle System</option>
                  <option>Geometric Patterns</option>
                  <option>Organic Forms</option>
                  <option>Wave Systems</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Color Palette</label>
                <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                  <option>Cosmic Blues</option>
                  <option>Fire Reds</option>
                  <option>Earth Greens</option>
                  <option>Water Purples</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Animation Speed</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2.0" 
                  step="0.1" 
                  defaultValue="1.0"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Opacity</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="10" 
                  defaultValue="80"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 