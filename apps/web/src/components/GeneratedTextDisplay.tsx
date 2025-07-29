'use client';

import React, { useState, useEffect } from 'react';
import { AstroChart, AudioSession } from '../types';

interface GeneratedTextDisplayProps {
  chart: AstroChart;
  session?: AudioSession | null;
  mode?: 'daily' | 'overlay' | 'sandbox' | 'individual';
  secondChart?: AstroChart | null;
}

export default function GeneratedTextDisplay({ 
  chart, 
  session, 
  mode = 'individual',
  secondChart 
}: GeneratedTextDisplayProps) {
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generateInterpretation = async () => {
      setIsGenerating(true);
      
      try {
        // Generate interpretation based on mode
        let interpretation = '';
        
        switch (mode) {
          case 'daily':
            interpretation = generateDailyInterpretation(chart);
            break;
          case 'overlay':
            interpretation = generateOverlayInterpretation(chart, secondChart);
            break;
          case 'sandbox':
            interpretation = generateSandboxInterpretation(chart);
            break;
          default:
            interpretation = generateIndividualInterpretation(chart);
        }
        
        setGeneratedText(interpretation);
      } catch (error) {
        console.error('Failed to generate interpretation:', error);
        setGeneratedText('Unable to generate interpretation at this time.');
      } finally {
        setIsGenerating(false);
      }
    };

    generateInterpretation();
  }, [chart, session, mode, secondChart]);

  const generateIndividualInterpretation = (chart: AstroChart): string => {
    const sunSign = chart.planets.Sun?.sign.name || 'unknown';
    const moonSign = chart.planets.Moon?.sign.name || 'unknown';
    const ascendant = chart.houses['1']?.sign.name || 'unknown';
    
    return `Your natal chart reveals a ${sunSign} Sun illuminating your core identity, while your ${moonSign} Moon governs your emotional landscape. With ${ascendant} rising, your outward expression carries the qualities of this cardinal sign.

The musical composition reflects your planetary placements: ${Object.entries(chart.planets).map(([planet, data]) => 
  `${planet} in ${data.sign.name} (House ${data.house})`
).join(', ')}. Each planet contributes its unique frequency to create a harmonious soundscape that mirrors your astrological blueprint.

This personalized soundtrack captures the essence of your cosmic DNA, translating celestial patterns into audible frequencies that resonate with your soul's journey.`;
  };

  const generateDailyInterpretation = (chart: AstroChart): string => {
    const sunSign = chart.planets.Sun?.sign.name || 'unknown';
    const moonSign = chart.planets.Moon?.sign.name || 'unknown';
    
    return `Today's cosmic weather brings ${sunSign} energy to the forefront, while ${moonSign} influences our emotional tides. The current planetary alignments create a unique musical signature that reflects today's astrological atmosphere.

The composition flows through all twelve houses, with each segment representing approximately 2 hours of today's energy. ${Object.entries(chart.planets).slice(0, 3).map(([planet, data]) => 
  `${planet} in ${data.sign.name}`
).join(', ')} set the primary themes for today's soundtrack.

This daily chart music serves as an audio meditation on the current celestial influences, helping you attune to today's cosmic rhythms and planetary energies.`;
  };

  const generateOverlayInterpretation = (chart1: AstroChart, chart2?: AstroChart | null): string => {
    if (!chart2) return generateIndividualInterpretation(chart1);
    
    const chart1Sun = chart1.planets.Sun?.sign.name || 'unknown';
    const chart2Sun = chart2.planets.Sun?.sign.name || 'unknown';
    
    return `This overlay composition explores the harmonic relationship between two charts. The first chart, with ${chart1Sun} Sun, blends with the second chart's ${chart2Sun} Sun to create a unique relational soundscape.

The musical structure alternates between the two charts, allowing each to express its distinct qualities while finding points of harmonic convergence. This creates a dialogue between two astrological signatures, revealing the potential for harmony and understanding between different cosmic blueprints.

The overlay reveals how two individuals' planetary placements can create complementary or contrasting musical themes, offering insight into the dynamics of their relationship through the language of sound.`;
  };

  const generateSandboxInterpretation = (chart: AstroChart): string => {
    return `This experimental composition explores the creative possibilities of astrological music generation. The sandbox mode allows for free exploration of planetary combinations and their musical expressions.

The current configuration features ${Object.entries(chart.planets).map(([planet, data]) => 
  `${planet} in ${data.sign.name}`
).join(', ')}, creating a unique soundscape that demonstrates the versatility of astrological music theory.

This mode serves as a laboratory for understanding how different planetary placements influence musical composition, helping to develop a deeper appreciation for the relationship between celestial patterns and auditory expression.`;
  };

  return (
    <div className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20">
      <h3 className="text-xl font-bold mb-4 text-center glow-text leading-[1.2] tracking-tight text-cosmic">
        Astrological Interpretation
      </h3>
      
      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mr-3"></div>
          <span className="text-gray-300">Generating interpretation...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-[1.6] tracking-normal">
              {generatedText}
            </p>
          </div>
          
          {session && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <h4 className="text-sm font-semibold text-emerald-300 mb-2">Session Details</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Mode: {session.configuration.mode}</div>
                <div>Duration: {session.configuration.duration}s</div>
                <div>Genre: {session.configuration.genre || 'Astrological'}</div>
                {session.configuration.mood && (
                  <div>Mood: {session.configuration.mood}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 