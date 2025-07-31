'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Planet {
  id: string;
  name: string;
  symbol: string;
  color: string;
  angle: number;
  house: number;
  sign: string;
  degree: number;
  position?: { house: number; sign: string; degree: number };
}

interface Aspect {
  from: string;
  to: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  angle: number;
  orb: number;
}

interface UniversalChartWheelProps {
  planets: Planet[];
  aspects: Aspect[];
  size?: number;
  isPlaying?: boolean;
  currentHouse?: number;
  showHighlight?: boolean;
  onHouseClick?: (houseNumber: number) => void;
  onGenreChange?: (genre: string) => void;
  // Enhanced sandbox features
  isInteractive?: boolean;
  onPlanetClick?: (planet: Planet) => void;
  onWheelRotate?: (rotation: number) => void;
  wheelRotation?: number;
  showAspectLines?: boolean;
  draggable?: boolean;
  onPlanetDrop?: (planet: Planet, house: number) => void;
  onPlanetDragStart?: (planet: Planet) => void;
  onPlanetDragEnd?: () => void;
  dragOverHouse?: number | null;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'Chiron': '⚷',
  'Lilith': '⚸',
  'North Node': '☊',
  'South Node': '☋',
  'Ceres': '⚳',
  'Juno': '⚴',
  'Vesta': '⚵',
  'Pallas': '⚶',
  'Eris': '⚷'
};

const ASPECT_COLORS = {
  conjunction: '#fbbf24',
  opposition: '#ef4444',
  trine: '#10b981',
  square: '#f59e0b',
  sextile: '#3b82f6'
};

export default function UniversalChartWheel({
  planets,
  aspects,
  size = 400,
  isPlaying = false,
  currentHouse = 1,
  showHighlight = false,
  onHouseClick,
  onGenreChange,
  isInteractive = false,
  onPlanetClick,
  onWheelRotate,
  wheelRotation = 0,
  showAspectLines = true,
  draggable = false,
  onPlanetDrop,
  onPlanetDragStart,
  onPlanetDragEnd,
  dragOverHouse = null
}: UniversalChartWheelProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.15;
  const houseRadius = size * 0.35;
  const planetRadius = size * 0.25;
  const zodiacRadius = size * 0.42;

  // Enhanced sandbox functionality
  const getSignForHouse = (houseNumber: number): string => {
    const rotationIndex = Math.floor(wheelRotation / 30);
    const signIndex = (houseNumber - 1 + rotationIndex) % 12;
    return ZODIAC_SIGNS[signIndex];
  };

  const handleWheelClick = (e: React.MouseEvent) => {
    if (!isInteractive || !onWheelRotate) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
    const normalizedAngle = (angle + 90 + 360) % 360;
    
    // Snap to 30-degree increments
    const snappedAngle = Math.round(normalizedAngle / 30) * 30;
    onWheelRotate(snappedAngle);
  };

  const handleHouseDragOver = (e: React.DragEvent, houseNumber: number) => {
    if (!draggable) return;
    e.preventDefault();
  };

  const handleHouseDrop = (e: React.DragEvent, houseNumber: number) => {
    if (!draggable || !onPlanetDrop) return;
    e.preventDefault();
    
    const planetData = e.dataTransfer.getData('text/plain');
    try {
      const planet = JSON.parse(planetData);
      onPlanetDrop(planet, houseNumber);
    } catch (error) {
      console.error('Failed to parse planet data:', error);
    }
  };

  const handlePlanetDragStart = (e: React.DragEvent, planet: Planet) => {
    if (!draggable || !onPlanetDragStart) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(planet));
    onPlanetDragStart(planet);
  };

  return (
    <div className="relative">
      {/* Interactive overlay for wheel rotation */}
      {isInteractive && (
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleWheelClick}
          title="Click to rotate the wheel"
        />
      )}
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* Enhanced gradients for planets */}
          {planets.map((planet) => (
            <radialGradient key={planet.id || planet.name} id={`${planet.name.toLowerCase()}-gradient`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor={planet.color}/>
              <stop offset="100%" stopColor={`${planet.color}80`}/>
            </radialGradient>
          ))}
          
          {/* Enhanced glow filter */}
          <filter id="planet-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Enhanced house highlight filter */}
          <filter id="house-highlight">
            <feGaussianBlur stdDeviation="5" result="highlightBlur"/>
            <feMerge>
              <feMergeNode in="highlightBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Earth gradient */}
          <radialGradient id="earth-gradient" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#8b5cf680"/>
          </radialGradient>
        </defs>

        {/* Background circle with enhanced styling */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={outerRadius} 
          fill="none" 
          stroke="rgba(16, 185, 129, 0.2)" 
          strokeWidth="1"
        />

        {/* Zodiac ring with degree markers */}
        {Array.from({ length: 360 }, (_, i) => {
          if (i % 30 === 0) { // Major degree markers every 30 degrees
            const angle = (i * Math.PI) / 180;
            const startX = centerX + Math.cos(angle) * (zodiacRadius - 10);
            const startY = centerY + Math.sin(angle) * (zodiacRadius - 10);
            const endX = centerX + Math.cos(angle) * (zodiacRadius + 10);
            const endY = centerY + Math.sin(angle) * (zodiacRadius + 10);
            
            return (
              <line
                key={`degree-${i}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="rgba(16, 185, 129, 0.6)"
                strokeWidth="2"
              />
            );
          } else if (i % 5 === 0) { // Minor degree markers every 5 degrees
            const angle = (i * Math.PI) / 180;
            const startX = centerX + Math.cos(angle) * (zodiacRadius - 5);
            const startY = centerY + Math.sin(angle) * (zodiacRadius - 5);
            const endX = centerX + Math.cos(angle) * (zodiacRadius + 5);
            const endY = centerY + Math.sin(angle) * (zodiacRadius + 5);
            
            return (
              <line
                key={`degree-${i}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth="1"
              />
            );
          }
          return null;
        })}

        {/* House division lines */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30) - 180; // Start from left (9:00 position)
          const startX = centerX + Math.cos((angle * Math.PI) / 180) * innerRadius;
          const startY = centerY + Math.sin((angle * Math.PI) / 180) * innerRadius;
          const endX = centerX + Math.cos((angle * Math.PI) / 180) * outerRadius;
          const endY = centerY + Math.sin((angle * Math.PI) / 180) * outerRadius;
          
          return (
            <line
              key={`house-line-${i}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="rgba(16, 185, 129, 0.4)"
              strokeWidth="2"
            />
          );
        })}

        {/* House segments with enhanced highlighting */}
        {Array.from({ length: 12 }, (_, i) => {
          const houseNumber = i + 1;
          const startAngle = (i * 30) - 180;
          const endAngle = ((i + 1) * 30) - 180;
          const isHighlighted = showHighlight && currentHouse === houseNumber;
          const isDragOver = dragOverHouse === houseNumber;
          
          // Create house segment path
          const innerStartX = centerX + Math.cos((startAngle * Math.PI) / 180) * innerRadius;
          const innerStartY = centerY + Math.sin((startAngle * Math.PI) / 180) * innerRadius;
          const outerStartX = centerX + Math.cos((startAngle * Math.PI) / 180) * outerRadius;
          const outerStartY = centerY + Math.sin((startAngle * Math.PI) / 180) * outerRadius;
          const outerEndX = centerX + Math.cos((endAngle * Math.PI) / 180) * outerRadius;
          const outerEndY = centerY + Math.sin((endAngle * Math.PI) / 180) * outerRadius;
          const innerEndX = centerX + Math.cos((endAngle * Math.PI) / 180) * innerRadius;
          const innerEndY = centerY + Math.sin((endAngle * Math.PI) / 180) * innerRadius;
          
          const pathData = `
            M ${innerStartX} ${innerStartY}
            L ${outerStartX} ${outerStartY}
            A ${outerRadius} ${outerRadius} 0 0 1 ${outerEndX} ${outerEndY}
            L ${innerEndX} ${innerEndY}
            A ${innerRadius} ${innerRadius} 0 0 0 ${innerStartX} ${innerStartY}
            Z
          `;
          
          return (
            <path
              key={`house-segment-${houseNumber}`}
              d={pathData}
              fill={
                isDragOver ? "rgba(16, 185, 129, 0.4)" :
                isHighlighted ? "rgba(16, 185, 129, 0.15)" : 
                "rgba(16, 185, 129, 0.03)"
              }
              stroke={
                isDragOver ? "rgba(16, 185, 129, 0.8)" :
                isHighlighted ? "rgba(16, 185, 129, 0.6)" : 
                "rgba(16, 185, 129, 0.1)"
              }
              strokeWidth={isHighlighted || isDragOver ? "2" : "1"}
              filter={isHighlighted || isDragOver ? "url(#house-highlight)" : "none"}
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => onHouseClick?.(houseNumber)}
              onDragOver={(e) => handleHouseDragOver(e, houseNumber)}
              onDrop={(e) => handleHouseDrop(e, houseNumber)}
              style={{ cursor: onHouseClick || draggable ? 'pointer' : 'default' }}
            />
          );
        })}

        {/* Zodiac signs with enhanced styling */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = (i * 30) - 180;
          const radius = zodiacRadius + 25;
          const x = centerX + Math.cos((angle * Math.PI) / 180) * radius;
          const y = centerY + Math.sin((angle * Math.PI) / 180) * radius;
          
          return (
            <g key={`zodiac-${sign}`}>
              {/* Zodiac symbol */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ 
                  fontSize: '16px', 
                  fill: '#10b981', 
                  fontWeight: 'bold',
                  fontFamily: 'serif'
                }}
              >
                {getZodiacSymbol(sign)}
              </text>
              {/* Sign name */}
              <text
                x={x}
                y={y + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ 
                  fontSize: '10px', 
                  fill: '#6b7280',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}
              >
                {sign.substring(0, 3)}
              </text>
            </g>
          );
        })}

        {/* House numbers with enhanced styling */}
        {Array.from({ length: 12 }, (_, i) => {
          const houseNumber = i + 1;
          const angle = (i * 30) - 180 + 15; // Offset by 15 degrees to center in house
          const radius = houseRadius;
          const x = centerX + Math.cos((angle * Math.PI) / 180) * radius;
          const y = centerY + Math.sin((angle * Math.PI) / 180) * radius;
          
          return (
            <text
              key={`house-${houseNumber}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ 
                fontSize: '12px', 
                fill: '#34d399', 
                fontWeight: 'bold',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              {houseNumber}
            </text>
          );
        })}

        {/* Enhanced aspect lines */}
        {showAspectLines && aspects.map((aspect, i) => {
          const fromPlanet = planets.find(p => p.name === aspect.from);
          const toPlanet = planets.find(p => p.name === aspect.to);
          
          if (!fromPlanet || !toPlanet) return null;
          
          const fromAngle = fromPlanet.angle - 180;
          const toAngle = toPlanet.angle - 180;
          const fromX = centerX + Math.cos((fromAngle * Math.PI) / 180) * (innerRadius - 15);
          const fromY = centerY + Math.sin((fromAngle * Math.PI) / 180) * (innerRadius - 15);
          const toX = centerX + Math.cos((toAngle * Math.PI) / 180) * (innerRadius - 15);
          const toY = centerY + Math.sin((toAngle * Math.PI) / 180) * (innerRadius - 15);
          
          return (
            <line
              key={`aspect-${i}`}
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke={ASPECT_COLORS[aspect.type]}
              strokeWidth="2"
              opacity="0.8"
              strokeDasharray={aspect.type === 'opposition' ? "5,5" : "none"}
            />
          );
        })}

        {/* Enhanced planets with consistent styling */}
        {planets.map((planet) => {
          const angle = planet.angle - 180; // Adjust for our coordinate system
          const radius = planetRadius;
          const x = centerX + Math.cos((angle * Math.PI) / 180) * radius;
          const y = centerY + Math.sin((angle * Math.PI) / 180) * radius;
          const symbol = PLANET_SYMBOLS[planet.name] || planet.symbol;
          
          return (
            <g 
              key={planet.id || planet.name}
              draggable={draggable}
              onDragStart={(e) => handlePlanetDragStart(e, planet)}
              onDragEnd={onPlanetDragEnd}
              onClick={() => onPlanetClick?.(planet)}
              style={{ cursor: draggable || onPlanetClick ? 'pointer' : 'default' }}
            >
              {/* Enhanced planet glow */}
              <circle
                cx={x}
                cy={y}
                r="12"
                fill={`url(#${planet.name.toLowerCase()}-gradient)`}
                filter="url(#planet-glow)"
              />
              {/* Planet symbol */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ 
                  fontSize: '16px', 
                  fill: '#ffffff',
                  fontWeight: 'bold',
                  fontFamily: 'serif'
                }}
              >
                {symbol}
              </text>
              {/* Planet name */}
              <text
                x={x}
                y={y + 20}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ 
                  fontSize: '10px', 
                  fill: '#10b981',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: '500'
                }}
              >
                {planet.name}
              </text>
              {/* Degree */}
              <text
                x={x}
                y={y + 32}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ 
                  fontSize: '8px', 
                  fill: '#6b7280',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}
              >
                {planet.degree.toFixed(1)}°
              </text>
            </g>
          );
        })}

        {/* Enhanced center - Earth */}
        <circle cx={centerX} cy={centerY} r="15" fill="url(#earth-gradient)" filter="url(#planet-glow)"/>
        <circle cx={centerX} cy={centerY} r="8" fill="#ffffff"/>
        <text 
          x={centerX} 
          y={centerY} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          style={{ fontSize: '12px', fill: '#000000', fontWeight: 'bold' }}
        >
          ⊕
        </text>
      </svg>
    </div>
  );
}

// Helper function to get zodiac symbols
function getZodiacSymbol(sign: string): string {
  const symbols: Record<string, string> = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓'
  };
  return symbols[sign] || sign.substring(0, 1);
} 