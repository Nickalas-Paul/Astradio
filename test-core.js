// Simple test to verify core functionality
import { getCurrentEphemerisUTC, mapChartToMusic } from './packages/core/dist/index.js';

async function testCore() {
  console.log('🧪 Testing Astradio Core...\n');

  try {
    // Test 1: Ephemeris generation
    console.log('1. Testing ephemeris generation...');
    const ephemeris = await getCurrentEphemerisUTC();
    console.log('✅ Ephemeris generated successfully');
    console.log('   Planets found:', ephemeris.length);
    console.log('   First planet:', ephemeris[0]?.body, ephemeris[0]?.longitude);

    // Test 2: Music generation for each genre
    const genres = ['ambient', 'techno', 'world', 'hip-hop'];
    console.log('\n2. Testing music generation for each genre...');
    
    for (const genre of genres) {
      console.log(`   Testing ${genre}...`);
      const music = mapChartToMusic({ ephemeris, genre });
      console.log(`   ✅ ${genre}: tempo=${music.tempo}, key=${music.key}, scale=${music.scale}`);
      console.log(`      layers: ${music.layers.length} layers`);
    }

    console.log('\n🎉 All core tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testCore();
