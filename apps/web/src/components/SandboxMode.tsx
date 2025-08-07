import React, { useState } from 'react';
import BlankChartWheel from './BlankChartWheel';

interface Planet {
  name: string;
  symbol: string;
  color: string;
  longitude: number;
  sign: string;
  house: number;
}

interface SandboxModeProps {
  onPlanetsChange: (planets: Planet[]) => void;
}

export default function SandboxMode({ onPlanetsChange }: SandboxModeProps) {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [draggedPlanet, setDraggedPlanet] = useState<Planet | null>(null);

  const availablePlanets: Planet[] = [
    { name: 'Sun', symbol: '☉', color: '#FFD700', longitude: 0, sign: 'Aries', house: 1 },
    { name: 'Moon', symbol: '☽', color: '#C0C0C0', longitude: 30, sign: 'Taurus', house: 2 },
    { name: 'Mercury', symbol: '☿', color: '#87CEEB', longitude: 60, sign: 'Gemini', house: 3 },
    { name: 'Venus', symbol: '♀', color: '#FFB6C1', longitude: 90, sign: 'Cancer', house: 4 },
    { name: 'Mars', symbol: '♂', color: '#FF6B6B', longitude: 120, sign: 'Leo', house: 5 },
    { name: 'Jupiter', symbol: '♃', color: '#FFD93D', longitude: 150, sign: 'Virgo', house: 6 },
    { name: 'Saturn', symbol: '♄', color: '#A0522D', longitude: 180, sign: 'Libra', house: 7 },
    { name: 'Uranus', symbol: '♅', color: '#40E0D0', longitude: 210, sign: 'Scorpio', house: 8 },
    { name: 'Neptune', symbol: '♆', color: '#4169E1', longitude: 240, sign: 'Sagittarius', house: 9 },
    { name: 'Pluto', symbol: '♇', color: '#8A2BE2', longitude: 270, sign: 'Capricorn', house: 10 }
  ];

  const handlePlanetDragStart = (planet: Planet) => {
    setDraggedPlanet(planet);
  };

  const handlePlanetDrop = (longitude: number, sign: string, house: number) => {
    if (draggedPlanet) {
      const updatedPlanet = {
        ...draggedPlanet,
        longitude,
        sign,
        house
      };
      
      const updatedPlanets = [...planets, updatedPlanet];
      setPlanets(updatedPlanets);
      onPlanetsChange(updatedPlanets);
      setDraggedPlanet(null);
    }
  };

  const removePlanet = (planetName: string) => {
    const updatedPlanets = planets.filter(p => p.name !== planetName);
    setPlanets(updatedPlanets);
    onPlanetsChange(updatedPlanets);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 max-w-4xl mx-auto mb-8 shadow-lg">
      <h2 className="section-header text-2xl mb-6 font-sans">
        Sandbox Mode
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Planet Palette */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4 font-sans">
            Available Planets
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {availablePlanets.map((planet) => (
              <div
                key={planet.name}
                draggable
                onDragStart={() => handlePlanetDragStart(planet)}
                className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30 cursor-move hover:bg-slate-700/50 transition-colors"
              >
                <span 
                  className="text-2xl"
                  style={{ color: planet.color }}
                >
                  {planet.symbol}
                </span>
                <span className="text-slate-300 font-medium font-sans">
                  {planet.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4 font-sans">
            Chart Canvas
          </h3>
          <div 
            className="relative bg-slate-800/50 rounded-2xl p-8 border border-slate-600/30 min-h-[400px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              // This would be implemented with actual chart coordinates
              handlePlanetDrop(0, 'Aries', 1);
            }}
          >
            <BlankChartWheel 
              size={300}
              message="Drag planets here to build your chart"
              showGrid={true}
            />
            
            {/* Placed Planets */}
            {planets.map((planet) => (
              <div
                key={planet.name}
                className="absolute flex items-center space-x-2 p-2 bg-slate-900/80 rounded-lg border"
                style={{
                  left: `${(planet.longitude / 360) * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span 
                  className="text-lg"
                  style={{ color: planet.color }}
                >
                  {planet.symbol}
                </span>
                <button
                  onClick={() => removePlanet(planet.name)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-300 text-sm font-light">
          <strong>How to use:</strong> Drag planets from the palette to the chart canvas. 
          Click the × button to remove planets. Your custom chart will be used for audio generation.
        </p>
      </div>
    </div>
  );
} 