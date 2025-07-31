'use client';

import React from 'react';

interface ChartLayoutWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  showGenre?: boolean;
  genre?: string;
  showExport?: boolean;
  exportProps?: {
    chart: any;
    noteEvents: any[];
    genre: string;
    mode: 'daily' | 'personal' | 'overlay' | 'sandbox';
    title?: string;
  };
}

export default function ChartLayoutWrapper({ 
  children, 
  title, 
  subtitle, 
  className = '',
  showGenre = true,
  genre,
  showExport = false,
  exportProps
}: ChartLayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      {/* Navigation would be here */}
      
      <div className="container mx-auto px-6 py-12">
        {/* Header Section - Consistent across all pages */}
        <div className="text-center mb-12">
          {title && (
            <h1 className="text-5xl font-bold mb-6 glow-text leading-tight tracking-tight gradient-text-cosmic cosmic-glow-text font-mystical">
              {title}
            </h1>
          )}
          
          {subtitle && (
            <h2 className="text-2xl font-semibold mb-4 text-emerald-300 leading-relaxed tracking-wide font-mystical">
              {subtitle}
            </h2>
          )}
          
          {/* Genre Display - Consistent positioning */}
          {showGenre && genre && (
            <div className="inline-block px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-full mt-6">
              <span className="text-emerald-300 font-medium capitalize tracking-wide font-mystical">
                {genre} Mode
              </span>
            </div>
          )}
        </div>

        {/* Main Content Area - Enforced layout structure */}
        <div className="flex flex-col items-center justify-center max-w-screen-lg mx-auto space-y-6">
          {/* Chart Container - Consistent sizing and spacing */}
          <div className="w-full max-w-4xl">
            <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 cosmic-glow">
              {children}
            </div>
          </div>

          {/* Export Controls - Consistent positioning when enabled */}
          {showExport && exportProps && (
            <div className="w-full max-w-md">
              {/* Import ExportControls here when needed */}
              {/* <ExportControls {...exportProps} /> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 