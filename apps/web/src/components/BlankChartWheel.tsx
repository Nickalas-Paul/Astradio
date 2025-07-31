'use client';

import React from 'react';

interface BlankChartWheelProps {
  size?: number;
  message?: string;
  showGrid?: boolean;
  className?: string;
}

export default function BlankChartWheel({ 
  size = 400, 
  message = "Enter your birth info to hear your chart",
  showGrid = true,
  className = ""
}: BlankChartWheelProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size * 0.4);
  const innerRadius = radius * 0.3;
  const outerRadius = radius * 0.9;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="mx-auto">
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
        />
        
        {/* Inner circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />
        
        {/* Outer circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1"
        />
        
        {/* Grid lines for houses */}
        {showGrid && Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x1 = centerX + Math.cos(angle) * innerRadius;
          const y1 = centerY + Math.sin(angle) * innerRadius;
          const x2 = centerX + Math.cos(angle) * outerRadius;
          const y2 = centerY + Math.sin(angle) * outerRadius;
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Center glyph */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          <circle
            r="8"
            fill="rgba(255, 255, 255, 0.2)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
          />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-white text-lg font-mystical"
            fill="rgba(255, 255, 255, 0.6)"
          >
            ⭐
          </text>
        </g>
        
        {/* House numbers */}
        {showGrid && Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 - 15) * (Math.PI / 180);
          const x = centerX + Math.cos(angle) * (radius * 0.6);
          const y = centerY + Math.sin(angle) * (radius * 0.6);
          
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-mystical"
              fill="rgba(255, 255, 255, 0.3)"
            >
              {i + 1}
            </text>
          );
        })}
      </svg>
      
      {/* Message overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="text-white/60 text-sm font-mystical leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
} 