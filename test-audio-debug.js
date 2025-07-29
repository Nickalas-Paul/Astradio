// Debug script for audio generation
const axios = require('axios');

const API_BASE = 'http://localhost:3003';

async function testAudioDebug() {
  console.log('🔍 Debugging audio generation...\n');

  try {
    // 1. Generate a simple chart
    console.log('1. Generating test chart...');
    const chartResponse = await axios.post(`${API_BASE}/api/charts/generate`, {
      birth_data: {
        date: '1990-05-15',
        time: '14:30',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -5
      },
      mode: 'moments'
    });
    
    console.log('✅ Chart generated successfully');
    const chart = chartResponse.data.data.chart;
    console.log('   Planets:', Object.keys(chart.planets));

    // 2. Test audio generation with minimal parameters
    console.log('\n2. Testing audio generation...');
    try {
      const audioResponse = await axios.post(`${API_BASE}/api/audio/preview`, {
        chart_data: chart,
        mode: 'daily_preview',
        duration: 10,
        genre: 'ambient'
      }, {
        responseType: 'arraybuffer'
      });
      
      console.log('✅ Audio generated successfully');
      console.log('   Buffer size:', audioResponse.data.length);
      console.log('   Content-Type:', audioResponse.headers['content-type']);
    } catch (audioError) {
      console.error('❌ Audio generation failed:');
      console.error('   Status:', audioError.response?.status);
      console.error('   Status Text:', audioError.response?.statusText);
      
      // Try to parse error response
      if (audioError.response?.data) {
        try {
          const errorText = audioError.response.data.toString('utf8');
          console.error('   Error details:', errorText);
        } catch (e) {
          console.error('   Raw error data:', audioError.response.data);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAudioDebug(); 