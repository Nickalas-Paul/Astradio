// AI Text Generator for Astradio
// Generates intuitive, engaging, and musically-aware scripts based on astrological data

export interface PlanetaryData {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  isRetrograde?: boolean;
  aspects?: Array<{
    planet: string;
    type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
    orb: number;
  }>;
}

export interface ChartData {
  planets: Record<string, PlanetaryData>;
  houses: Record<number, { sign: string; degree: number }>;
  ascendant: { sign: string; degree: number };
  midheaven: { sign: string; degree: number };
}

export interface TextGenerationRequest {
  type: 'daily_explainer' | 'daily_alignment' | 'chart_comparison' | 'sandbox_mode';
  primaryChart?: ChartData;
  secondaryChart?: ChartData;
  currentTransits?: ChartData;
  selectedPlanets?: string[];
  selectedHouses?: number[];
  musicalMood?: string;
  musicalTempo?: number;
  musicalKey?: string;
}

export interface GeneratedText {
  title: string;
  script: string;
  description: string;
  mood: string[];
  keywords: string[];
}

// Musical mood mappings
const musicalMoods = {
  'ambient': ['ethereal', 'dreamy', 'floating', 'atmospheric'],
  'bright': ['energetic', 'uplifting', 'vibrant', 'optimistic'],
  'introspective': ['contemplative', 'deep', 'reflective', 'mysterious'],
  'passionate': ['intense', 'dynamic', 'powerful', 'driven'],
  'harmonious': ['balanced', 'flowing', 'peaceful', 'melodic'],
  'complex': ['layered', 'intricate', 'sophisticated', 'nuanced']
};

// Planetary musical characteristics
const planetaryMusic = {
  'Sun': { instrument: 'brass', energy: 'bright', mood: 'confident' },
  'Moon': { instrument: 'strings', energy: 'flowing', mood: 'emotional' },
  'Mercury': { instrument: 'woodwinds', energy: 'quick', mood: 'intellectual' },
  'Venus': { instrument: 'harp', energy: 'smooth', mood: 'harmonious' },
  'Mars': { instrument: 'drums', energy: 'driving', mood: 'passionate' },
  'Jupiter': { instrument: 'organ', energy: 'expansive', mood: 'optimistic' },
  'Saturn': { instrument: 'bass', energy: 'steady', mood: 'disciplined' },
  'Uranus': { instrument: 'synthesizer', energy: 'sudden', mood: 'innovative' },
  'Neptune': { instrument: 'choir', energy: 'dissolving', mood: 'mystical' },
  'Pluto': { instrument: 'deep bass', energy: 'transformative', mood: 'intense' }
};

// House themes
const houseThemes = {
  1: 'identity and self-expression',
  2: 'values and resources',
  3: 'communication and learning',
  4: 'home and emotional foundation',
  5: 'creativity and romance',
  6: 'work and service',
  7: 'partnerships and relationships',
  8: 'transformation and shared resources',
  9: 'philosophy and expansion',
  10: 'career and public image',
  11: 'community and aspirations',
  12: 'spirituality and subconscious'
};

export class AstroTextGenerator {
  
  // Use Case 1: Landing Page Daily Explainer
  generateDailyExplainer(transits: ChartData, userChart: ChartData): GeneratedText {
    const dominantPlanets = this.getDominantPlanets(transits.planets);
    const musicalMood = this.analyzeMusicalMood(transits.planets);
    const houseProgression = this.getHouseProgression(transits.planets);
    
    const title = this.generateDailyTitle(dominantPlanets, musicalMood);
    const script = this.generateDailyScript(transits, houseProgression);
    const description = this.generateDailyDescription(transits, userChart, musicalMood);
    
    return {
      title,
      script,
      description,
      mood: [musicalMood],
      keywords: this.extractKeywords(dominantPlanets, musicalMood)
    };
  }

  // Use Case 2: Overlay - Daily Alignment
  generateDailyAlignment(currentTransits: ChartData, userChart: ChartData): GeneratedText {
    const interactions = this.analyzeTransitInteractions(currentTransits, userChart);
    const musicalElements = this.mapMusicalElements(interactions);
    
    const title = this.generateAlignmentTitle(interactions);
    const script = this.generateAlignmentScript(interactions, musicalElements);
    const description = this.generateAlignmentDescription(interactions, musicalElements);
    
    return {
      title,
      script,
      description,
      mood: this.extractMoods(interactions),
      keywords: this.extractKeywords(interactions, 'alignment')
    };
  }

  // Use Case 3: Overlay - Chart Comparison
  generateChartComparison(chart1: ChartData, chart2: ChartData): GeneratedText {
    const compatibility = this.analyzeChartCompatibility(chart1, chart2);
    const musicalHarmony = this.analyzeMusicalHarmony(compatibility);
    
    const title = this.generateComparisonTitle(compatibility);
    const script = this.generateComparisonScript(compatibility, musicalHarmony);
    const description = this.generateComparisonDescription(compatibility, musicalHarmony);
    
    return {
      title,
      script,
      description,
      mood: this.extractMoods(compatibility),
      keywords: this.extractKeywords(compatibility, 'compatibility')
    };
  }

  // Use Case 4: Sandbox Mode
  generateSandboxInterpretation(selectedPlanets: string[], selectedHouses: number[], chartData: ChartData): GeneratedText {
    const interpretation = this.analyzeSandboxSelection(selectedPlanets, selectedHouses, chartData);
    const musicalExplanation = this.explainMusicalElements(interpretation);
    
    const title = this.generateSandboxTitle(interpretation);
    const script = this.generateSandboxScript(interpretation, musicalExplanation);
    const description = this.generateSandboxDescription(interpretation, musicalExplanation);
    
    return {
      title,
      script,
      description,
      mood: this.extractMoods(interpretation),
      keywords: this.extractKeywords(interpretation, 'experimental')
    };
  }

  // Helper methods
  private getDominantPlanets(planets: Record<string, PlanetaryData>): string[] {
    const planetEntries = Object.entries(planets);
    return planetEntries
      .sort((a, b) => b[1].house - a[1].house)
      .slice(0, 3)
      .map(([planet]) => planet);
  }

  private analyzeMusicalMood(planets: Record<string, PlanetaryData>): string {
    const moods = Object.values(planets).map(p => {
      const planetMusic = planetaryMusic[p.planet as keyof typeof planetaryMusic];
      return planetMusic?.mood || 'neutral';
    });
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  private getHouseProgression(planets: Record<string, PlanetaryData>): number[] {
    return Object.values(planets)
      .map(p => p.house)
      .sort((a, b) => a - b);
  }

  private generateDailyTitle(planets: string[], mood: string): string {
    const planetNames = planets.slice(0, 2).join(' & ');
    const moodAdjectives = {
      'confident': 'Bold',
      'emotional': 'Flowing',
      'intellectual': 'Curious',
      'harmonious': 'Balanced',
      'passionate': 'Dynamic',
      'optimistic': 'Expansive',
      'disciplined': 'Structured',
      'innovative': 'Electric',
      'mystical': 'Ethereal',
      'intense': 'Powerful'
    };
    
    return `Today's Vibe: ${moodAdjectives[mood as keyof typeof moodAdjectives] || 'Cosmic'} ${planetNames}`;
  }

  private generateDailyScript(transits: ChartData, houseProgression: number[]): string {
    const firstHouse = houseProgression[0];
    const lastHouse = houseProgression[houseProgression.length - 1];
    
    return `The music begins in your ${houseThemes[firstHouse as keyof typeof houseThemes]}, building through each house until reaching ${houseThemes[lastHouse as keyof typeof houseThemes]}. Today's planetary dance creates a ${this.analyzeMusicalMood(transits.planets)} energy that flows through your entire chart.`;
  }

  private generateDailyDescription(transits: ChartData, userChart: ChartData, mood: string): string {
    const dominantPlanets = this.getDominantPlanets(transits.planets);
    const userPlanets = Object.keys(userChart.planets);
    
    return `Today's ${dominantPlanets.join(', ')} are creating a ${mood} atmosphere that resonates deeply with your ${userPlanets.slice(0, 2).join(' and ')}. The musical progression mirrors the way these energies flow through your chart, from personal identity to spiritual completion. Each house represents a different aspect of your experience, and the music reflects this journey through varying tempos, instruments, and emotional tones.`;
  }

  private analyzeTransitInteractions(transits: ChartData, userChart: ChartData): any {
    const interactions = [];
    
    for (const [transitPlanet, transitData] of Object.entries(transits.planets)) {
      const userPlanet = userChart.planets[transitPlanet];
      if (userPlanet) {
        const aspect = this.calculateAspect(transitData, userPlanet);
        interactions.push({
          transitPlanet,
          userPlanet: transitPlanet,
          aspect,
          house: transitData.house,
          theme: houseThemes[transitData.house as keyof typeof houseThemes]
        });
      }
    }
    
    return interactions;
  }

  private calculateAspect(planet1: PlanetaryData, planet2: PlanetaryData): string {
    const diff = Math.abs(planet1.degree - planet2.degree);
    if (diff <= 8) return 'conjunction';
    if (diff >= 82 && diff <= 98) return 'square';
    if (diff >= 172 && diff <= 188) return 'opposition';
    if (diff >= 58 && diff <= 62) return 'sextile';
    if (diff >= 118 && diff <= 122) return 'trine';
    return 'no major aspect';
  }

  private mapMusicalElements(interactions: any[]): any[] {
    return interactions.map(interaction => ({
      ...interaction,
      musicalElement: this.getMusicalElement(interaction.aspect, interaction.transitPlanet)
    }));
  }

  private getMusicalElement(aspect: string, planet: string): string {
    const planetMusic = planetaryMusic[planet as keyof typeof planetaryMusic];
    const aspectEffects = {
      'conjunction': 'intensified',
      'square': 'tension',
      'opposition': 'contrast',
      'sextile': 'harmonious flow',
      'trine': 'smooth blending',
      'no major aspect': 'subtle influence'
    };
    
    return `${planetMusic.instrument} with ${aspectEffects[aspect as keyof typeof aspectEffects]} energy`;
  }

  private generateAlignmentTitle(interactions: any[]): string {
    const strongestInteraction = interactions.sort((a, b) => 
      this.getAspectStrength(b.aspect) - this.getAspectStrength(a.aspect)
    )[0];
    
    return `Daily Resonance: ${strongestInteraction.transitPlanet} ${strongestInteraction.aspect} Your ${strongestInteraction.userPlanet}`;
  }

  private getAspectStrength(aspect: string): number {
    const strengths = {
      'conjunction': 5,
      'opposition': 4,
      'square': 3,
      'trine': 2,
      'sextile': 1,
      'no major aspect': 0
    };
    return strengths[aspect as keyof typeof strengths] || 0;
  }

  private generateAlignmentScript(interactions: any[], musicalElements: any[]): string {
    const primaryElement = musicalElements[0];
    return `The ${primaryElement.musicalElement} reflects how today's ${primaryElement.transitPlanet} is activating your ${primaryElement.theme}. This creates a ${primaryElement.aspect} energy that flows through your entire musical experience.`;
  }

  private generateAlignmentDescription(interactions: any[], musicalElements: any[]): string {
    const primary = musicalElements[0];
    const secondary = musicalElements[1];
    
    return `Today's ${primary.transitPlanet} is forming a ${primary.aspect} with your natal ${primary.userPlanet}, creating ${primary.musicalElement}. This manifests as ${primary.theme} in your life, with the music reflecting this energy through ${primary.musicalElement}. ${secondary ? `Additionally, ${secondary.transitPlanet} brings ${secondary.musicalElement} to your ${secondary.theme}.` : ''} The overall composition weaves these influences together, creating a unique soundtrack for your day.`;
  }

  private analyzeChartCompatibility(chart1: ChartData, chart2: ChartData): any {
    const compatibility = {
      harmonies: [] as string[],
      tensions: [] as string[],
      overlaps: [] as string[]
    };
    
    // Analyze Sun-Moon combinations
    const sun1 = chart1.planets['Sun'];
    const moon1 = chart1.planets['Moon'];
    const sun2 = chart2.planets['Sun'];
    const moon2 = chart2.planets['Moon'];
    
    if (sun1 && sun2) {
      const sunAspect = this.calculateAspect(sun1, sun2);
      if (['trine', 'sextile'].includes(sunAspect)) {
        compatibility.harmonies.push('Sun-Sun harmony');
      } else if (['square', 'opposition'].includes(sunAspect)) {
        compatibility.tensions.push('Sun-Sun tension');
      }
    }
    
    if (moon1 && moon2) {
      const moonAspect = this.calculateAspect(moon1, moon2);
      if (['trine', 'sextile'].includes(moonAspect)) {
        compatibility.harmonies.push('Moon-Moon harmony');
      } else if (['square', 'opposition'].includes(moonAspect)) {
        compatibility.tensions.push('Moon-Moon tension');
      }
    }
    
    return compatibility;
  }

  private analyzeMusicalHarmony(compatibility: any): string {
    const harmonyCount = compatibility.harmonies.length;
    const tensionCount = compatibility.tensions.length;
    
    if (harmonyCount > tensionCount) {
      return 'harmonious blending of instruments and melodies';
    } else if (tensionCount > harmonyCount) {
      return 'dynamic tension between contrasting musical elements';
    } else {
      return 'balanced interplay of harmonious and challenging elements';
    }
  }

  private generateComparisonTitle(compatibility: any): string {
    const harmonyCount = compatibility.harmonies.length;
    const tensionCount = compatibility.tensions.length;
    
    if (harmonyCount > tensionCount) {
      return 'Cosmic Harmony: Flowing Connection';
    } else if (tensionCount > harmonyCount) {
      return 'Dynamic Tension: Growth Through Challenge';
    } else {
      return 'Balanced Resonance: Complementary Energies';
    }
  }

  private generateComparisonScript(compatibility: any, musicalHarmony: string): string {
    return `The music reflects ${musicalHarmony}, mirroring how your charts interact. ${compatibility.harmonies.length > 0 ? `Harmonious aspects create flowing melodies, while ` : ''}${compatibility.tensions.length > 0 ? 'tension aspects introduce dynamic contrasts that create growth and learning.' : 'the overall energy flows smoothly between both charts.'}`;
  }

  private generateComparisonDescription(compatibility: any, musicalHarmony: string): string {
    const harmonyText = compatibility.harmonies.length > 0 
      ? `The ${compatibility.harmonies.join(', ')} create flowing, harmonious musical passages that reflect your natural compatibility. `
      : '';
    
    const tensionText = compatibility.tensions.length > 0
      ? `The ${compatibility.tensions.join(', ')} introduce dynamic contrasts and challenging elements that create opportunities for growth and learning. `
      : '';
    
    return `${harmonyText}${tensionText}The overall composition weaves these elements together, creating ${musicalHarmony} that represents the unique relationship between your charts. Each musical phrase reflects different aspects of your connection, from the harmonious blending of compatible elements to the dynamic tension that drives growth and evolution.`;
  }

  private analyzeSandboxSelection(planets: string[], houses: number[], chartData: ChartData): any {
    const analysis = {
      selectedPlanets: planets.map(planet => ({
        planet,
        data: chartData.planets[planet],
        musical: planetaryMusic[planet]
      })),
      selectedHouses: houses.map(house => ({
        house,
        theme: houseThemes[house]
      })),
      overallMood: this.calculateOverallMood(planets, chartData)
    };
    
    return analysis;
  }

  private calculateOverallMood(planets: string[], chartData: ChartData): string {
    const moods = planets.map(planet => planetaryMusic[planet]?.mood || 'neutral');
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  private explainMusicalElements(interpretation: any): string {
    const instruments = interpretation.selectedPlanets.map(p => p.musical.instrument);
    const uniqueInstruments = [...new Set(instruments)];
    
    return `The ${uniqueInstruments.join(' and ')} create a ${interpretation.overallMood} atmosphere, with each instrument representing different planetary influences. The musical progression reflects the themes of ${interpretation.selectedHouses.map(h => h.theme).join(', ')}.`;
  }

  private generateSandboxTitle(interpretation: any): string {
    const primaryPlanet = interpretation.selectedPlanets[0];
    const primaryHouse = interpretation.selectedHouses[0];
    
    return `Experimental Blend: ${primaryPlanet.planet} in ${primaryHouse.theme}`;
  }

  private generateSandboxScript(interpretation: any, musicalExplanation: string): string {
    return `${musicalExplanation} This experimental combination creates a unique musical signature that reflects the specific planetary and house energies you've selected.`;
  }

  private generateSandboxDescription(interpretation: any, musicalExplanation: string): string {
    const planetNames = interpretation.selectedPlanets.map(p => p.planet).join(', ');
    const houseThemes = interpretation.selectedHouses.map(h => h.theme).join(', ');
    
    return `${musicalExplanation} By selecting ${planetNames} and focusing on ${houseThemes}, you've created a custom musical experiment that explores how these specific astrological elements interact. The ${interpretation.overallMood} mood reflects the dominant energy of your selection, while the varying instruments and house themes create a rich, layered composition that represents your unique astrological experiment.`;
  }

  private extractMoods(data: any): string[] {
    // Extract moods from various data structures
    if (Array.isArray(data)) {
      return data.map(item => item.mood || 'neutral').filter(Boolean);
    }
    if (typeof data === 'object' && data.mood) {
      return [data.mood];
    }
    return ['cosmic'];
  }

  private extractKeywords(data: any, context: string): string[] {
    const keywords = [];
    
    if (context === 'alignment') {
      keywords.push('daily', 'transits', 'resonance');
    } else if (context === 'compatibility') {
      keywords.push('relationship', 'harmony', 'connection');
    } else if (context === 'experimental') {
      keywords.push('experimental', 'custom', 'exploration');
    }
    
    // Add musical keywords
    keywords.push('astrological', 'musical', 'cosmic');
    
    return keywords;
  }
}

// Export singleton instance
export const astroTextGenerator = new AstroTextGenerator(); 