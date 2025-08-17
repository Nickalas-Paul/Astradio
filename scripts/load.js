// ====== LIGHTWEIGHT LOAD TEST ======
// Tests API performance under moderate load
// Run: k6 run -e API=$NEXT_PUBLIC_API_URL scripts/load.js

import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up
    { duration: '1m', target: 20 },   // Steady load
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<150'], // 95% of requests under 150ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

const API_BASE = __ENV.API || 'http://localhost:3001';

export default function () {
  // Test 1: Health check
  const healthRes = http.get(`${API_BASE}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 50ms': (r) => r.timings.duration < 50,
  });

  // Test 2: Ephemeris endpoint
  const ephemerisRes = http.get(`${API_BASE}/api/ephemeris/today`);
  check(ephemerisRes, {
    'ephemeris status is 200': (r) => r.status === 200,
    'ephemeris has data': (r) => r.json('ephemeris').length > 0,
    'ephemeris response time < 100ms': (r) => r.timings.duration < 100,
  });

  // Test 3: Music generation (rate limited)
  const generatePayload = JSON.stringify({ genre: 'techno' });
  const generateRes = http.post(`${API_BASE}/api/audio/generate`, generatePayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(generateRes, {
    'generate status is 200': (r) => r.status === 200,
    'generate has music data': (r) => r.json('music') !== undefined,
    'generate response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1); // Rate limiting consideration
}
