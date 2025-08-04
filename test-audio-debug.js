// Debug test script for Astradio audio functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testAudioFunctionality() {
  console.log('🎵 Testing Astradio Audio Functionality...\n');

  try {
    // 1. Test if server is reachable
    console.log('1. Testing server connectivity...');
    try {
      const health = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
      console.log('✅ Health check passed:', health.data.status);
    } catch (error) {
      console.log('❌ Health check failed:');
      console.log('   Error:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('   Server is not running on port 3001');
        console.log('   Please start the API with: cd apps/api && npm start');
        return;
      }
      if (error.code === 'ENOTFOUND') {
        console.log('   Cannot resolve localhost');
        return;
      }
      console.log('   Response status:', error.response?.status);
      console.log('   Response data:', error.response?.data);
      return;
    }

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
    
    if (chartResponse.data.data?.chart) {
      console.log('   Chart structure:', Object.keys(chartResponse.data.data.chart));
      console.log('   Planets found:', Object.keys(chartResponse.data.data.chart.planets || {}).length);
    } else {
      console.log('   ❌ No chart data in response');
      console.log('   Full response:', JSON.stringify(chartResponse.data, null, 2));
      return;
    }

    // 3. Test audio generation
    console.log('\n3. Testing audio generation...');
    const audioResponse = await axios.post(`${API_BASE}/api/audio/generate`, {
      chart_data: chartResponse.data.data.chart,
      duration: 30,
      genre: 'ambient'
    });
    
    console.log('✅ Audio generation response:', audioResponse.data);
    
    if (audioResponse.data.data?.audio_url) {
      console.log('   Audio URL:', audioResponse.data.data.audio_url);
      console.log('   Audio duration:', audioResponse.data.data.duration);
    }

    console.log('\n🎉 Audio test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testAudioFunctionality(); 