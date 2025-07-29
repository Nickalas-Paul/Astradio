'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AudioSession } from '../types';

interface MomentsVisualizerProps {
  session: AudioSession | null;
  isPlaying: boolean;
}

export default function MomentsVisualizer({ session, isPlaying }: MomentsVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [currentPlanet, setCurrentPlanet] = useState<string>('');
  const [currentFrequency, setCurrentFrequency] = useState(0);

  // Planetary data for moments mode
  const planets = [
    { name: 'Sun', color: '#FFD700', frequency: 264 },
    { name: 'Moon', color: '#C0C0C0', frequency: 294 },
    { name: 'Mercury', color: '#87CEEB', frequency: 392 },
    { name: 'Venus', color: '#FFB6C1', frequency: 349 },
    { name: 'Mars', color: '#FF4500', frequency: 330 },
    { name: 'Jupiter', color: '#FFA500', frequency: 440 },
    { name: 'Saturn', color: '#808080', frequency: 220 },
    { name: 'Uranus', color: '#00CED1', frequency: 523 },
    { name: 'Neptune', color: '#4169E1', frequency: 494 },
    { name: 'Pluto', color: '#800080', frequency: 147 }
  ];

  useEffect(() => {
    if (!isPlaying || !session) return;

    let time = 0;
    const interval = setInterval(() => {
      time += 0.1;
      const planetIndex = Math.floor(time / 2) % planets.length;
      const planet = planets[planetIndex];
      
      setCurrentPlanet(planet.name);
      setCurrentFrequency(planet.frequency);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, session, planets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(147, 51, 234, 0.1)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying && currentPlanet) {
        const planet = planets.find(p => p.name === currentPlanet);
        if (!planet) return;

        // Draw radial background
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, 2 * Math.PI);
        ctx.strokeStyle = `${planet.color}30`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw waveform
        ctx.strokeStyle = planet.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 2) {
          const time = Date.now() * 0.001;
          const y = canvas.height / 2 + Math.sin(x * 0.02 + time * 2) * 30;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Draw planet symbol
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, 2 * Math.PI);
        ctx.fill();

        // Planet glow
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, 2 * Math.PI);
        ctx.fillStyle = `${planet.color}20`;
        ctx.fill();

        // Planet name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(currentPlanet, canvas.width / 2, canvas.height / 2 + 80);

        // Frequency
        ctx.font = '14px Arial';
        ctx.fillText(`${currentFrequency}Hz`, canvas.width / 2, canvas.height / 2 - 60);
      } else {
        // Draw idle state
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Ready for Moments', canvas.width / 2, canvas.height / 2);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentPlanet, currentFrequency]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="w-full h-64 rounded-lg border border-white/20"
      />
      
      {session && (
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
          <div>Mode: {session.configuration.mode}</div>
          <div>Duration: {session.configuration.duration}s</div>
        </div>
      )}
    </div>
  );
} 