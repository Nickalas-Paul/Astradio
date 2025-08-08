'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerOverlayProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioData?: number[];
  onSeek?: (time: number) => void;
}

export default function AudioVisualizerOverlay({
  isPlaying,
  currentTime,
  duration,
  audioData = [],
  onSeek
}: AudioVisualizerOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (typeof window !== 'undefined' ? window.devicePixelRatio : 1);
      canvas.height = rect.height * (typeof window !== 'undefined' ? window.devicePixelRatio : 1);
      ctx.scale(typeof window !== 'undefined' ? window.devicePixelRatio : 1, typeof window !== 'undefined' ? window.devicePixelRatio : 1);
    };

    resizeCanvas();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', resizeCanvas);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', resizeCanvas);
      }
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      if (audioData.length > 0) {
        const barWidth = canvas.width / audioData.length;
        const maxHeight = canvas.height * 0.8;

        ctx.fillStyle = '#10b981';
        audioData.forEach((value, index) => {
          const height = (value / 255) * maxHeight;
          const x = index * barWidth;
          const y = (canvas.height - height) / 2;
          
          ctx.fillRect(x, y, barWidth - 1, height);
        });
      }

      // Draw progress indicator
      const progress = currentTime / duration;
      const progressX = progress * canvas.width;
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, canvas.height);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClient, isPlaying, currentTime, duration, audioData]);

  if (!isClient) {
    return (
      <div className="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-slate-400">Loading visualizer...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-32 bg-slate-900 rounded-lg cursor-pointer"
        onClick={(e) => {
          if (!onSeek) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const progress = clickX / rect.width;
          const newTime = progress * duration;
          onSeek(newTime);
        }}
      />
      
      <div className="flex justify-between text-xs text-slate-400 mt-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </motion.div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 