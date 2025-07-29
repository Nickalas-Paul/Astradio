// Test script for the new genre system
const { 
  getAllGenres, 
  getAllMoods, 
  getGenreConfig, 
  getMoodMapping,
  generateGenreSpecificMelody 
} = require('./packages/audio-mappings/dist/index.js');

console.log('🎵 Testing Astradio Genre System');
console.log('================================');

// Test 1: Get all genres
console.log('\n📋 Available Genres:');
const genres = getAllGenres();
genres.forEach(genre => {
  const config = getGenreConfig(genre);
  console.log(`  • ${config.name} (${genre})`);
  console.log(`    Instruments: ${config.instruments.primary.join(', ')}`);
  console.log(`    Tempo: ${config.tempo.default} BPM`);
  console.log(`    Textile: ${config.textile}`);
});

// Test 2: Get all moods
console.log('\n🎭 Available Moods:');
const moods = getAllMoods();
moods.forEach(mood => {
  const mapping = getMoodMapping(mood);
  console.log(`  • ${mood}`);
  console.log(`    Genres: ${mapping.genres.join(', ')}`);
  console.log(`    Tempo: ${mapping.tempo.default} BPM`);
});

// Test 3: Test genre-specific melody generation
console.log('\n🎼 Testing Genre-Specific Melody Generation:');
const mockChartData = {
  metadata: { birth_datetime: '1990-01-01T12:00:00Z' },
  planets: {
    Sun: { sign: { name: 'Capricorn', degree: 15 }, house: 1 },
    Moon: { sign: { name: 'Aquarius', degree: 25 }, house: 2 },
    Mercury: { sign: { name: 'Capricorn', degree: 5 }, house: 1 }
  }
};

// Test a few genres
['classical', 'house', 'jazz', 'ambient'].forEach(genre => {
  console.log(`\n🎵 ${genre.toUpperCase()}:`);
  try {
    const melody = generateGenreSpecificMelody(mockChartData, genre);
    console.log(`  • Tempo: ${melody.tempo} BPM`);
    console.log(`  • Scale: ${melody.scale}`);
    console.log(`  • Instruments: ${melody.instruments.join(', ')}`);
    console.log(`  • Notes: ${melody.notes.length} notes generated`);
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
});

// Test 4: Test mood-to-genre mapping
console.log('\n🎭 Testing Mood-to-Genre Mapping:');
moods.forEach(mood => {
  const mapping = getMoodMapping(mood);
  console.log(`  • ${mood} → ${mapping.genres.join(', ')}`);
});

console.log('\n✅ Genre system test completed!'); 