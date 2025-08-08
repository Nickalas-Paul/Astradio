'use client';

import React, { useState, useEffect } from 'react';
import ClientOnly from '../components/ClientOnly';
import DailyChartPlayer from '../components/DailyChartPlayer';
import AstrologicalWheel from '../components/AstrologicalWheel';

interface Planet {
  id: string;
  name: string;
  symbol: string;
  angle: number;
  color: string;
  house: number;
  sign: string;
  degree: number;
}

interface Aspect {
  from: string;
  to: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  angle: number;
  orb: number;
}

export default function HomePage() {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('ambient');

  useEffect(() => {
    loadTodayChart();
  }, []);

  const loadTodayChart = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/api/daily/${today}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setChartData(data.data);
      
      console.log('📊 Today\'s chart loaded:', data.data);
    } catch (err) {
      console.error('❌ Chart loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const convertChartDataToPlanets = (chartData: any): Planet[] => {
    if (!chartData?.chart?.planets) return [];
    
    const planetColors: Record<string, string> = {
      'Sun': '#fbbf24',
      'Moon': '#6b7280',
      'Mercury': '#10b981',
      'Venus': '#f59e0b',
      'Mars': '#ef4444',
      'Jupiter': '#8b5cf6',
      'Saturn': '#64748b',
      'Uranus': '#06b6d4',
      'Neptune': '#3b82f6',
      'Pluto': '#7c3aed'
    };

    return Object.entries(chartData.chart.planets).map(([name, data]: [string, any]) => ({
      id: name,
      name,
      symbol: name,
      angle: data.longitude,
      color: planetColors[name] || '#6b7280',
      house: data.house,
      sign: data.sign.name,
      degree: data.sign.degree
    }));
  };

  const convertChartDataToAspects = (chartData: any): Aspect[] => {
    if (!chartData?.chart?.aspects) return [];
    
    return chartData.chart.aspects.map((aspect: any) => ({
      from: aspect.planet1,
      to: aspect.planet2,
      type: aspect.type as 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition',
      angle: aspect.angle,
      orb: 0
    }));
  };

  const planets = convertChartDataToPlanets(chartData);
  const aspects = convertChartDataToAspects(chartData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Astradio
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            AI-powered music generated from real astrological data using the Swiss Ephemeris API
          </p>
          
          {/* Chart Wheel Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              What does your chart sound like?
            </h2>
            
            <ClientOnly>
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <AstrologicalWheel
                    planets={planets}
                    aspects={aspects}
                    size={400}
                    selectedGenre={selectedGenre}
                    onGenreChange={setSelectedGenre}
                  />
                </div>
              )}
            </ClientOnly>
          </div>
        </div>

        {/* Core Functionality */}
        <ClientOnly>
          <DailyChartPlayer />
        </ClientOnly>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-emerald-500/20">
            <h3 className="text-xl font-semibold text-white mb-3">🌅 Daily Charts</h3>
            <p className="text-slate-300">
              Generate music based on today's planetary positions and transits
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-emerald-500/20">
            <h3 className="text-xl font-semibold text-white mb-3">🎵 Multiple Genres</h3>
            <p className="text-slate-300">
              Switch between ambient, techno, world, and hip-hop styles
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-emerald-500/20">
            <h3 className="text-xl font-semibold text-white mb-3">🔮 Swiss Ephemeris</h3>
            <p className="text-slate-300">
              Precise astrological calculations using professional-grade ephemeris data
            </p>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            Backend API: <span className="text-emerald-400">Ready</span> | 
            Audio Engine: <span className="text-emerald-400">Active</span> | 
            Swiss Ephemeris: <span className="text-emerald-400">Connected</span>
          </p>
        </div>
      </div>
    </div>
  );
} 