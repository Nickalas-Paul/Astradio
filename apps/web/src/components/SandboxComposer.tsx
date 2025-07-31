'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AstroChart, AspectData } from '../types';
import UniversalChartWheel from './UniversalChartWheel';

interface PlanetOrb {
  id: string;
  name: string;
  symbol: string;
  color: string;
  position?: { house: number; sign: string; degree: number };
  musicalProperties?: {
    instrument: string;
    baseFrequency: number;
    energy: number;
    effect: string;
  };
}

interface AspectInterpretation {
  type: string;
  planets: string[];
  meaning: string;
  musicalInfluence: string;
  orb: number;
}

interface SandboxComposerProps {
  onChartUpdate: (chart: AstroChart) => void;
  currentChart: AstroChart | null;
  onAspectsDetected?: (aspects: AspectData[]) => void;
  onPlacementSelect?: (placement: any) => void;
}

const PLANET_ORBS: PlanetOrb[] = [
  // Traditional Planets
  { id: 'sun', name: 'Sun', symbol: '☉', color: '#fbbf24' },
  { id: 'moon', name: 'Moon', symbol: '☽', color: '#a3a3a3' },
  { id: 'mercury', name: 'Mercury', symbol: '☿', color: '#34d399' },
  { id: 'venus', name: 'Venus', symbol: '♀', color: '#f87171' },
  { id: 'mars', name: 'Mars', symbol: '♂', color: '#ef4444' },
  { id: 'jupiter', name: 'Jupiter', symbol: '♃', color: '#f59e0b' },
  { id: 'saturn', name: 'Saturn', symbol: '♄', color: '#8b5cf6' },
  
  // Outer Planets
  { id: 'uranus', name: 'Uranus', symbol: '♅', color: '#06b6d4' },
  { id: 'neptune', name: 'Neptune', symbol: '♆', color: '#3b82f6' },
  { id: 'pluto', name: 'Pluto', symbol: '♇', color: '#7c3aed' },
  
  // Asteroids and Points
  { id: 'chiron', name: 'Chiron', symbol: '⚷', color: '#10b981' },
  { id: 'lilith', name: 'Lilith', symbol: '⚸', color: '#1f2937' },
  { id: 'north_node', name: 'North Node', symbol: '☊', color: '#f59e0b' },
  { id: 'south_node', name: 'South Node', symbol: '☋', color: '#6b7280' },
  { id: 'ceres', name: 'Ceres', symbol: '⚳', color: '#84cc16' },
  { id: 'juno', name: 'Juno', symbol: '⚴', color: '#ec4899' },
  { id: 'vesta', name: 'Vesta', symbol: '⚵', color: '#f97316' },
  { id: 'pallas', name: 'Pallas', symbol: '⚶', color: '#8b5cf6' },
  { id: 'eris', name: 'Eris', symbol: '⚷', color: '#dc2626' }
];

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Aspect detection configuration
const ASPECT_ORBS = {
  conjunction: 8,
  opposition: 8,
  trine: 8,
  square: 8,
  sextile: 6
};

const ASPECT_INTERPRETATIONS: Record<string, AspectInterpretation> = {
  conjunction: {
    type: 'Conjunction',
    planets: [],
    meaning: 'Planets in conjunction blend their energies, creating a unified expression of their combined qualities.',
    musicalInfluence: 'Creates harmonic unity and melodic fusion between planetary themes.',
    orb: 8
  },
  opposition: {
    type: 'Opposition',
    planets: [],
    meaning: 'Planets in opposition create tension and polarity, requiring balance and integration.',
    musicalInfluence: 'Generates dynamic tension and call-and-response patterns.',
    orb: 8
  },
  trine: {
    type: 'Trine',
    planets: [],
    meaning: 'Planets in trine flow harmoniously, supporting and enhancing each other\'s expression.',
    musicalInfluence: 'Creates smooth, flowing melodic progressions and harmonic support.',
    orb: 8
  },
  square: {
    type: 'Square',
    planets: [],
    meaning: 'Planets in square create friction and challenge, driving growth through conflict.',
    musicalInfluence: 'Produces rhythmic tension and dramatic harmonic progressions.',
    orb: 8
  },
  sextile: {
    type: 'Sextile',
    planets: [],
    meaning: 'Planets in sextile offer opportunities for cooperation and mutual benefit.',
    musicalInfluence: 'Facilitates melodic cooperation and complementary harmonic structures.',
    orb: 6
  }
};

export default function SandboxComposer({ onChartUpdate, currentChart, onAspectsDetected, onPlacementSelect }: SandboxComposerProps) {
  const [selectedOrbs, setSelectedOrbs] = useState<PlanetOrb[]>([]);
  const [draggedOrb, setDraggedOrb] = useState<PlanetOrb | null>(null);
  const [dragOverHouse, setDragOverHouse] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isOrbMenuOpen, setIsOrbMenuOpen] = useState(false);
  const [detectedAspects, setDetectedAspects] = useState<AspectData[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<number>(1);
  const [showAspectLines, setShowAspectLines] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate which sign is in the 1st house based on rotation
  const getSignForHouse = (houseNumber: number): string => {
    const rotationIndex = Math.floor(wheelRotation / 30);
    const signIndex = (houseNumber - 1 + rotationIndex) % 12;
    return ZODIAC_SIGNS[signIndex];
  };

  // Get the current Ascendant (sign in 1st house)
  const getCurrentAscendant = (): string => {
    return getSignForHouse(1);
  };

  // Calculate longitude for a planet in a specific house
  const getLongitudeForHouse = (houseNumber: number): number => {
    return (houseNumber - 1) * 30 + wheelRotation;
  };

  // Detect aspects between planets
  const detectAspects = (planets: PlanetOrb[]): AspectData[] => {
    const aspects: AspectData[] = [];
    const placedPlanets = planets.filter(p => p.position);

    for (let i = 0; i < placedPlanets.length; i++) {
      for (let j = i + 1; j < placedPlanets.length; j++) {
        const planet1 = placedPlanets[i];
        const planet2 = placedPlanets[j];
        
        if (!planet1.position || !planet2.position) continue;

        const long1 = getLongitudeForHouse(planet1.position.house) + (planet1.position.degree || 0);
        const long2 = getLongitudeForHouse(planet2.position.house) + (planet2.position.degree || 0);
        
        let angle = Math.abs(long1 - long2);
        if (angle > 180) angle = 360 - angle;

        // Check for aspects
        if (angle <= ASPECT_ORBS.conjunction) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'conjunction',
            angle: angle,
            harmonic: '1:1'
          });
        } else if (Math.abs(angle - 60) <= ASPECT_ORBS.sextile) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'sextile',
            angle: angle,
            harmonic: '1:6'
          });
        } else if (Math.abs(angle - 90) <= ASPECT_ORBS.square) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'square',
            angle: angle,
            harmonic: '1:4'
          });
        } else if (Math.abs(angle - 120) <= ASPECT_ORBS.trine) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'trine',
            angle: angle,
            harmonic: '1:3'
          });
        } else if (Math.abs(angle - 180) <= ASPECT_ORBS.opposition) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'opposition',
            angle: angle,
            harmonic: '1:2'
          });
        }
      }
    }

    return aspects;
  };

  // Update aspects when planets change
  useEffect(() => {
    const aspects = detectAspects(selectedOrbs);
    setDetectedAspects(aspects);
    if (onAspectsDetected) {
      onAspectsDetected(aspects);
    }
  }, [selectedOrbs, wheelRotation]);

  const handleOrbDragStart = (e: React.DragEvent, orb: PlanetOrb) => {
    setDraggedOrb(orb);
    setIsDragging(true);
    setIsOrbMenuOpen(false);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', orb.id);
  };

  const handleOrbDragEnd = () => {
    setDraggedOrb(null);
    setIsDragging(false);
    setDragOverHouse(null);
  };

  const handleHouseDragOver = (e: React.DragEvent, houseNumber: number) => {
    e.preventDefault();
    setDragOverHouse(houseNumber);
  };

  const handleHouseDrop = (e: React.DragEvent, houseNumber: number) => {
    e.preventDefault();
    if (draggedOrb) {
      const sign = getSignForHouse(houseNumber);
      
      const updatedOrb: PlanetOrb = {
        ...draggedOrb,
        position: { house: houseNumber, sign, degree: 0 }
      };

      setSelectedOrbs(prev => {
        const filtered = prev.filter(orb => orb.id !== draggedOrb.id);
        return [...filtered, updatedOrb];
      });

      // Update the chart
      if (currentChart) {
        const updatedChart = {
          ...currentChart,
          planets: {
            ...currentChart.planets,
            [draggedOrb.name]: {
              longitude: getLongitudeForHouse(houseNumber),
              sign: { 
                name: sign, 
                element: getElementForSign(sign), 
                modality: getModalityForSign(sign), 
                degree: 0 
              },
              house: houseNumber,
              retrograde: false
            }
          }
        };
        onChartUpdate(updatedChart);
      }
    }
    setDragOverHouse(null);
  };

  const handleHouseSelection = (houseNumber: number) => {
    setSelectedHouse(houseNumber);
  };

  const handleRotation = (direction: 'clockwise' | 'counterclockwise') => {
    const rotationAmount = direction === 'clockwise' ? 30 : -30;
    const newRotation = (wheelRotation + rotationAmount) % 360;
    setWheelRotation(newRotation);

    // Update all placed orbs with new signs
    const updatedOrbs = selectedOrbs.map(orb => {
      if (orb.position) {
        const newSign = getSignForHouse(orb.position.house);
        return {
          ...orb,
          position: { ...orb.position, sign: newSign }
        };
      }
      return orb;
    });
    setSelectedOrbs(updatedOrbs);

    // Update the chart with new positions
    if (currentChart) {
      const updatedChart = {
        ...currentChart,
        planets: Object.fromEntries(
          updatedOrbs
            .filter(orb => orb.position)
            .map(orb => [
              orb.name,
              {
                longitude: getLongitudeForHouse(orb.position!.house),
                sign: { 
                  name: orb.position!.sign, 
                  element: getElementForSign(orb.position!.sign), 
                  modality: getModalityForSign(orb.position!.sign), 
                  degree: 0 
                },
                house: orb.position!.house,
                retrograde: false
              }
            ])
        )
      };
      onChartUpdate(updatedChart);
    }
  };

  const resetRotation = () => {
    setWheelRotation(0);
    // Reset all orbs to their original signs
    const updatedOrbs = selectedOrbs.map(orb => {
      if (orb.position) {
        const originalSign = ZODIAC_SIGNS[orb.position.house - 1];
        return {
          ...orb,
          position: { ...orb.position, sign: originalSign }
        };
      }
      return orb;
    });
    setSelectedOrbs(updatedOrbs);

    // Update the chart
    if (currentChart) {
      const updatedChart = {
        ...currentChart,
        planets: Object.fromEntries(
          updatedOrbs
            .filter(orb => orb.position)
            .map(orb => [
              orb.name,
              {
                longitude: getLongitudeForHouse(orb.position!.house),
                sign: { 
                  name: orb.position!.sign, 
                  element: getElementForSign(orb.position!.sign), 
                  modality: getModalityForSign(orb.position!.sign), 
                  degree: 0 
                },
                house: orb.position!.house,
                retrograde: false
              }
            ])
        )
      };
      onChartUpdate(updatedChart);
    }
  };

  const getElementForSign = (sign: string): 'Fire' | 'Earth' | 'Air' | 'Water' => {
    const elements: { [key: string]: 'Fire' | 'Earth' | 'Air' | 'Water' } = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    };
    return elements[sign] || 'Fire';
  };

  const getModalityForSign = (sign: string): 'Cardinal' | 'Fixed' | 'Mutable' => {
    const modalities: { [key: string]: 'Cardinal' | 'Fixed' | 'Mutable' } = {
      'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
      'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
      'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
    };
    return modalities[sign] || 'Cardinal';
  };

  const removeOrb = (orbId: string) => {
    setSelectedOrbs(prev => prev.filter(orb => orb.id !== orbId));
  };

  const getAspectInterpretation = (aspect: AspectData): AspectInterpretation => {
    const baseInterpretation = ASPECT_INTERPRETATIONS[aspect.type];
    return {
      ...baseInterpretation,
      planets: [aspect.planet1, aspect.planet2],
      orb: aspect.angle
    };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-screen">
      {/* Left Sidebar - Orb Selection */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-header text-lg">Celestial Bodies</h3>
            <button
              onClick={() => setIsOrbMenuOpen(!isOrbMenuOpen)}
              className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
            >
              <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* House Selection for Mobile */}
          <div className="mb-4">
            <label className="form-label text-sm">Select House:</label>
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(parseInt(e.target.value))}
              className="w-full form-input text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  House {i + 1} ({getSignForHouse(i + 1)})
                </option>
              ))}
            </select>
          </div>

          {isOrbMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 max-h-96 overflow-y-auto"
            >
              {PLANET_ORBS.map((orb) => (
                <div
                  key={orb.id}
                  draggable
                  onDragStart={(e) => handleOrbDragStart(e, orb)}
                  onDragEnd={handleOrbDragEnd}
                  className={`p-3 rounded-xl border border-transparent cursor-grab transition-all duration-200 hover:border-emerald-500/30 ${
                    isDragging && draggedOrb?.id === orb.id ? 'opacity-50' : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${orb.color}10, ${orb.color}05)`
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl" style={{ color: orb.color }}>
                      {orb.symbol}
                    </span>
                    <span className="text-sm font-mystical text-white">
                      {orb.name}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Selected Placements */}
          {selectedOrbs.length > 0 && (
            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-300 font-mystical mb-3">
                Placed Orbs
              </h4>
              <div className="space-y-2">
                {selectedOrbs
                  .filter(orb => orb.position)
                  .map((orb) => (
                    <div
                      key={orb.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-emerald-500/20"
                      style={{
                        background: `linear-gradient(135deg, ${orb.color}10, ${orb.color}05)`
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm" style={{ color: orb.color }}>
                          {orb.symbol}
                        </span>
                        <span className="text-xs text-gray-300 font-mystical">
                          House {orb.position?.house} ({orb.position?.sign})
                        </span>
                      </div>
                      <button
                        onClick={() => removeOrb(orb.id)}
                        className="text-red-400 hover:text-red-300 transition-colors text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Aspect Display */}
          {detectedAspects.length > 0 && (
            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-300 font-mystical mb-3">
                Detected Aspects ({detectedAspects.length})
              </h4>
              <div className="space-y-2">
                {detectedAspects.map((aspect, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10"
                  >
                    <div className="text-xs text-emerald-300 font-mystical">
                      {aspect.planet1} {aspect.type} {aspect.planet2}
                    </div>
                    <div className="text-xs text-gray-400">
                      {aspect.angle.toFixed(1)}° orb
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Chart Wheel */}
      <div className="flex-1 flex flex-col">
        {/* Rotation Controls */}
        <div className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20 mb-6">
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={() => handleRotation('counterclockwise')}
              className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-200 cosmic-glow"
            >
              <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-300 font-mystical">
                {getCurrentAscendant()}
              </div>
              <div className="text-xs text-gray-400 font-mystical">
                Ascendant
              </div>
            </div>
            
            <button
              onClick={() => handleRotation('clockwise')}
              className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-200 cosmic-glow"
            >
              <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="text-center mt-4">
            <button
              onClick={resetRotation}
              className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg hover:bg-violet-500/30 transition-all duration-200 font-mystical text-violet-300 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Chart Wheel */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <motion.div 
              ref={chartRef}
              className="relative w-96 h-96 chart-wheel rounded-full border-4 border-emerald-500/40 flex items-center justify-center bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm"
              animate={{ rotate: wheelRotation }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.2), inset 0 0 40px rgba(16, 185, 129, 0.1)'
              }}
            >
              {/* Convert selected orbs to universal format */}
              {(() => {
                const universalPlanets = selectedOrbs
                  .filter(orb => orb.position)
                  .map(orb => ({
                    id: orb.id,
                    name: orb.name,
                    symbol: orb.symbol,
                    color: orb.color,
                    angle: ((orb.position!.house - 1) * 30) - 90,
                    house: orb.position!.house,
                    sign: orb.position!.sign,
                    degree: orb.position!.degree || 0
                  }));

                const universalAspects = detectedAspects.map(aspect => ({
                  from: aspect.planet1,
                  to: aspect.planet2,
                  type: aspect.type as any,
                  angle: 0, // Will be calculated by universal component
                  orb: aspect.angle
                }));

                return (
                  <UniversalChartWheel
                    planets={universalPlanets}
                    aspects={universalAspects}
                    size={384} // 96 * 4
                    isInteractive={true}
                    onWheelRotate={setWheelRotation}
                    wheelRotation={wheelRotation}
                    showAspectLines={showAspectLines}
                    draggable={true}
                    onPlanetDrop={(planet, house) => {
                      // Handle planet drop in universal component
                      const orb = selectedOrbs.find(o => o.id === planet.id);
                      if (orb) {
                        const sign = getSignForHouse(house);
                        const updatedOrb = {
                          ...orb,
                          position: { house, sign, degree: 0 }
                        };
                        setSelectedOrbs(prev => {
                          const filtered = prev.filter(o => o.id !== orb.id);
                          return [...filtered, updatedOrb];
                        });
                      }
                    }}
                    onPlanetDragStart={(planet) => {
                      // Handle planet drag start
                    }}
                    onPlanetDragEnd={() => {
                      // Handle planet drag end
                    }}
                    dragOverHouse={dragOverHouse}
                  />
                );
              })()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Aspect Interpretation */}
      {detectedAspects.length > 0 && (
        <div className="lg:w-80 flex-shrink-0">
          <div className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20 h-full">
            <h3 className="section-header text-lg mb-6">Aspect Interpretations</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {detectedAspects.map((aspect, index) => {
                const interpretation = getAspectInterpretation(aspect);
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-bold text-emerald-300">
                        {interpretation.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {aspect.planet1} ↔ {aspect.planet2}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">
                      {interpretation.meaning}
                    </p>
                    <p className="text-xs text-emerald-300">
                      <strong>Musical Influence:</strong> {interpretation.musicalInfluence}
                    </p>
                    <div className="text-xs text-gray-400 mt-2">
                      Orb: {interpretation.orb.toFixed(1)}°
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 