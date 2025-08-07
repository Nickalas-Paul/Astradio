import React, { useEffect, useState } from 'react';
import { AstroChart } from '../types';

interface AudioTextGeneratorProps {
  mode: 'natal' | 'compare' | 'sandbox';
  chartA?: AstroChart | null;
  chartB?: AstroChart | null;
  isVisible?: boolean;
}

interface AudioInterpretation {
  mood: string;
  influences: string[];
  prompt?: string;
}

export default function AudioTextGenerator({ 
  mode, 
  chartA, 
  chartB, 
  isVisible = true 
}: AudioTextGeneratorProps) {
  const [interpretation, setInterpretation] = useState<AudioInterpretation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isVisible && (chartA || chartB)) {
      generateInterpretation();
    }
  }, [mode, chartA, chartB, isVisible]);

  const generateInterpretation = async () => {
    setIsGenerating(true);
    
    try {
      const interpretation = await analyzeChartInfluences();
      setInterpretation(interpretation);
    } catch (error) {
      console.error('Failed to generate audio interpretation:', error);
      setInterpretation({
        mood: "The cosmic energy is still revealing its musical secrets...",
        influences: ["Chart analysis in progress"],
        prompt: "Take a moment to feel the emerging vibrations."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeChartInfluences = async (): Promise<AudioInterpretation> => {
    // Client-side analysis for immediate feedback
    const analysis = analyzeChartData();
    
    // For more sophisticated analysis, we could call the backend
    // const response = await fetch('/api/generate-audio-text', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ mode, chartA, chartB })
    // });
    // return response.json();
    
    return analysis;
  };

  const analyzeChartData = (): AudioInterpretation => {
    const planets = chartA?.planets || {};
    const overlayPlanets = chartB?.planets || {};
    
    // Analyze planet placements
    const planetAnalysis = analyzePlanetPlacements(planets);
    const aspectAnalysis = { harmonious: [], challenging: [], majorAspects: [] }; // No aspects in current chart structure
    const overlayAnalysis = mode === 'compare' ? analyzeOverlayInteraction(planets, overlayPlanets) : null;
    
    // Generate mood based on dominant elements and aspects
    const mood = generateMood(planetAnalysis, aspectAnalysis, overlayAnalysis);
    
    // Generate specific influences
    const influences = generateInfluences(planetAnalysis, aspectAnalysis, overlayAnalysis);
    
    // Generate introspective prompt
    const prompt = generatePrompt(mood, planetAnalysis);
    
    return { mood, influences, prompt };
  };

  const analyzePlanetPlacements = (planets: any) => {
    const analysis = {
      elements: { fire: 0, earth: 0, air: 0, water: 0 },
      houses: {} as any,
      dominantPlanets: [] as string[],
      musicalQualities: [] as string[]
    };

    Object.entries(planets).forEach(([planetName, planet]: [string, any]) => {
      const sign = planet.sign?.name || 'Aries';
      const house = planet.house || 1;
      
      // Count elements
      if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) analysis.elements.fire++;
      else if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) analysis.elements.earth++;
      else if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) analysis.elements.air++;
      else if (['Cancer', 'Scorpio', 'Pisces'].includes(sign)) analysis.elements.water++;
      
      // Track house placements
      analysis.houses[house] = (analysis.houses[house] || 0) + 1;
      
      // Identify dominant planets
      if (['Sun', 'Moon', 'Venus', 'Mars'].includes(planetName)) {
        analysis.dominantPlanets.push(planetName);
      }
      
      // Add musical qualities based on planet-sign combinations
      analysis.musicalQualities.push(getPlanetSignMusicalQuality(planetName, sign));
    });

    return analysis;
  };

  const analyzeAspects = (aspects: any[]) => {
    const analysis = {
      harmonious: [] as string[],
      challenging: [] as string[],
      majorAspects: [] as string[]
    };

    aspects.forEach(aspect => {
      const aspectType = aspect.type || 'conjunction';
      const planet1 = aspect.planet1?.name || '';
      const planet2 = aspect.planet2?.name || '';
      
      if (['trine', 'sextile'].includes(aspectType)) {
        analysis.harmonious.push(`${planet1} ${aspectType} ${planet2}`);
      } else if (['square', 'opposition'].includes(aspectType)) {
        analysis.challenging.push(`${planet1} ${aspectType} ${planet2}`);
      }
      
      if (['conjunction', 'opposition', 'square', 'trine'].includes(aspectType)) {
        analysis.majorAspects.push(`${planet1} ${aspectType} ${planet2}`);
      }
    });

    return analysis;
  };

  const analyzeOverlayInteraction = (chart1Planets: any, chart2Planets: any) => {
    const analysis = {
      harmonies: [] as string[],
      tensions: [] as string[],
      combinedElements: { fire: 0, earth: 0, air: 0, water: 0 }
    };

    // Analyze element combinations
    Object.values(chart1Planets).forEach((planet: any) => {
      const sign = planet.sign?.name || 'Aries';
      if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) analysis.combinedElements.fire++;
      else if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) analysis.combinedElements.earth++;
      else if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) analysis.combinedElements.air++;
      else if (['Cancer', 'Scorpio', 'Pisces'].includes(sign)) analysis.combinedElements.water++;
    });

    Object.values(chart2Planets).forEach((planet: any) => {
      const sign = planet.sign?.name || 'Aries';
      if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) analysis.combinedElements.fire++;
      else if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) analysis.combinedElements.earth++;
      else if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) analysis.combinedElements.air++;
      else if (['Cancer', 'Scorpio', 'Pisces'].includes(sign)) analysis.combinedElements.water++;
    });

    return analysis;
  };

  const getPlanetSignMusicalQuality = (planet: string, sign: string): string => {
    const qualities: { [key: string]: { [key: string]: string } } = {
      Sun: {
        Aries: "bold, rhythmic foundation",
        Leo: "warm, resonant melodies",
        Sagittarius: "expansive, adventurous themes"
      },
      Moon: {
        Cancer: "emotional, flowing harmonies",
        Scorpio: "deep, mysterious undertones",
        Pisces: "dreamy, ethereal textures"
      },
      Venus: {
        Taurus: "rich, sensual harmonies",
        Libra: "balanced, elegant melodies",
        Pisces: "romantic, otherworldly sounds"
      },
      Mars: {
        Aries: "dynamic, energetic rhythms",
        Scorpio: "intense, powerful bass",
        Capricorn: "disciplined, structured beats"
      }
    };

    return qualities[planet]?.[sign] || "unique musical signature";
  };

  const generateMood = (planetAnalysis: any, aspectAnalysis: any, overlayAnalysis: any): string => {
    const { elements, musicalQualities } = planetAnalysis;
    const { harmonious, challenging } = aspectAnalysis;
    
    // Determine dominant element
    const dominantElement = Object.entries(elements).reduce((a, b) => 
      (elements[a[0]] || 0) > (elements[b[0]] || 0) ? a : b
    )[0];
    
    // Determine mood based on elements and aspects
    let mood = "";
    
    if (dominantElement === 'fire') {
      mood = "passionate and energetic";
      if (challenging.length > harmonious.length) mood += " with underlying tension";
    } else if (dominantElement === 'earth') {
      mood = "grounded and structured";
      if (harmonious.length > challenging.length) mood += " with natural flow";
    } else if (dominantElement === 'air') {
      mood = "intellectual and light";
      if (musicalQualities.length > 3) mood += " with complex harmonies";
    } else if (dominantElement === 'water') {
      mood = "emotional and flowing";
      if (challenging.length > 0) mood += " with deep undercurrents";
    }
    
    if (overlayAnalysis) {
      mood += " - enhanced by cosmic overlay";
    }
    
    return mood;
  };

  const generateInfluences = (planetAnalysis: any, aspectAnalysis: any, overlayAnalysis: any): string[] => {
    const influences: string[] = [];
    
    // Add dominant planet influences
    planetAnalysis.dominantPlanets.forEach((planet: string) => {
      influences.push(`${planet} leads the musical composition with its unique signature`);
    });
    
    // Add aspect influences
    aspectAnalysis.harmonious.forEach((aspect: string) => {
      influences.push(`${aspect} creates harmonious musical layers`);
    });
    
    aspectAnalysis.challenging.forEach((aspect: string) => {
      influences.push(`${aspect} introduces dynamic tension and contrast`);
    });
    
    // Add overlay influences
    if (overlayAnalysis) {
      const totalElements = Object.values(overlayAnalysis.combinedElements).reduce((a: number, b: number) => a + b, 0 as number);
      if (totalElements > 8) {
        influences.push("Rich planetary overlay creates complex harmonic textures");
      }
    }
    
    return influences.slice(0, 3); // Limit to top 3 influences
  };

  const generatePrompt = (mood: string, planetAnalysis: any): string => {
    const { elements } = planetAnalysis;
    const dominantElement = Object.entries(elements).reduce((a, b) => 
      (elements[a[0]] || 0) > (elements[b[0]] || 0) ? a : b
    )[0];
    
    const prompts = {
      fire: "Where in your life are you ready to express your passion through sound?",
      earth: "What structures in your life are calling for musical grounding?",
      air: "How can you bring intellectual clarity to your emotional soundscape?",
      water: "What depths of feeling are ready to flow through your music?"
    };
    
    return prompts[dominantElement as keyof typeof prompts] || "How does this cosmic energy resonate with your inner voice?";
  };

  if (!isVisible) return null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20 max-w-4xl mx-auto mb-8 shadow-lg">
      <h3 className="text-xl font-semibold mb-4 font-sans text-emerald-400">
        🎵 Audio Interpretation
      </h3>
      
      {isGenerating ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-slate-400 font-light">Analyzing cosmic musical influences...</p>
        </div>
      ) : interpretation ? (
        <div className="space-y-4">
          {/* Mood Summary */}
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <h4 className="text-lg font-semibold mb-2 text-emerald-400 font-sans">🎼 Audio Mood</h4>
            <p className="text-slate-200 leading-relaxed font-light">
              {interpretation.mood}
            </p>
          </div>
          
          {/* Influences */}
          {interpretation.influences.length > 0 && (
            <div className="bg-violet-500/10 rounded-xl p-4 border border-violet-500/20">
              <h4 className="text-lg font-semibold mb-2 text-violet-400 font-sans">🪐 Key Influences</h4>
              <ul className="space-y-2">
                {interpretation.influences.map((influence, index) => (
                  <li key={index} className="text-slate-200 text-sm leading-relaxed font-light">
                    • {influence}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Introspective Prompt */}
          {interpretation.prompt && (
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <h4 className="text-lg font-semibold mb-2 text-blue-400 font-sans">🧠 Reflection</h4>
              <p className="text-slate-200 leading-relaxed font-light italic">
                {interpretation.prompt}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400 font-light">
            Generate a chart to see its musical interpretation
          </p>
        </div>
      )}
    </div>
  );
} 