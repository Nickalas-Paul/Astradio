// Test script to verify backend connection
const axios = require('axios');

const API_BASE = 'https://astradio.onrender.com';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...\n');

  try {
    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', health.data.status);

    // 2. Test daily chart endpoint
    console.log('\n2. Testing daily chart endpoint...');
    const today = new Date().toISOString().split('T')[0];
    const dailyResponse = await axios.get(`${API_BASE}/api/daily/${today}`);
    console.log('✅ Daily chart endpoint working:', dailyResponse.data.success);

    // 3. Test chart generation endpoint
    console.log('\n3. Testing chart generation...');
    const chartResponse = await axios.post(`${API_BASE}/api/charts/generate`, {
      birth_data: {
        date: '1990-05-15',
        time: '14:30',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -5
      }
    });
    console.log('✅ Chart generation working:', chartResponse.data.success);

    console.log('\n🎉 Backend connection test completed successfully!');
    console.log('✅ All endpoints are responding correctly');
    console.log('✅ Frontend should now be able to connect to the live backend');

  } catch (error) {
    console.error('❌ Backend connection test failed:', error.response?.data || error.message);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ URL:', error.config?.url);
  }
}

// Run the test
testBackendConnection(); 