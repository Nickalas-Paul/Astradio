'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AudioSession } from '../types';

interface AudioVisualizerProps {
  session: AudioSession | null;
  mode: 'moments' | 'overlay' | 'sandbox' | 'jam';
  isPlaying: boolean;
  className?: string;
}

interface PlanetVisualData {
  name: string;
  frequency: number;
  volume: number;
  isActive: boolean;
  color: string;
  position: { x: number; y: number };
}

export default function AudioVisualizer({ session, mode, isPlaying, className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [planetData, setPlanetData] = useState<PlanetVisualData[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  // Planetary color mapping
  const planetColors = {
    Sun: '#FFD700',
    Moon: '#C0C0C0',
    Mercury: '#87CEEB',
    Venus: '#FFB6C1',
    Mars: '#FF4500',
    Jupiter: '#FFA500',
    Saturn: '#808080',
    Uranus: '#00CED1',
    Neptune: '#4169E1',
    Pluto: '#800080'
  };

  // Generate mock planet data based on session
  useEffect(() => {
    if (!session) {
      setPlanetData([]);
      return;
    }

    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const data: PlanetVisualData[] = planets.map((planet, index) => {
      const angle = (index / planets.length) * 2 * Math.PI;
      const radius = 100 + Math.random() * 50;
      
      return {
        name: planet,
        frequency: 200 + Math.random() * 400,
        volume: 0.3 + Math.random() * 0.7,
        isActive: false,
        color: planetColors[planet as keyof typeof planetColors] || '#FFFFFF',
        position: {
          x: Math.cos(angle) * radius + 200,
          y: Math.sin(angle) * radius + 200
        }
      };
    });

    setPlanetData(data);
  }, [session]);

  // Simulate real-time planet activation
  useEffect(() => {
    if (!isPlaying || !session) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 0.1);
      
      // Activate planets based on time
      setPlanetData(prev => prev.map((planet, index) => {
        const activationTime = index * 2; // Each planet activates every 2 seconds
        const isActive = (currentTime % 20) >= activationTime && (currentTime % 20) < activationTime + 1;
        
        return {
          ...planet,
          isActive,
          volume: isActive ? 0.8 : 0.3
        };
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, session, currentTime]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient
      const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 300);
      gradient.addColorStop(0, 'rgba(147, 51, 234, 0.1)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw planets
      planetData.forEach(planet => {
        const size = planet.isActive ? 20 + Math.sin(currentTime * 5) * 5 : 15;
        const alpha = planet.isActive ? 1 : 0.6;

        // Planet glow effect
        if (planet.isActive) {
          ctx.beginPath();
          ctx.arc(planet.position.x, planet.position.y, size + 10, 0, 2 * Math.PI);
          ctx.fillStyle = `${planet.color}20`;
          ctx.fill();
        }

        // Planet body
        ctx.beginPath();
        ctx.arc(planet.position.x, planet.position.y, size, 0, 2 * Math.PI);
        ctx.fillStyle = planet.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Planet name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(planet.name, planet.position.x, planet.position.y + size + 15);

        // Frequency indicator
        if (planet.isActive) {
          ctx.fillStyle = '#00FF00';
          ctx.font = '10px Arial';
          ctx.fillText(`${Math.round(planet.frequency)}Hz`, planet.position.x, planet.position.y - size - 10);
        }
      });

      // Draw connection lines for overlay mode
      if (mode === 'overlay' && planetData.length > 0) {
        ctx.strokeStyle = '#FFFFFF20';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(planetData[0].position.x, planetData[0].position.y);
        planetData.forEach(planet => {
          ctx.lineTo(planet.position.x, planet.position.y);
        });
        ctx.stroke();
      }

      // Draw waveform for sandbox mode
      if (mode === 'sandbox') {
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 2) {
          const y = 200 + Math.sin(x * 0.02 + currentTime * 2) * 50 * (isPlaying ? 1 : 0.3);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [planetData, currentTime, isPlaying, mode]);

  if (!session) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-white/10 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">Audio</div>
          <p>No audio session</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-64 rounded-lg border border-white/20"
      />
      
      {/* Session info overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
        <div className="font-semibold">{session.configuration.mode}</div>
        <div className="text-gray-300">
          {session.configuration.tempo && `${session.configuration.tempo} BPM`}
        </div>
        <div className="text-gray-300">
          {session.configuration.duration && `${session.configuration.duration}s`}
        </div>
      </div>

      {/* Playback indicator */}
      {isPlaying && (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Playing</span>
        </div>
      )}
    </div>
  );
} 