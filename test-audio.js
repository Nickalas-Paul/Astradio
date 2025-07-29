// Test script for Astradio audio functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testAudioFunctionality() {
  console.log('🎵 Testing Astradio Audio Functionality...\n');

  try {
    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', health.data.status);

    // 2. Generate a chart
    console.log('\n2. Generating test chart...');
    const chartResponse = await axios.post(`${API_BASE}/api/charts/generate`, {
      birth_data: {
        date: '1990-05-15',
        time: '14:30',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -5
      }
    });
    
    console.log('✅ Chart generated successfully');
    console.log('   Response structure:', Object.keys(chartResponse.data));
    console.log('   Data structure:', Object.keys(chartResponse.data.data));
    
    if (chartResponse.data.data.chart) {
      console.log('   Chart structure:', Object.keys(chartResponse.data.data.chart));
      console.log('   Planets found:', Object.keys(chartResponse.data.data.chart.planets || {}).length);
      console.log('   Audio config:', chartResponse.data.data.audio_config);
    } else {
      console.log('   ❌ No chart data in response');
      console.log('   Full response:', JSON.stringify(chartResponse.data, null, 2));
      return;
    }

    // 3. Test sequential audio generation
    console.log('\n3. Testing sequential audio generation...');
    const sequentialResponse = await axios.post(`${API_BASE}/api/audio/sequential`, {
      chart_data: chartResponse.data.data.chart
    });
    
    console.log('✅ Sequential audio started:', sequentialResponse.data.data.message);
    console.log('   Session ID:', sequentialResponse.data.data.session.id);

    // 4. Check audio status
    console.log('\n4. Checking audio status...');
    const statusResponse = await axios.get(`${API_BASE}/api/audio/status`);
    console.log('✅ Audio status:', statusResponse.data.data.isPlaying ? 'Playing' : 'Stopped');

    // 5. Wait a bit then stop audio
    console.log('\n5. Waiting 3 seconds then stopping audio...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const stopResponse = await axios.post(`${API_BASE}/api/audio/stop`);
    console.log('✅ Audio stopped:', stopResponse.data.data.message);

    // 6. Test layered audio generation
    console.log('\n6. Testing layered audio generation...');
    const layeredResponse = await axios.post(`${API_BASE}/api/audio/layered`, {
      chart_data: chartResponse.data.data.chart
    });
    
    console.log('✅ Layered audio started:', layeredResponse.data.data.message);
    console.log('   Session ID:', layeredResponse.data.data.session.id);

    // 7. Wait and stop again
    console.log('\n7. Waiting 3 seconds then stopping layered audio...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await axios.post(`${API_BASE}/api/audio/stop`);
    console.log('✅ Layered audio stopped');

    console.log('\n🎉 All audio tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Chart generation: ✅ Working');
    console.log('   - Sequential audio: ✅ Working');
    console.log('   - Layered audio: ✅ Working');
    console.log('   - Audio controls: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testAudioFunctionality(); 