import React, { useEffect, useState } from 'react';
import { AstroChart } from '../types';

interface ChartMergeAnimationProps {
  chart1: AstroChart;
  chart2: AstroChart;
  isMerging: boolean;
  onMergeComplete: () => void;
  onStartMerge: () => void;
}

export default function ChartMergeAnimation({
  chart1,
  chart2,
  isMerging,
  onMergeComplete,
  onStartMerge
}: ChartMergeAnimationProps) {
  const [mergeProgress, setMergeProgress] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isMerging) {
      setShowParticles(true);
      const interval = setInterval(() => {
        setMergeProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            onMergeComplete();
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setMergeProgress(0);
      setShowParticles(false);
    }
  }, [isMerging, onMergeComplete]);

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 max-w-6xl mx-auto shadow-lg">
      <h2 className="section-header text-2xl mb-6 font-sans">
        Chart Merge
      </h2>
      
      <div className="text-center">
        <p className="text-slate-300 mb-6 font-light">
          Your natal chart will be merged with today's cosmic energy
        </p>
        
        {!isMerging ? (
          <button
            onClick={onStartMerge}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-colors shadow-lg"
          >
            Start Merge
          </button>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-emerald-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${mergeProgress}%` }}
              />
            </div>
            
            {/* Progress Text */}
            <p className="text-emerald-400 font-sans">
              {mergeProgress < 100 ? `Merging charts... ${mergeProgress}%` : 'Merge complete!'}
            </p>
            
            {/* Animated Particles */}
            {showParticles && (
              <div className="relative h-32">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 