'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AudioSession } from '../types';

interface SandboxVisualizerProps {
  session: AudioSession | null;
  isPlaying: boolean;
  audioConfig?: {
    tempo: number;
    duration: number;
    volume: number;
    reverb: number;
    delay: number;
  };
}

export default function SandboxVisualizer({ session, isPlaying, audioConfig }: SandboxVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!isPlaying || !session) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, session]);

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

      if (isPlaying && audioConfig) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const tempo = audioConfig.tempo || 120;
        const volume = audioConfig.volume || 0.8;
        const reverb = audioConfig.reverb || 0.3;
        const delay = audioConfig.delay || 0.1;

        // Draw tempo-based visualization
        const tempoRadius = 80 + (tempo - 120) / 2;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, tempoRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw volume-based bars
        const barCount = 20;
        const barWidth = canvas.width / barCount;
        for (let i = 0; i < barCount; i++) {
          const height = (Math.sin(currentTime * 2 + i * 0.3) + 1) * 50 * volume;
          const x = i * barWidth;
          const y = canvas.height - height - 20;
          
          ctx.fillStyle = `hsl(${200 + i * 10}, 70%, 60%)`;
          ctx.fillRect(x, y, barWidth - 2, height);
        }

        // Draw reverb effect
        if (reverb > 0) {
          ctx.strokeStyle = `rgba(0, 255, 255, ${reverb})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, tempoRadius + 20, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw delay effect
        if (delay > 0) {
          ctx.strokeStyle = `rgba(255, 0, 255, ${delay})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, tempoRadius - 20, 0, 2 * Math.PI);
          ctx.stroke();
        }

        // Draw frequency spectrum
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 2) {
          const frequency = x * 0.5;
          const amplitude = Math.sin(frequency * 0.01 + currentTime * 2) * 30 * volume;
          const y = centerY + amplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Draw parameter indicators
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Tempo: ${tempo} BPM`, 10, 20);
        ctx.fillText(`Volume: ${Math.round(volume * 100)}%`, 10, 35);
        ctx.fillText(`Reverb: ${Math.round(reverb * 100)}%`, 10, 50);
        ctx.fillText(`Delay: ${Math.round(delay * 100)}%`, 10, 65);

        // Draw real-time frequency
        const baseFreq = 440;
        const freq = baseFreq + Math.sin(currentTime) * 100;
        ctx.fillText(`Freq: ${Math.round(freq)}Hz`, 10, 80);
      } else {
        // Draw idle state
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Ready for Sandbox', canvas.width / 2, canvas.height / 2);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, audioConfig]);

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
          {audioConfig && (
            <div>Tempo: {audioConfig.tempo} BPM</div>
          )}
        </div>
      )}
    </div>
  );
} 