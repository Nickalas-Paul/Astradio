'use client';

import React, { useState } from 'react';
import Navigation from '../../components/Navigation';
import { useTextGenerator } from '../../lib/useTextGenerator';
import GeneratedTextDisplay from '../../components/GeneratedTextDisplay';
import { type ChartData } from '../../lib/textGenerator';

export default function TextDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'daily' | 'alignment' | 'comparison' | 'sandbox'>('daily');
  const [generatedText, setGeneratedText] = useState<any>(null);
  
  const { 
    generateDailyExplainer, 
    generateDailyAlignment, 
    generateChartComparison, 
    generateSandboxInterpretation,
    isGenerating 
  } = useTextGenerator({
    onGenerated: (text) => setGeneratedText(text),
    onError: (error) => console.error('Text generation error:', error)
  });

  // Sample chart data
  const sampleUserChart: ChartData = {
    planets: {
      'Sun': { planet: 'Sun', sign: 'Libra', house: 5, degree: 15 },
      'Moon': { planet: 'Moon', sign: 'Cancer', house: 2, degree: 8 },
      'Mercury': { planet: 'Mercury', sign: 'Libra', house: 5, degree: 12 },
      'Venus': { planet: 'Venus', sign: 'Virgo', house: 4, degree: 25 },
      'Mars': { planet: 'Mars', sign: 'Scorpio', house: 6, degree: 18 }
    },
    houses: {
      1: { sign: 'Leo', degree: 0 },
      2: { sign: 'Virgo', degree: 0 },
      3: { sign: 'Libra', degree: 0 },
      4: { sign: 'Scorpio', degree: 0 },
      5: { sign: 'Sagittarius', degree: 0 },
      6: { sign: 'Capricorn', degree: 0 },
      7: { sign: 'Aquarius', degree: 0 },
      8: { sign: 'Pisces', degree: 0 },
      9: { sign: 'Aries', degree: 0 },
      10: { sign: 'Taurus', degree: 0 },
      11: { sign: 'Gemini', degree: 0 },
      12: { sign: 'Cancer', degree: 0 }
    },
    ascendant: { sign: 'Leo', degree: 0 },
    midheaven: { sign: 'Taurus', degree: 0 }
  };

  const sampleTransits: ChartData = {
    planets: {
      'Sun': { planet: 'Sun', sign: 'Capricorn', house: 10, degree: 22 },
      'Moon': { planet: 'Moon', sign: 'Pisces', house: 12, degree: 15 },
      'Mercury': { planet: 'Mercury', sign: 'Capricorn', house: 10, degree: 18 },
      'Venus': { planet: 'Venus', sign: 'Sagittarius', house: 9, degree: 8 },
      'Mars': { planet: 'Mars', sign: 'Aquarius', house: 11, degree: 5 }
    },
    houses: {
      1: { sign: 'Libra', degree: 0 },
      2: { sign: 'Scorpio', degree: 0 },
      3: { sign: 'Sagittarius', degree: 0 },
      4: { sign: 'Capricorn', degree: 0 },
      5: { sign: 'Aquarius', degree: 0 },
      6: { sign: 'Pisces', degree: 0 },
      7: { sign: 'Aries', degree: 0 },
      8: { sign: 'Taurus', degree: 0 },
      9: { sign: 'Gemini', degree: 0 },
      10: { sign: 'Cancer', degree: 0 },
      11: { sign: 'Leo', degree: 0 },
      12: { sign: 'Virgo', degree: 0 }
    },
    ascendant: { sign: 'Libra', degree: 0 },
    midheaven: { sign: 'Cancer', degree: 0 }
  };

  const samplePartnerChart: ChartData = {
    planets: {
      'Sun': { planet: 'Sun', sign: 'Aries', house: 1, degree: 12 },
      'Moon': { planet: 'Moon', sign: 'Pisces', house: 12, degree: 8 },
      'Mercury': { planet: 'Mercury', sign: 'Aries', house: 1, degree: 15 },
      'Venus': { planet: 'Venus', sign: 'Taurus', house: 2, degree: 3 },
      'Mars': { planet: 'Mars', sign: 'Gemini', house: 3, degree: 20 }
    },
    houses: {
      1: { sign: 'Aries', degree: 0 },
      2: { sign: 'Taurus', degree: 0 },
      3: { sign: 'Gemini', degree: 0 },
      4: { sign: 'Cancer', degree: 0 },
      5: { sign: 'Leo', degree: 0 },
      6: { sign: 'Virgo', degree: 0 },
      7: { sign: 'Libra', degree: 0 },
      8: { sign: 'Scorpio', degree: 0 },
      9: { sign: 'Sagittarius', degree: 0 },
      10: { sign: 'Capricorn', degree: 0 },
      11: { sign: 'Aquarius', degree: 0 },
      12: { sign: 'Pisces', degree: 0 }
    },
    ascendant: { sign: 'Aries', degree: 0 },
    midheaven: { sign: 'Capricorn', degree: 0 }
  };

  const runDemo = async () => {
    try {
      switch (activeDemo) {
        case 'daily':
          await generateDailyExplainer(sampleTransits, sampleUserChart);
          break;
        case 'alignment':
          await generateDailyAlignment(sampleTransits, sampleUserChart);
          break;
        case 'comparison':
          await generateChartComparison(sampleUserChart, samplePartnerChart);
          break;
        case 'sandbox':
          await generateSandboxInterpretation(['Sun', 'Moon', 'Venus'], [5, 7, 10], sampleUserChart);
          break;
      }
    } catch (error) {
      console.error('Demo failed:', error);
    }
  };

  const demos = [
    {
      id: 'daily',
      title: 'Daily Explainer',
      description: 'Landing page summary of today\'s planetary transits and musical mood',
      icon: '🌅'
    },
    {
      id: 'alignment',
      title: 'Daily Alignment',
      description: 'Today\'s transits interacting with your birth chart',
      icon: '🪐'
    },
    {
      id: 'comparison',
      title: 'Chart Comparison',
      description: 'Two charts blending in cosmic harmony',
      icon: '🤝'
    },
    {
      id: 'sandbox',
      title: 'Sandbox Mode',
      description: 'Custom planetary and house combinations',
      icon: '🧪'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-[1.2] tracking-tight gradient-text-cosmic cosmic-glow-text">
            AI Text Generator Demo
          </h1>
          <p className="text-xl text-gray-300 mb-6 leading-[1.4] tracking-normal">
            Explore the intelligent text generation system that bridges astrology and music
          </p>
        </div>

        {/* Demo Selector */}
        <div className="glass-morphism-strong rounded-3xl p-8 mb-8 cosmic-glow">
          <h2 className="text-2xl font-mystical font-semibold text-cosmic mb-6 text-center">
            Choose Demo Type
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id as any)}
                className={`p-6 rounded-xl text-center transition-all duration-200 ${
                  activeDemo === demo.id
                    ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30'
                    : 'bg-gray-800/50 border border-gray-700/50 hover:border-emerald-500/30'
                }`}
              >
                <div className="text-3xl mb-3">{demo.icon}</div>
                <h3 className="text-lg font-semibold text-emerald-300 mb-2">
                  {demo.title}
                </h3>
                <p className="text-sm text-gray-300">
                  {demo.description}
                </p>
              </button>
            ))}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={runDemo}
              disabled={isGenerating}
              className="btn-cosmic px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Text...
                </span>
              ) : (
                `Generate ${demos.find(d => d.id === activeDemo)?.title}`
              )}
            </button>
          </div>
        </div>

        {/* Generated Text Display */}
        {generatedText && (
                    <div className="mb-8">
            <div className="mb-4 p-4 glass-morphism rounded-xl border border-emerald-500/20">
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Generated Text</h3>
              <p className="text-gray-300">{generatedText}</p>
            </div>
          </div>
        )}

        {/* Sample Data Display */}
        <div className="glass-morphism rounded-2xl p-6">
          <h3 className="text-xl font-mystical font-semibold text-cosmic mb-6">
            Sample Chart Data
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-300">User Chart</h4>
              <div className="space-y-2 text-sm">
                <div>Sun: Libra in House 5</div>
                <div>Moon: Cancer in House 2</div>
                <div>Mercury: Libra in House 5</div>
                <div>Venus: Virgo in House 4</div>
                <div>Mars: Scorpio in House 6</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-300">Current Transits</h4>
              <div className="space-y-2 text-sm">
                <div>Sun: Capricorn in House 10</div>
                <div>Moon: Pisces in House 12</div>
                <div>Mercury: Capricorn in House 10</div>
                <div>Venus: Sagittarius in House 9</div>
                <div>Mars: Aquarius in House 11</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-purple-300">Partner Chart</h4>
              <div className="space-y-2 text-sm">
                <div>Sun: Aries in House 1</div>
                <div>Moon: Pisces in House 12</div>
                <div>Mercury: Aries in House 1</div>
                <div>Venus: Taurus in House 2</div>
                <div>Mars: Gemini in House 3</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 