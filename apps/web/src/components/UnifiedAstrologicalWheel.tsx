'use client';

import React from 'react';
import UniversalChartWheel from './UniversalChartWheel';

interface Planet {
  id: string;
  name: string;
  symbol: string;
  angle: number;
  color: string;
  house: number;
  sign: string;
  degree: number;
}

interface Aspect {
  from: string;
  to: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  angle: number;
  orb: number;
}

interface UnifiedAstrologicalWheelProps {
  planets: Planet[];
  aspects: Aspect[];
  size?: number;
  isPlaying?: boolean;
  currentHouse?: number;
  showHighlight?: boolean;
  onHouseClick?: (houseNumber: number) => void;
  onGenreChange?: (genre: string) => void;
}

export default function UnifiedAstrologicalWheel({
  planets,
  aspects,
  size = 400,
  isPlaying = false,
  currentHouse = 1,
  showHighlight = false,
  onHouseClick,
  onGenreChange
}: UnifiedAstrologicalWheelProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.15;
  const houseRadius = size * 0.35;
  const planetRadius = size * 0.25;
  const zodiacRadius = size * 0.42;

  // Zodiac signs in order with proper symbols
  const zodiacSigns = [
    { name: 'Aries', symbol: '♈', element: 'Fire' },
    { name: 'Taurus', symbol: '♉', element: 'Earth' },
    { name: 'Gemini', symbol: '♊', element: 'Air' },
    { name: 'Cancer', symbol: '♋', element: 'Water' },
    { name: 'Leo', symbol: '♌', element: 'Fire' },
    { name: 'Virgo', symbol: '♍', element: 'Earth' },
    { name: 'Libra', symbol: '♎', element: 'Air' },
    { name: 'Scorpio', symbol: '♏', element: 'Water' },
    { name: 'Sagittarius', symbol: '♐', element: 'Fire' },
    { name: 'Capricorn', symbol: '♑', element: 'Earth' },
    { name: 'Aquarius', symbol: '♒', element: 'Air' },
    { name: 'Pisces', symbol: '♓', element: 'Water' }
  ];

  // Planet symbols with proper Unicode
  const planetSymbols: Record<string, string> = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
    Chiron: '⚷',
    Lilith: '⚸',
    'North Node': '☊',
    'South Node': '☋',
    Ceres: '⚳',
    Juno: '⚴',
    Vesta: '⚵',
    Pallas: '⚶',
    Eris: '⚷'
  };

  // Aspect colors with professional styling
  const aspectColors = {
    conjunction: '#fbbf24', // Yellow
    opposition: '#ef4444',   // Red
    trine: '#10b981',        // Green
    square: '#f59e0b',       // Orange
    sextile: '#3b82f6'       // Blue
  };

  return (
    <div className="relative">
      <UniversalChartWheel
        planets={planets}
        aspects={aspects}
        size={size}
        isPlaying={isPlaying}
        currentHouse={currentHouse}
        showHighlight={showHighlight}
        onHouseClick={onHouseClick}
        showAspectLines={true}
      />
    </div>
  );
} 