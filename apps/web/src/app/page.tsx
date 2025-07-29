'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import AnimatedChartWheel from '../components/AnimatedChartWheel';
import { AstroChart } from '../types';
import { buildSecureAPIUrl, clientRateLimiter, sanitizeHTML } from '../lib/security';

export default function HomePage() {
  const [todayChart, setTodayChart] = useState<AstroChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGenre, setCurrentGenre] = useState<string>('ambient');
  const [aiDescription, setAiDescription] = useState<string>('');

  useEffect(() => {
    const loadTodayChart = async () => {
      try {
        // Rate limiting check
        if (!clientRateLimiter.canMakeRequest('daily')) {
          console.warn('Rate limit exceeded for daily chart request');
          return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const apiUrl = buildSecureAPIUrl(`daily/${today}`);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setTodayChart(data.data.chart);
          // Set random genre
          const genres = ['ambient', 'folk', 'jazz', 'classical', 'electronic', 'rock', 'blues', 'world', 'techno', 'chill'];
          setCurrentGenre(genres[Math.floor(Math.random() * genres.length)]);
          
          // Generate AI description with sanitized content
          const sunSign = data.data.chart.planets.Sun?.sign.name || 'cosmic';
          const moonSign = data.data.chart.planets.Moon?.sign.name || 'lunar';
          const mercurySign = data.data.chart.planets.Mercury?.sign.name || 'mercurial';
          const venusSign = data.data.chart.planets.Venus?.sign.name || 'venusian';
          const marsSign = data.data.chart.planets.Mars?.sign.name || 'martian';
          
          const description = `Today's ${sanitizeHTML(sunSign)} energy flows through ${sanitizeHTML(moonSign)} waters, creating a ${currentGenre} soundscape that mirrors the ${sanitizeHTML(mercurySign)} communication patterns. The ${sanitizeHTML(venusSign)} harmonies blend with ${sanitizeHTML(marsSign)} rhythms, offering a musical reflection of today's astrological landscape.`;
          
          setAiDescription(description);
        }
      } catch (error) {
        console.error('Failed to load today chart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayChart();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 glow-text leading-[1.2] tracking-tight gradient-text-cosmic cosmic-glow-text">
            Astradio
          </h1>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300 leading-[1.25] tracking-tight">
            Here's what today sounds like
          </h2>
          <p className="text-base text-gray-300 mb-4 leading-[1.4] tracking-normal">
            Transform astrological charts into personalized musical experiences
          </p>
        </div>

        {/* Today's Musical Wheel */}
        <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 max-w-4xl mx-auto mb-8 cosmic-glow">
          <h3 className="text-xl font-bold mb-4 text-center glow-text leading-[1.2] tracking-tight text-cosmic">
            Today's Astrological Soundscape
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
            </div>
          ) : todayChart ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <AnimatedChartWheel 
                  chart={todayChart}
                  isPlaying={false}
                  currentHouse={1}
                  duration={60}
                />
              </div>
              
              <div className="text-center">
                <div className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-4">
                  <span className="text-emerald-300 font-medium capitalize">{currentGenre}</span>
                </div>
                
                <p className="text-gray-300 leading-[1.6] tracking-normal max-w-2xl mx-auto">
                  {aiDescription}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-64 h-64 chart-wheel rounded-full border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl star-twinkle">🔮</span>
              </div>
              <p className="text-gray-300 leading-[1.4] tracking-normal">
                Loading today's cosmic soundtrack...
              </p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-4 glow-text leading-[1.2] tracking-tight gradient-text-cosmic">
            What does your chart sound like?
          </h3>
          <p className="text-gray-300 mb-6 leading-[1.4] tracking-normal">
            Explore different ways to experience your astrological soundtrack
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/chart" className="px-6 py-3 btn-cosmic rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-sans text-sm leading-none tracking-tight align-middle">
              Create Your Soundtrack
            </a>
            <a href="/overlay" className="px-6 py-3 btn-cosmic rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-sans text-sm leading-none tracking-tight align-middle">
              Compare Two Charts
            </a>
            <a href="/sandbox" className="px-6 py-3 btn-cosmic rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-sans text-sm leading-none tracking-tight align-middle">
              Explore Freely
            </a>
          </div>
        </div>

        {/* Current Planetary Positions */}
        {todayChart && (
          <div className="glass-morphism rounded-2xl p-4 border border-emerald-500/20 max-w-6xl mx-auto">
            <h3 className="text-xl font-bold mb-3 text-center glow-text leading-[1.2] tracking-tight text-cosmic">
              Today's Planetary Positions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(todayChart.planets).slice(0, 5).map(([planet, data]) => (
                <div key={planet} className="text-center p-3 glass-morphism-strong rounded-lg border border-emerald-500/10">
                  <div className="text-sm font-semibold text-emerald-300 leading-[1.25] tracking-tight">{planet}</div>
                  <div className="text-xs text-gray-400 leading-[1.4] tracking-normal">{data.sign.name}</div>
                  <div className="text-xs text-gray-400 leading-[1.25] tracking-normal">House {data.house}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 