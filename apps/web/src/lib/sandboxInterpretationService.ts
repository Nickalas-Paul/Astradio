export interface PlanetPlacement {
  planet: string;
  house: number;
  sign: string;
  degree: number;
}

export interface PlacementInterpretation {
  planet: string;
  house: number;
  sign: string;
  meaning: string;
  musicalInfluence: string;
  keywords: string[];
}

export interface AspectInterpretation {
  planet1: string;
  planet2: string;
  type: string;
  meaning: string;
  musicalInfluence: string;
  orb: number;
}

const HOUSE_MEANINGS: { [key: number]: string } = {
  1: "Identity, self-expression, and personal appearance",
  2: "Values, possessions, and material security",
  3: "Communication, learning, and immediate environment",
  4: "Home, family, and emotional foundation",
  5: "Creativity, romance, and self-expression",
  6: "Work, health, and daily routines",
  7: "Partnerships, relationships, and open enemies",
  8: "Transformation, shared resources, and deep psychology",
  9: "Higher learning, philosophy, and long-distance travel",
  10: "Career, public image, and life direction",
  11: "Friendships, groups, and future aspirations",
  12: "Spirituality, hidden matters, and subconscious"
};

const SIGN_MEANINGS: { [key: string]: string } = {
  'Aries': "Pioneering, energetic, and direct",
  'Taurus': "Stable, sensual, and determined",
  'Gemini': "Versatile, communicative, and curious",
  'Cancer': "Nurturing, emotional, and protective",
  'Leo': "Dramatic, creative, and confident",
  'Virgo': "Analytical, practical, and service-oriented",
  'Libra': "Diplomatic, harmonious, and relationship-focused",
  'Scorpio': "Intense, transformative, and investigative",
  'Sagittarius': "Optimistic, adventurous, and philosophical",
  'Capricorn': "Ambitious, disciplined, and responsible",
  'Aquarius': "Innovative, humanitarian, and independent",
  'Pisces': "Compassionate, intuitive, and spiritual"
};

const PLANET_MEANINGS: { [key: string]: string } = {
  'Sun': "Core identity, ego, and life purpose",
  'Moon': "Emotions, intuition, and subconscious",
  'Mercury': "Communication, thinking, and learning",
  'Venus': "Love, beauty, and values",
  'Mars': "Action, energy, and drive",
  'Jupiter': "Expansion, wisdom, and opportunity",
  'Saturn': "Structure, discipline, and lessons",
  'Uranus': "Innovation, rebellion, and sudden change",
  'Neptune': "Spirituality, dreams, and illusion",
  'Pluto': "Transformation, power, and deep change",
  'Chiron': "Healing, wounds, and wisdom",
  'North Node': "Life direction and soul purpose",
  'South Node': "Past life patterns and comfort zones"
};

const MUSICAL_INFLUENCES: { [key: string]: string } = {
  'Sun': "Creates bold, confident melodic themes with warm, resonant tones",
  'Moon': "Generates emotional, flowing melodies with intuitive harmonic progressions",
  'Mercury': "Produces quick, articulate musical phrases with intellectual complexity",
  'Venus': "Inspires harmonious, beautiful melodies with sensual, pleasing tones",
  'Mars': "Drives energetic, rhythmic patterns with dynamic, forceful expression",
  'Jupiter': "Expands musical ideas with optimistic, uplifting harmonic structures",
  'Saturn': "Provides structure and discipline with measured, controlled rhythms",
  'Uranus': "Introduces unexpected, innovative musical elements and sudden changes",
  'Neptune': "Creates ethereal, dreamy atmospheres with spiritual, transcendent tones",
  'Pluto': "Generates intense, transformative musical themes with deep, powerful expression",
  'Chiron': "Brings healing, wisdom-based musical elements with therapeutic qualities",
  'North Node': "Directs musical evolution toward growth and future development",
  'South Node': "Incorporates familiar, comfortable musical patterns from past influences"
};

export class SandboxInterpretationService {
  
  generatePlacementInterpretation(placement: PlanetPlacement): PlacementInterpretation {
    const houseMeaning = HOUSE_MEANINGS[placement.house] || "Unknown house";
    const signMeaning = SIGN_MEANINGS[placement.sign] || "Unknown sign";
    const planetMeaning = PLANET_MEANINGS[placement.planet] || "Unknown planet";
    const musicalInfluence = MUSICAL_INFLUENCES[placement.planet] || "Musical influence unknown";

    // Create a comprehensive interpretation
    const meaning = `${planetMeaning} in ${placement.sign} (${signMeaning}) in the ${this.getOrdinal(placement.house)} house (${houseMeaning}). This placement suggests ${this.generatePlacementDescription(placement)}.`;

    // Generate keywords based on planet, sign, and house combination
    const keywords = this.generateKeywords(placement);

    return {
      planet: placement.planet,
      house: placement.house,
      sign: placement.sign,
      meaning,
      musicalInfluence,
      keywords
    };
  }

  generateAspectInterpretation(aspect: {
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }): AspectInterpretation {
    const aspectMeanings = {
      'conjunction': {
        meaning: "Planets in conjunction blend their energies, creating a unified expression of their combined qualities.",
        musicalInfluence: "Creates harmonic unity and melodic fusion between planetary themes."
      },
      'opposition': {
        meaning: "Planets in opposition create tension and polarity, requiring balance and integration.",
        musicalInfluence: "Generates dynamic tension and call-and-response patterns."
      },
      'trine': {
        meaning: "Planets in trine flow harmoniously, supporting and enhancing each other's expression.",
        musicalInfluence: "Creates smooth, flowing melodic progressions and harmonic support."
      },
      'square': {
        meaning: "Planets in square create friction and challenge, driving growth through conflict.",
        musicalInfluence: "Produces rhythmic tension and dramatic harmonic progressions."
      },
      'sextile': {
        meaning: "Planets in sextile offer opportunities for cooperation and mutual benefit.",
        musicalInfluence: "Facilitates melodic cooperation and complementary harmonic structures."
      }
    };

    const aspectInfo = aspectMeanings[aspect.type as keyof typeof aspectMeanings] || {
      meaning: "This aspect creates a unique interaction between the planets.",
      musicalInfluence: "This aspect influences the musical composition in a distinctive way."
    };

    return {
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      type: aspect.type,
      meaning: aspectInfo.meaning,
      musicalInfluence: aspectInfo.musicalInfluence,
      orb: aspect.orb
    };
  }

  generateChartSummary(placements: PlanetPlacement[], aspects: AspectInterpretation[]): string {
    const planetCount = placements.length;
    const aspectCount = aspects.length;
    
    let summary = `This sandbox chart contains ${planetCount} planetary placements and ${aspectCount} aspects. `;
    
    if (planetCount > 0) {
      const dominantPlanets = this.getDominantPlanets(placements);
      summary += `The most prominent placements are ${dominantPlanets.join(', ')}. `;
    }
    
    if (aspectCount > 0) {
      const dominantAspects = this.getDominantAspects(aspects);
      summary += `Key aspects include ${dominantAspects.join(', ')}. `;
    }
    
    summary += "This configuration creates a unique astrological signature that will influence the musical composition's character, mood, and structure.";
    
    return summary;
  }

  private generatePlacementDescription(placement: PlanetPlacement): string {
    const descriptions = {
      'Sun': {
        'Aries': "a bold, pioneering approach to self-expression",
        'Taurus': "a stable, determined sense of identity",
        'Gemini': "a versatile, communicative self-image",
        'Cancer': "an emotional, nurturing personal presence",
        'Leo': "a dramatic, confident self-expression",
        'Virgo': "a practical, service-oriented identity",
        'Libra': "a harmonious, relationship-focused self-image",
        'Scorpio': "an intense, transformative personal presence",
        'Sagittarius': "an optimistic, adventurous self-expression",
        'Capricorn': "an ambitious, disciplined identity",
        'Aquarius': "an innovative, independent self-image",
        'Pisces': "a compassionate, spiritual personal presence"
      }
    };

    const planetDescriptions = descriptions[placement.planet as keyof typeof descriptions];
    if (planetDescriptions) {
      return planetDescriptions[placement.sign as keyof typeof planetDescriptions] || 
             "a unique expression of this planetary energy";
    }

    return "a distinctive expression of this planetary energy";
  }

  private generateKeywords(placement: PlanetPlacement): string[] {
    const keywords: string[] = [];
    
    // Add planet keywords
    const planetKeywords: { [key: string]: string[] } = {
      'Sun': ['identity', 'ego', 'purpose', 'confidence'],
      'Moon': ['emotions', 'intuition', 'nurturing', 'subconscious'],
      'Mercury': ['communication', 'thinking', 'learning', 'versatility'],
      'Venus': ['love', 'beauty', 'harmony', 'values'],
      'Mars': ['action', 'energy', 'drive', 'passion'],
      'Jupiter': ['expansion', 'wisdom', 'optimism', 'growth'],
      'Saturn': ['structure', 'discipline', 'responsibility', 'limitations'],
      'Uranus': ['innovation', 'rebellion', 'sudden change', 'freedom'],
      'Neptune': ['spirituality', 'dreams', 'illusion', 'transcendence'],
      'Pluto': ['transformation', 'power', 'intensity', 'rebirth']
    };

    const planetKeys = planetKeywords[placement.planet];
    if (planetKeys) {
      keywords.push(...planetKeys);
    }

    // Add sign keywords
    const signKeywords: { [key: string]: string[] } = {
      'Aries': ['pioneering', 'energetic', 'direct', 'bold'],
      'Taurus': ['stable', 'sensual', 'determined', 'practical'],
      'Gemini': ['versatile', 'communicative', 'curious', 'adaptable'],
      'Cancer': ['nurturing', 'emotional', 'protective', 'intuitive'],
      'Leo': ['dramatic', 'creative', 'confident', 'generous'],
      'Virgo': ['analytical', 'practical', 'service-oriented', 'perfectionist'],
      'Libra': ['diplomatic', 'harmonious', 'relationship-focused', 'balanced'],
      'Scorpio': ['intense', 'transformative', 'investigative', 'mysterious'],
      'Sagittarius': ['optimistic', 'adventurous', 'philosophical', 'expansive'],
      'Capricorn': ['ambitious', 'disciplined', 'responsible', 'traditional'],
      'Aquarius': ['innovative', 'humanitarian', 'independent', 'progressive'],
      'Pisces': ['compassionate', 'intuitive', 'spiritual', 'dreamy']
    };

    const signKeys = signKeywords[placement.sign];
    if (signKeys) {
      keywords.push(...signKeys);
    }

    // Add house keywords
    const houseKeywords: { [key: number]: string[] } = {
      1: ['identity', 'self-expression', 'appearance', 'personality'],
      2: ['values', 'possessions', 'security', 'resources'],
      3: ['communication', 'learning', 'environment', 'siblings'],
      4: ['home', 'family', 'foundation', 'roots'],
      5: ['creativity', 'romance', 'children', 'pleasure'],
      6: ['work', 'health', 'routines', 'service'],
      7: ['partnerships', 'relationships', 'marriage', 'open enemies'],
      8: ['transformation', 'shared resources', 'psychology', 'death'],
      9: ['higher learning', 'philosophy', 'travel', 'beliefs'],
      10: ['career', 'public image', 'authority', 'achievement'],
      11: ['friendships', 'groups', 'aspirations', 'social causes'],
      12: ['spirituality', 'hidden matters', 'subconscious', 'sacrifice']
    };

    const houseKeys = houseKeywords[placement.house];
    if (houseKeys) {
      keywords.push(...houseKeys);
    }

    return [...new Set(keywords)].slice(0, 8); // Remove duplicates and limit to 8
  }

  private getDominantPlanets(placements: PlanetPlacement[]): string[] {
    // Simple algorithm to identify dominant planets based on house placement
    const houseCounts: { [key: number]: number } = {};
    placements.forEach(p => {
      houseCounts[p.house] = (houseCounts[p.house] || 0) + 1;
    });

    const dominantHouses = Object.entries(houseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([house]) => parseInt(house));

    return placements
      .filter(p => dominantHouses.includes(p.house))
      .map(p => `${p.planet} in ${p.sign}`)
      .slice(0, 3);
  }

  private getDominantAspects(aspects: AspectInterpretation[]): string[] {
    return aspects
      .sort((a, b) => b.orb - a.orb) // Sort by orb (tighter aspects first)
      .slice(0, 3)
      .map(a => `${a.planet1} ${a.type} ${a.planet2}`);
  }

  private getOrdinal(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }
}

export const sandboxInterpretationService = new SandboxInterpretationService(); 