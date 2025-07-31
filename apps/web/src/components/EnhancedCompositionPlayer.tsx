'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '../context/SubscriptionContext';
import { useGenre } from '../context/GenreContext';
import { useAuth } from '../context/AuthContext';
import { AstroChart } from '../types';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface EnhancedCompositionPlayerProps {
  chartData: AstroChart;
  onCompositionGenerated?: (composition: any) => void;
  onInterpretationGenerated?: (interpretation: string) => void;
}

export default function EnhancedCompositionPlayer({
  chartData,
  onCompositionGenerated,
  onInterpretationGenerated
}: EnhancedCompositionPlayerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentHouse, setCurrentHouse] = useState(0);
  const [composition, setComposition] = useState<any>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const { subscription, getDurationConfig, isFeatureEnabled } = useSubscription();
  const { selectedGenre } = useGenre();
  const { user } = useAuth();

  const durationConfig = getDurationConfig();

  const generateComposition = async () => {
    setIsGenerating(true);
    try {
      // Mock composition generation - replace with actual API call
      const mockComposition = {
        houses: Array.from({ length: 12 }, (_, i) => ({
          houseNumber: i + 1,
          planets: Object.entries(chartData.planets)
            .filter(([_, planet]) => planet.house === i + 1)
            .map(([planet, _]) => planet),
          duration: durationConfig.secondsPerHouse,
          melody: {
            notes: [60 + i, 62 + i, 64 + i],
            rhythm: [0.5, 0.5, 1.0],
            harmony: [60 + i + 12, 64 + i + 12]
          },
          transition: {
            type: 'smooth',
            duration: 0.5
          }
        })),
        totalDuration: durationConfig.totalDuration,
        key: 'C',
        tempo: 120,
        motifs: [[60, 62, 64]],
        interpretation: generateMockInterpretation()
      };

      setComposition(mockComposition);
      setInterpretation(mockComposition.interpretation);
      
      if (onCompositionGenerated) {
        onCompositionGenerated(mockComposition);
      }
      if (onInterpretationGenerated) {
        onInterpretationGenerated(mockComposition.interpretation);
      }

      console.log('Generated enhanced composition:', mockComposition);
    } catch (error) {
      console.error('Failed to generate composition:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockInterpretation = (): string => {
    const durationText = durationConfig.duration === 'premium' 
      ? 'expanded' 
      : 'cosmic';
    
    let interpretation = `This ${durationText} composition flows through all 12 houses of your astrological chart, creating a musical journey that reflects your unique celestial blueprint.\n\n`;

    // Generate house-specific interpretations
    for (let i = 1; i <= 12; i++) {
      const planets = Object.entries(chartData.planets)
        .filter(([_, planet]) => planet.house === i)
        .map(([planet, _]) => planet);

      if (planets.length === 0) {
        interpretation += `House ${i}: A serene passage representing ${getHouseTheme(i)}. The ambient tones create space for reflection.\n\n`;
      } else {
        const planetNames = planets.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
        interpretation += `House ${i}: ${planetNames} ${planets.length === 1 ? 'influences' : 'influence'} the ${getHouseTheme(i)} area of your life.\n\n`;
      }
    }

    if (durationConfig.duration === 'premium') {
      interpretation += `\nThis expanded composition allows for deeper exploration of each house's musical character, with richer harmonies and more detailed planetary interactions. The ${durationConfig.totalDuration / 60} minute journey provides a complete astrological soundscape.`;
    }

    return interpretation;
  };

  const getHouseTheme = (houseNumber: number): string => {
    const themes = {
      1: 'self and identity',
      2: 'values and resources',
      3: 'communication and learning',
      4: 'home and family',
      5: 'creativity and romance',
      6: 'work and health',
      7: 'partnerships and relationships',
      8: 'transformation and shared resources',
      9: 'philosophy and expansion',
      10: 'career and public image',
      11: 'friendships and aspirations',
      12: 'spirituality and subconscious'
    };
    return themes[houseNumber as keyof typeof themes];
  };

  const playComposition = async () => {
    if (!composition) return;
    
    setIsPlaying(true);
    setCurrentHouse(0);
    setProgress(0);

    // Simulate house-by-house playback
    for (let i = 0; i < composition.houses.length; i++) {
      setCurrentHouse(i + 1);
      setProgress((i / composition.houses.length) * 100);
      
      // Wait for house duration
      await new Promise(resolve => 
        setTimeout(resolve, composition.houses[i].duration * 1000)
      );
    }

    setIsPlaying(false);
    setCurrentHouse(0);
    setProgress(100);
  };

  const stopComposition = () => {
    setIsPlaying(false);
    setCurrentHouse(0);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Duration Configuration Display */}
      <div className="glass-morphism rounded-xl p-6 border border-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header text-xl">Composition Settings</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            subscription.tier === 'premium' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
          }`}>
            {subscription.tier === 'premium' ? 'Premium' : 'Free'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-300">{durationConfig.secondsPerHouse}s</div>
            <div className="text-sm text-gray-400">Per House</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-300">{durationConfig.totalDuration}s</div>
            <div className="text-sm text-gray-400">Total Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-300">{selectedGenre}</div>
            <div className="text-sm text-gray-400">Genre</div>
          </div>
        </div>
        
        <p className="text-sm text-gray-300 mt-4 font-mystical">
          {durationConfig.description}
        </p>
      </div>

      {/* Generation Controls */}
      <div className="flex space-x-4">
        <button
          onClick={generateComposition}
          disabled={isGenerating}
          className="btn-cosmic px-6 py-3 rounded-xl font-mystical disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </div>
          ) : (
            'Generate Composition'
          )}
        </button>

        {composition && (
          <>
            <button
              onClick={playComposition}
              disabled={isPlaying}
              className="px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 hover:bg-emerald-500/30 transition-colors font-mystical disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? 'Playing...' : 'Play'}
            </button>
            <button
              onClick={stopComposition}
              disabled={!isPlaying}
              className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors font-mystical disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Progress Display */}
      {isPlaying && (
        <div className="glass-morphism rounded-xl p-6 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 font-mystical">Progress</span>
            <span className="text-sm text-emerald-300 font-mystical">
              House {currentHouse} of 12
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-emerald-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* House Visualization */}
      {composition && (
        <div className="glass-morphism rounded-xl p-6 border border-emerald-500/20">
          <h3 className="section-header text-xl mb-4">House Composition</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {composition.houses.map((house: any, index: number) => (
              <div
                key={house.houseNumber}
                className={`p-4 rounded-lg border transition-all ${
                  currentHouse === house.houseNumber
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-gray-600 bg-gray-600/20'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white">House {house.houseNumber}</div>
                  <div className="text-sm text-gray-400">
                    {house.planets.length} planet{house.planets.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-emerald-300 mt-1">
                    {house.duration}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interpretation Display */}
      {interpretation && (
        <div className="glass-morphism rounded-xl p-6 border border-emerald-500/20">
          <h3 className="section-header text-xl mb-4">Musical Interpretation</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 font-mystical leading-relaxed whitespace-pre-line">
              {interpretation}
            </p>
          </div>
        </div>
      )}

      {/* Premium Upgrade Prompt */}
      {subscription.tier === 'free' && (
        <div className="glass-morphism rounded-xl p-6 border border-violet-500/20">
          <div className="text-center">
            <h3 className="section-header text-xl mb-2">Upgrade to Premium</h3>
            <p className="text-gray-300 font-mystical mb-4">
              Unlock expanded compositions with 30 seconds per house and deeper musical exploration
            </p>
            <button 
              onClick={() => setIsUpgradeModalOpen(true)}
              className="btn-cosmic px-6 py-3 rounded-xl font-mystical"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
} 