#!/usr/bin/env node

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function smokeTest() {
  console.log('🚀 Starting Astradio smoke test...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    const health = await healthResponse.json();
    console.log(`   ✅ Health: ${health.ok} (${health.timestamp})`);

    // Test 2: Today's chart
    console.log('\n2. Testing today chart endpoint...');
    const chartResponse = await fetch(`${API_URL}/api/today`);
    if (!chartResponse.ok) {
      throw new Error(`Chart fetch failed: ${chartResponse.status}`);
    }
    const chartData = await chartResponse.json();
    console.log(`   ✅ Chart: ${Object.keys(chartData.chart.planets).length} planets`);

    // Test 3: Audio generation
    console.log('\n3. Testing audio generation...');
    const audioConfig = {
      mode: 'daily',
      genre: 'ambient',
      durationSec: 3,
      sampleRate: 22050
    };

    const generateRequest = {
      config: audioConfig,
      chartA: {
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        tz: 'UTC',
        lat: 40.7128,
        lon: -74.0060
      }
    };

    const generateResponse = await fetch(`${API_URL}/api/audio/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generateRequest)
    });

    if (!generateResponse.ok) {
      throw new Error(`Audio generation failed: ${generateResponse.status}`);
    }

    const { audioId } = await generateResponse.json();
    console.log(`   ✅ Audio ID: ${audioId}`);

    // Test 4: Audio streaming
    console.log('\n4. Testing audio streaming...');
    const streamUrl = `${API_URL}/api/audio/stream/${audioId}?config=${encodeURIComponent(JSON.stringify(audioConfig))}&chartA=${encodeURIComponent(JSON.stringify(chartData.chart))}`;
    
    const streamResponse = await fetch(streamUrl);
    if (!streamResponse.ok) {
      throw new Error(`Audio streaming failed: ${streamResponse.status}`);
    }

    // Read the audio data
    const audioBuffer = await streamResponse.arrayBuffer();
    const audioSize = audioBuffer.byteLength;
    
    console.log(`   ✅ Audio stream: ${audioSize} bytes`);
    console.log(`   ✅ Content-Type: ${streamResponse.headers.get('content-type')}`);

    // Test 5: Write to file for verification
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(__dirname, '..', 'out.wav');
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    
    console.log(`   ✅ Written to: ${outputPath}`);
    console.log(`   ✅ File size: ${(audioSize / 1024).toFixed(1)} KB`);

    // Test 6: Validate WAV format
    if (audioSize < 44) {
      throw new Error('Audio file too small to be valid WAV');
    }

    const header = new Uint8Array(audioBuffer.slice(0, 44));
    const riff = String.fromCharCode(...header.slice(0, 4));
    const wave = String.fromCharCode(...header.slice(8, 12));
    
    if (riff !== 'RIFF' || wave !== 'WAVE') {
      throw new Error('Invalid WAV header');
    }

    console.log('   ✅ Valid WAV format');

    // Test 7: Performance check
    const startTime = Date.now();
    const healthResponse2 = await fetch(`${API_URL}/health`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`\n5. Performance check...`);
    console.log(`   ✅ Response time: ${responseTime}ms`);

    if (responseTime > 200) {
      console.log(`   ⚠️  Slow response time (>200ms)`);
    }

    // Summary
    console.log('\n🎉 All tests passed!');
    console.log('\nSummary:');
    console.log(`   • Health endpoint: ✅`);
    console.log(`   • Chart computation: ✅`);
    console.log(`   • Audio generation: ✅`);
    console.log(`   • Audio streaming: ✅`);
    console.log(`   • WAV format: ✅`);
    console.log(`   • Performance: ${responseTime < 200 ? '✅' : '⚠️'}`);
    console.log(`   • Output file: out.wav (${(audioSize / 1024).toFixed(1)} KB)`);

    console.log('\n🚀 Astradio is ready for production!');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error.message);
    console.error('\nDebugging tips:');
    console.error('   • Check if API server is running on', API_URL);
    console.error('   • Verify SwissEph is properly installed');
    console.error('   • Check server logs for detailed errors');
    process.exit(1);
  }
}

// Run the smoke test
smokeTest();
