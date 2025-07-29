'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AstroChart } from '../types';
import { getZodiacTailwind } from '../lib/zodiacColors';
import AudioVisualizerOverlay from './AudioVisualizerOverlay';

interface AnimatedChartWheelProps {
  chart: AstroChart;
  isPlaying: boolean;
  currentHouse: number;
  duration: number; // Total duration in seconds
  onHouseChange?: (house: number) => void;
}

// Zodiac glyphs
const zodiacGlyphs = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓'
};

// Planet glyphs
const planetGlyphs = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇'
};

export default function AnimatedChartWheel({ 
  chart, 
  isPlaying, 
  currentHouse, 
  duration,
  onHouseChange 
}: AnimatedChartWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState(0);
  
  const secondsPerHouse = duration / 12;
  const wheelSize = 400;
  const centerX = wheelSize / 2;
  const centerY = wheelSize / 2;
  const outerRadius = 180;
  const middleRadius = 140;
  const innerRadius = 100;

  // Calculate house positions (counter-clockwise, starting at 6 o'clock)
  const getHousePosition = (houseNumber: number) => {
    // Start at 6 o'clock (180 degrees) and go counter-clockwise
    const startAngle = 180;
    const houseAngle = 30; // 360° / 12 houses
    const angle = startAngle - (houseNumber - 1) * houseAngle;
    const radians = (angle * Math.PI) / 180;
    
    return {
      x: centerX + Math.cos(radians) * middleRadius,
      y: centerY + Math.sin(radians) * middleRadius,
      angle: angle,
      radians: radians
    };
  };

  // Get zodiac sign from degree
  const getZodiacSignFromDegree = (degree: number): string => {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(degree / 30);
    return signs[signIndex % 12];
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      setCurrentTime(0);
      return;
    }

    const animate = (timestamp: number) => {
      const elapsed = (timestamp % (duration * 1000)) / 1000;
      setCurrentTime(elapsed);
      
      const newHouse = Math.floor(elapsed / secondsPerHouse) + 1;
      if (newHouse !== currentHouse && onHouseChange) {
        onHouseChange(Math.min(newHouse, 12));
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration, secondsPerHouse, currentHouse, onHouseChange]);

  // Generate house segments
  const generateHouseSegments = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const houseNumber = i + 1;
      const position = getHousePosition(houseNumber);
      const isActive = houseNumber === currentHouse && isPlaying;
      
      // Get house cusp data
      const houseData = chart.houses?.[houseNumber];
      const signName = houseData ? getZodiacSignFromDegree(houseData.cusp_longitude) : 'Aries';
      const zodiacClasses = getZodiacTailwind(signName);
      
      return {
        houseNumber,
        position,
        isActive,
        signName,
        zodiacClasses,
        houseData
      };
    });
  };

  // Generate planet positions
  const generatePlanetPositions = () => {
    return Object.entries(chart.planets).map(([planetName, planetData]) => {
      const degree = planetData.sign.degree;
      const angle = (degree - 180) * (Math.PI / 180); // Adjust for 6 o'clock start
      const radius = middleRadius - 20; // Slightly inside house boundaries
      
      return {
        planetName,
        planetData,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        glyph: planetGlyphs[planetName as keyof typeof planetGlyphs] || planetName
      };
    });
  };

  const houseSegments = generateHouseSegments();
  const planetPositions = generatePlanetPositions();

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden">
      {/* Audio Visualizer Overlay */}
      <AudioVisualizerOverlay
        isPlaying={isPlaying}
        currentHouse={currentHouse}
        duration={duration}
        chart={chart}
        className="z-10"
      />
      
      <svg
        ref={svgRef}
        width={wheelSize}
        height={wheelSize}
        viewBox={`0 0 ${wheelSize} ${wheelSize}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto max-w-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />

        {/* Outer ring - Zodiac signs */}
        {Array.from({ length: 12 }, (_, i) => {
          // Rotate zodiac signs to align with house positions
          const angle = (i * 30 - 180 + 30) * (Math.PI / 180); // -180 to align with houses
          const signName = getZodiacSignFromDegree(i * 30);
          const zodiacClasses = getZodiacTailwind(signName);
          const x = centerX + Math.cos(angle) * (outerRadius + 25);
          const y = centerY + Math.sin(angle) * (outerRadius + 25);
          
          return (
            <g key={`zodiac-${i}`}>
                             <text
                 x={x}
                 y={y}
                 textAnchor="middle"
                 dominantBaseline="middle"
                 className={`text-xs font-bold ${zodiacClasses.text}`}
                 fill="currentColor"
               >
                 {zodiacGlyphs[signName as keyof typeof zodiacGlyphs]}
               </text>
               <text
                 x={x}
                 y={y + 15}
                 textAnchor="middle"
                 dominantBaseline="middle"
                 className="text-xs text-gray-400 tracking-tight"
                 style={{ fontSize: '10px' }}
                 fill="currentColor"
               >
                 {signName}
               </text>
            </g>
          );
        })}

        {/* House segments */}
        {houseSegments.map(({ houseNumber, position, isActive, signName, zodiacClasses, houseData }) => (
          <g key={`house-${houseNumber}`}>
            {/* House segment path */}
            <path
              d={`M ${centerX} ${centerY} L ${position.x} ${position.y} A ${middleRadius} ${middleRadius} 0 0 1 ${centerX + Math.cos(position.radians - Math.PI / 6) * middleRadius} ${centerY + Math.sin(position.radians - Math.PI / 6) * middleRadius} Z`}
              fill={isActive ? `${zodiacClasses.bg}40` : "rgba(255,255,255,0.05)"}
              stroke={isActive ? zodiacClasses.text.replace('text-', 'stroke-') : "rgba(255,255,255,0.2)"}
              strokeWidth={isActive ? "3" : "1"}
              className={`transition-all duration-500 ${isActive ? 'animate-pulse' : ''}`}
            />
            
                         {/* House number */}
             <text
               x={position.x}
               y={position.y}
               textAnchor="middle"
               dominantBaseline="middle"
                                className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}
                 style={{ fontSize: '10px' }}
               fill="currentColor"
             >
               {houseNumber}
             </text>
            
                         {/* House cusp degree */}
             {houseData && (
               <text
                 x={centerX + Math.cos(position.radians) * (middleRadius + 20)}
                 y={centerY + Math.sin(position.radians) * (middleRadius + 20)}
                 textAnchor="middle"
                 dominantBaseline="middle"
                 className="text-xs text-gray-500 tracking-tight"
                 style={{ fontSize: '8px' }}
                 fill="currentColor"
               >
                 {houseData.cusp_longitude.toFixed(0)}°
               </text>
             )}
          </g>
        ))}

        {/* Planet positions */}
        {planetPositions.map(({ planetName, planetData, x, y, glyph }) => {
          const zodiacClasses = getZodiacTailwind(planetData.sign.name);
          return (
            <g key={`planet-${planetName}`}>
                             <circle
                 cx={x}
                 cy={y}
                 r="6"
                 fill={zodiacClasses.bg}
                 stroke="white"
                 strokeWidth="1"
               />
               <text
                 x={x}
                 y={y}
                 textAnchor="middle"
                 dominantBaseline="middle"
                 className="text-xs font-bold text-white"
                 fill="currentColor"
                 dy="0.1em"
                 style={{ fontSize: '8px' }}
               >
                 {glyph}
               </text>
              {planetData.retrograde && (
                <text
                  x={x + 12}
                  y={y - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs text-red-400"
                  fill="currentColor"
                >
                  R
                </text>
              )}
            </g>
          );
        })}

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="20"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        />
        
        {/* Current house indicator */}
        {isPlaying && (
          <circle
            cx={centerX}
            cy={centerY}
            r="15"
            fill="rgba(255,255,255,0.2)"
            className="animate-ping"
          />
        )}
      </svg>

      {/* Playback progress indicator */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 rounded-lg p-2">
          <div className="flex justify-between text-xs text-gray-300">
            <span>House {currentHouse}</span>
            <span>{Math.floor(currentTime)}s / {duration}s</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
            <div 
              className="bg-purple-500 h-1 rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 