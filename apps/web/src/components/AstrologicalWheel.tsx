'use client';

import React from 'react';
import GenreDropdown from './GenreDropdown';
import UniversalChartWheel from './UniversalChartWheel';

interface Planet {
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
}

interface AstrologicalWheelProps {
  planets: Planet[];
  aspects: Aspect[];
  size?: number;
  isPlaying?: boolean;
  currentHouse?: number;
  showHighlight?: boolean;
  onHouseClick?: (houseNumber: number) => void;
  onGenreChange?: (genre: string) => void;
}

export default function AstrologicalWheel({
  planets,
  aspects,
  size = 400,
  isPlaying = false,
  currentHouse = 1,
  showHighlight = false,
  onHouseClick,
  onGenreChange
}: AstrologicalWheelProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.15;
  const houseRadius = size * 0.35;
  const planetRadius = size * 0.25;

  // Zodiac signs in order
  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  // House characteristics
  const houseCharacteristics = [
    'Identity', 'Values', 'Communication', 'Home', 'Creativity', 'Health',
    'Partnerships', 'Transformation', 'Philosophy', 'Career', 'Community', 'Spirituality'
  ];

  return (
    <div className="relative">
      {/* Genre Dropdown - positioned absolutely in top-left corner */}
      {onGenreChange && (
        <div className="absolute top-2 left-2 z-10">
          <GenreDropdown onGenreChange={onGenreChange} />
        </div>
      )}
      
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