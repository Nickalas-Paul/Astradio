// Test script for enhanced astrological music mappings
const { getMusicalConfig, calculateAspects, calculateHarmonicInterval, getRhythmPattern, getTonalQuality } = require('./packages/audio-mappings/src/enhanced-mappings.ts');

// Sample birth chart data
const sampleChart = {
  metadata: {
    birth_datetime: "1990-05-15T14:30:00Z",
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: -5
  },
  planets: {
    Sun: {
      sign: { name: "Taurus", number: 2, degree: 24 },
      house: 7,
      element: "Earth",
      modality: "Fixed"
    },
    Moon: {
      sign: { name: "Cancer", number: 4, degree: 12 },
      house: 9,
      element: "Water",
      modality: "Cardinal"
    },
    Mercury: {
      sign: { name: "Gemini", number: 3, degree: 8 },
      house: 6,
      element: "Air",
      modality: "Mutable"
    },
    Venus: {
      sign: { name: "Taurus", number: 2, degree: 18 },
      house: 7,
      element: "Earth",
      modality: "Fixed"
    },
    Mars: {
      sign: { name: "Aries", number: 1, degree: 15 },
      house: 6,
      element: "Fire",
      modality: "Cardinal"
    },
    Jupiter: {
      sign: { name: "Cancer", number: 4, degree: 3 },
      house: 9,
      element: "Water",
      modality: "Cardinal"
    },
    Saturn: {
      sign: { name: "Capricorn", number: 10, degree: 22 },
      house: 3,
      element: "Earth",
      modality: "Cardinal"
    },
    Uranus: {
      sign: { name: "Capricorn", number: 10, degree: 8 },
      house: 3,
      element: "Earth",
      modality: "Cardinal"
    },
    Neptune: {
      sign: { name: "Capricorn", number: 10, degree: 15 },
      house: 3,
      element: "Earth",
      modality: "Cardinal"
    },
    Pluto: {
      sign: { name: "Scorpio", number: 8, degree: 12 },
      house: 1,
      element: "Water",
      modality: "Fixed"
    }
  },
  houses: {
    1: { sign: "Scorpio", degree: 12 },
    2: { sign: "Sagittarius", degree: 8 },
    3: { sign: "Capricorn", degree: 22 },
    4: { sign: "Aquarius", degree: 15 },
    5: { sign: "Pisces", degree: 8 },
    6: { sign: "Aries", degree: 15 },
    7: { sign: "Taurus", degree: 24 },
    8: { sign: "Gemini", degree: 8 },
    9: { sign: "Cancer", degree: 12 },
    10: { sign: "Leo", degree: 3 },
    11: { sign: "Virgo", degree: 18 },
    12: { sign: "Libra", degree: 15 }
  }
};

console.log("🎵 Testing Enhanced Astrological Music Mapping Framework");
console.log("=" .repeat(60));

// Test 1: Calculate aspects
console.log("\n1. Calculating Planetary Aspects:");
const aspects = calculateAspects(sampleChart);
aspects.forEach(aspect => {
  console.log(`   ${aspect.planet1} ${aspect.type} ${aspect.planet2} (${aspect.angle.toFixed(1)}°)`);
  console.log(`   → Harmonic: ${aspect.harmonic}`);
});

// Test 2: Get musical configuration for different genres
const genres = ['classical', 'jazz', 'electronic', 'ambient'];

genres.forEach(genre => {
  console.log(`\n2. Musical Configuration for ${genre.toUpperCase()} Genre:`);
  const config = getMusicalConfig(sampleChart, genre);
  
  console.log(`   Dominant Element: ${config.dominantElement}`);
  console.log(`   Scale: ${config.scale.join(', ')}`);
  console.log(`   Instruments:`);
  Object.entries(config.instruments).forEach(([role, instruments]) => {
    console.log(`     ${role}: ${instruments.join(', ')}`);
  });
  
  console.log(`   Planets with ${genre} variations:`);
  config.planets.forEach(planet => {
    const genreConfig = planet.genreConfig;
    console.log(`     ${planet.name}: ${genreConfig.instrument} (octave ${genreConfig.octave})`);
  });
});

// Test 3: Calculate harmonic intervals for aspects
console.log("\n3. Harmonic Intervals for Aspects:");
aspects.forEach(aspect => {
  const baseFreq = 440; // A4
  const harmonicFreq = calculateHarmonicInterval(baseFreq, aspect.type);
  console.log(`   ${aspect.planet1} ${aspect.type} ${aspect.planet2}: ${baseFreq}Hz → ${harmonicFreq.toFixed(1)}Hz`);
});

// Test 4: Rhythm patterns for modalities
console.log("\n4. Rhythm Patterns by Modality:");
const modalities = ['Cardinal', 'Fixed', 'Mutable'];
modalities.forEach(modality => {
  const pattern = getRhythmPattern(modality);
  console.log(`   ${modality}: ${pattern.rhythm} (${pattern.tempo} tempo) - ${pattern.description}`);
});

// Test 5: Tonal qualities for dignities
console.log("\n5. Tonal Qualities by Dignity:");
const dignities = ['rulership', 'exaltation', 'fall', 'detriment'];
dignities.forEach(dignity => {
  const quality = getTonalQuality(dignity);
  console.log(`   ${dignity}: ${quality.tonalQuality} (volume: ${quality.volume}, clarity: ${quality.clarity})`);
});

// Test 6: Generate sample composition structure
console.log("\n6. Sample Composition Structure:");
const electronicConfig = getMusicalConfig(sampleChart, 'electronic');
console.log(`   Genre: ${electronicConfig.genre}`);
console.log(`   Key Scale: ${electronicConfig.scale.join(', ')}`);
console.log(`   Composition Elements:`);
console.log(`     - Melody: ${electronicConfig.instruments.melody.join(', ')}`);
console.log(`     - Harmony: ${electronicConfig.instruments.harmony.join(', ')}`);
console.log(`     - Rhythm: ${electronicConfig.instruments.rhythm.join(', ')}`);
console.log(`     - Bass: ${electronicConfig.instruments.bass.join(', ')}`);
console.log(`     - Effects: ${electronicConfig.instruments.effects.join(', ')}`);

console.log("\n🎵 Framework Test Complete!");
console.log("This enhanced system provides:");
console.log("  • Genre-specific instrument mappings");
console.log("  • Aspect-based harmonic relationships");
console.log("  • Modality-driven rhythmic patterns");
console.log("  • Dignity-influenced tonal qualities");
console.log("  • Element-based scale selection");
console.log("  • Comprehensive musical configuration generation"); 