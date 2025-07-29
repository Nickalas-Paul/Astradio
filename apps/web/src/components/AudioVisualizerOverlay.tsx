'use client';

import React, { useEffect, useRef } from 'react';
import { AstroChart } from '../types';
import { getZodiacColor, getZodiacSignFromDegree } from '../lib/zodiacColors';

interface AudioVisualizerOverlayProps {
  isPlaying: boolean;
  currentHouse: number;
  duration: number;
  chart: AstroChart;
  className?: string;
}

export default function AudioVisualizerOverlay({ 
  isPlaying, 
  currentHouse, 
  duration,
  chart,
  className = "" 
}: AudioVisualizerOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Chart wheel dimensions
    const wheelSize = 400;
    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const outerRadius = 180;
    const middleRadius = 140;
    const innerRadius = 100;

    // Calculate house positions (counter-clockwise, starting at 6 o'clock)
    const getHousePosition = (houseNumber: number) => {
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

    const animate = (timestamp: number) => {
      if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate current time and house progress
      const elapsed = (timestamp % (duration * 1000)) / 1000;
      const secondsPerHouse = duration / 12;
      const houseProgress = (elapsed % secondsPerHouse) / secondsPerHouse;

      // Draw house segment overlays
      for (let houseNumber = 1; houseNumber <= 12; houseNumber++) {
        const position = getHousePosition(houseNumber);
        const isActive = houseNumber === currentHouse;
        
        // Get house cusp data and zodiac sign
        const houseData = chart.houses?.[houseNumber];
        const signName = houseData ? getZodiacSignFromDegree(houseData.cusp_longitude) : 'Aries';
        const zodiacColor = getZodiacColor(signName);
        
        // Calculate house segment path
        const startAngle = position.angle - 15; // Half house angle
        const endAngle = position.angle + 15;
        const startRadians = (startAngle * Math.PI) / 180;
        const endRadians = (endAngle * Math.PI) / 180;

        // Create house segment path
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, middleRadius, startRadians, endRadians);
        ctx.closePath();

        if (isActive && isPlaying) {
          // Active house gets animated overlay
          const intensity = 0.3 + 0.2 * Math.sin(timestamp * 0.01);
          ctx.fillStyle = `${zodiacColor.primary}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();

          // Add pulsing border
          const pulseRadius = middleRadius + 5 * Math.sin(timestamp * 0.02);
          ctx.strokeStyle = zodiacColor.primary;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX, centerY, pulseRadius, startRadians, endRadians);
          ctx.stroke();

          // Add shimmer effect
          const shimmerAngle = (timestamp * 0.001) % (2 * Math.PI);
          const shimmerRadius = innerRadius + (middleRadius - innerRadius) * 0.5;
          const shimmerX = centerX + Math.cos(shimmerAngle) * shimmerRadius;
          const shimmerY = centerY + Math.sin(shimmerAngle) * shimmerRadius;
          
          if (shimmerAngle >= startRadians && shimmerAngle <= endRadians) {
            ctx.fillStyle = `${zodiacColor.secondary}80`;
            ctx.beginPath();
            ctx.arc(shimmerX, shimmerY, 8, 0, 2 * Math.PI);
            ctx.fill();
          }
        } else {
          // Inactive houses get subtle overlay
          ctx.fillStyle = `${zodiacColor.primary}10`;
          ctx.fill();
        }
      }

      // Add rotating particles around the wheel
      if (isPlaying) {
        for (let i = 0; i < 6; i++) {
          const particleAngle = (timestamp * 0.0005 + i * Math.PI / 3) % (2 * Math.PI);
          const particleRadius = outerRadius + 10;
          const particleX = centerX + Math.cos(particleAngle) * particleRadius;
          const particleY = centerY + Math.sin(particleAngle) * particleRadius;
          
          // Determine which house the particle is over
          const houseAngle = ((particleAngle * 180 / Math.PI) + 180) % 360;
          const houseNumber = Math.floor(houseAngle / 30) + 1;
          const houseData = chart.houses?.[houseNumber];
          const signName = houseData ? getZodiacSignFromDegree(houseData.cusp_longitude) : 'Aries';
          const zodiacColor = getZodiacColor(signName);
          
          ctx.fillStyle = `${zodiacColor.primary}60`;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Add central pulse for current house
      if (isPlaying && currentHouse) {
        const houseData = chart.houses?.[currentHouse];
        const signName = houseData ? getZodiacSignFromDegree(houseData.cusp_longitude) : 'Aries';
        const zodiacColor = getZodiacColor(signName);
        
        const pulseRadius = innerRadius * (0.8 + 0.2 * Math.sin(timestamp * 0.01));
        ctx.strokeStyle = `${zodiacColor.primary}80`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentHouse, duration, chart]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity: 0.5 }}
    />
  );
} 