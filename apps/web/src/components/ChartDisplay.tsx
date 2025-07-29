'use client';

import React from 'react';

interface AstroChart {
  metadata: {
    birth_datetime: string;
  };
  planets: Record<string, any>;
  houses: Record<string, any>;
}

interface ChartDisplayProps {
  chart: AstroChart;
}

export default function ChartDisplay({ chart }: ChartDisplayProps) {
  const planets = Object.keys(chart.planets);

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <h3 className="text-lg font-semibold mb-3 text-center glow-text">
        Chart Details
      </h3>
      
      <div className="space-y-3">
        <div className="text-sm">
          <span className="text-gray-400">Birth Date:</span>
          <span className="ml-2 text-white">
            {new Date(chart.metadata.birth_datetime).toLocaleDateString()}
          </span>
        </div>
        
        <div className="text-sm">
          <span className="text-gray-400">Birth Time:</span>
          <span className="ml-2 text-white">
            {new Date(chart.metadata.birth_datetime).toLocaleTimeString()}
          </span>
        </div>
        
        <div className="text-sm">
          <span className="text-gray-400">Planets Found:</span>
          <span className="ml-2 text-white">{planets.length}</span>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Planetary Positions:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {planets.map(planet => (
              <div key={planet} className="flex justify-between">
                <span className="text-gray-400">{planet}:</span>
                <span className="text-white">
                  {chart.planets[planet]?.sign?.name || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 