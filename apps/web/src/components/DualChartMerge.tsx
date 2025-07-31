'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AstroChart } from '../types';

interface DualChartMergeProps {
  chart1: AstroChart | null;
  chart2: AstroChart | null;
  onMergeComplete: () => void;
  isMerging: boolean;
  onStartMerge: () => void;
}

interface MergedPlanet {
  name: string;
  chart1Position?: { longitude: number; sign: string; house: number };
  chart2Position?: { longitude: number; sign: string; house: number };
  color: string;
  symbol: string;
}

const PLANET_COLORS = {
  Sun: '#fbbf24',
  Moon: '#a3a3a3',
  Mercury: '#34d399',
  Venus: '#f87171',
  Mars: '#ef4444',
  Jupiter: '#f59e0b',
  Saturn: '#8b5cf6'
};

const PLANET_SYMBOLS = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄'
};

export default function DualChartMerge({ 
  chart1, 
  chart2, 
  onMergeComplete, 
  isMerging, 
  onStartMerge 
}: DualChartMergeProps) {
  const [mergeStage, setMergeStage] = useState<'separate' | 'merging' | 'merged'>('separate');
  const [mergedPlanets, setMergedPlanets] = useState<MergedPlanet[]>([]);

  useEffect(() => {
    if (chart1 && chart2 && isMerging) {
      startMergeAnimation();
    }
  }, [chart1, chart2, isMerging]);

  const startMergeAnimation = () => {
    setMergeStage('separate');
    
    // Prepare merged planets data
    const planets: MergedPlanet[] = [];
    const allPlanetNames = new Set([
      ...Object.keys(chart1?.planets || {}),
      ...Object.keys(chart2?.planets || {})
    ]);

    allPlanetNames.forEach(planetName => {
      const planet1 = chart1?.planets[planetName];
      const planet2 = chart2?.planets[planetName];
      
      planets.push({
        name: planetName,
        chart1Position: planet1 ? {
          longitude: planet1.longitude,
          sign: planet1.sign.name,
          house: planet1.house
        } : undefined,
        chart2Position: planet2 ? {
          longitude: planet2.longitude,
          sign: planet2.sign.name,
          house: planet2.house
        } : undefined,
        color: PLANET_COLORS[planetName as keyof typeof PLANET_COLORS] || '#10b981',
        symbol: PLANET_SYMBOLS[planetName as keyof typeof PLANET_SYMBOLS] || '●'
      });
    });

    setMergedPlanets(planets);

    // Start animation sequence
    setTimeout(() => {
      setMergeStage('merging');
      
      // Complete merge after animation
      setTimeout(() => {
        setMergeStage('merged');
        onMergeComplete();
      }, 2000); // 2 seconds for merge animation
    }, 1000); // 1 second delay before starting merge
  };

  const renderChartWheel = (chart: AstroChart | null, position: 'left' | 'right' | 'center', isMerged = false) => {
    if (!chart) return null;

    const planets = Object.entries(chart.planets);
    const wheelSize = position === 'center' ? 120 : 100;

    return (
      <motion.div
        className={`relative ${position === 'center' ? 'w-32 h-32' : 'w-24 h-24'} chart-wheel rounded-full border-2 border-emerald-500/30 flex items-center justify-center`}
        style={{ width: wheelSize, height: wheelSize }}
        initial={position === 'center' ? { scale: 0, opacity: 0 } : {}}
        animate={{
          x: mergeStage === 'merging' && position !== 'center' ? 
            (position === 'left' ? -50 : 50) : 0,
          y: mergeStage === 'merging' && position !== 'center' ? -20 : 0,
          scale: mergeStage === 'merging' && position !== 'center' ? 0.8 : 1,
          opacity: mergeStage === 'merged' && position !== 'center' ? 0 : 1
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        {/* Render planets */}
        {planets.map(([planetName, planetData]) => {
          const angle = (planetData.longitude - 90) * (Math.PI / 180);
          const radius = wheelSize / 2 - 20;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const color = PLANET_COLORS[planetName as keyof typeof PLANET_COLORS] || '#10b981';
          const symbol = PLANET_SYMBOLS[planetName as keyof typeof PLANET_SYMBOLS] || '●';

          return (
            <motion.div
              key={planetName}
              className="absolute w-6 h-6 rounded-full flex items-center justify-center cosmic-glow"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                background: `linear-gradient(135deg, ${color}, ${color}80)`,
                border: `2px solid ${color}`
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <span className="text-xs text-white font-bold">{symbol}</span>
            </motion.div>
          );
        })}

        {/* Center */}
        <div className="absolute w-8 h-8 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center cosmic-glow">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
      </motion.div>
    );
  };

  const renderMergedChart = () => {
    if (mergeStage !== 'merged') return null;

    return (
      <motion.div
        className="relative w-40 h-40 chart-wheel rounded-full border-2 border-emerald-500/30 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Render merged planets */}
        {mergedPlanets.map((planet) => {
          // Use chart1 position as primary, chart2 as secondary
          const position = planet.chart1Position || planet.chart2Position;
          if (!position) return null;

          const angle = (position.longitude - 90) * (Math.PI / 180);
          const radius = 60;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={planet.name}
              className="absolute w-8 h-8 rounded-full flex items-center justify-center cosmic-glow"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                background: `linear-gradient(135deg, ${planet.color}, ${planet.color}80)`,
                border: `2px solid ${planet.color}`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span className="text-sm text-white font-bold">{planet.symbol}</span>
              {planet.chart1Position && planet.chart2Position && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">2</span>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Center */}
        <div className="absolute w-12 h-12 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center cosmic-glow">
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </div>
      </motion.div>
    );
  };

  if (!chart1 || !chart2) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-300 font-mystical">Both charts are required for overlay</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Chart Labels */}
      <div className="flex justify-center space-x-8 mb-8">
        <div className="text-center">
          <h3 className="text-emerald-300 font-mystical font-medium">Your Chart</h3>
          <p className="text-xs text-gray-400 font-mystical">
            {chart1.metadata.birth_datetime}
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-violet-300 font-mystical font-medium">Daily Chart</h3>
          <p className="text-xs text-gray-400 font-mystical">
            {chart2.metadata.birth_datetime}
          </p>
        </div>
      </div>

      {/* Animation Container */}
      <div className="flex justify-center items-center space-x-16 py-12">
        {/* Chart 1 */}
        <motion.div
          className="flex flex-col items-center"
          animate={{
            opacity: mergeStage === 'merged' ? 0 : 1
          }}
          transition={{ duration: 1 }}
        >
          {renderChartWheel(chart1, 'left')}
        </motion.div>

        {/* Merge Animation */}
        <AnimatePresence>
          {mergeStage === 'merging' && (
            <motion.div
              className="absolute"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center cosmic-glow">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart 2 */}
        <motion.div
          className="flex flex-col items-center"
          animate={{
            opacity: mergeStage === 'merged' ? 0 : 1
          }}
          transition={{ duration: 1 }}
        >
          {renderChartWheel(chart2, 'right')}
        </motion.div>
      </div>

      {/* Merged Chart */}
      <div className="flex justify-center">
        {renderMergedChart()}
      </div>

      {/* Merge Button */}
      {!isMerging && (
        <div className="text-center">
          <button
            onClick={onStartMerge}
            className="px-8 py-4 btn-cosmic rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-mystical text-base tracking-wide"
          >
            Merge Charts
          </button>
        </div>
      )}

      {/* Animation Status */}
      {isMerging && (
        <div className="text-center">
          <motion.div
            className="flex items-center justify-center space-x-3 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-3 h-3 bg-emerald-400 rounded-full pulse-glow"></div>
            <span className="text-emerald-400 font-medium font-mystical tracking-wide">
              {mergeStage === 'merging' ? 'Merging Charts...' : 'Merge Complete'}
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
} 