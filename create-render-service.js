const https = require('https');

const TOKEN = process.env.RENDER_API_KEY || 'rnd_o4yU7mK7lryBwbFJcvm9s4yAD6SC';
const BASE = 'https://api.render.com/v1';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : undefined;
    const r = https.request(BASE + path, {
      method,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': String(data.length) } : {})
      }
    }, (res) => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(out ? JSON.parse(out) : {});
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${out}`));
        }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  try {
    console.log('🚀 Creating Render service...');
    
    const service = await req('POST', '/services', {
      name: 'astradio-api',
      type: 'web_service',
      env: 'node',
      rootDir: '.',
      buildCommand: 'corepack enable && pnpm -w install --frozen-lockfile && pnpm --filter api build',
      startCommand: 'node apps/api/dist/app.js',
      repo: 'https://github.com/Nickalas-Paul/Astradio',
      branch: 'master',
      autoDeploy: true,
      envVars: [
        { key: 'NODE_VERSION', value: '20' },
        { key: 'FRONTEND_URL', value: 'https://astradio.vercel.app' }
      ]
    });
    
    console.log('✅ Service created successfully!');
    console.log(`Service ID: ${service.id}`);
    console.log(`Service URL: ${service.serviceDetails?.url || 'Pending...'}`);
    
    // Trigger initial deployment
    console.log('\n🚀 Triggering initial deployment...');
    const deploy = await req('POST', `/services/${service.id}/deploys`, { clearCache: true });
    console.log(`Deploy ID: ${deploy.id}`);
    
    console.log('\n🎉 Service creation completed!');
    console.log('Check the Render dashboard for deployment status.');
    
  } catch (error) {
    console.error('❌ Failed to create service:', error.message);
    process.exit(1);
  }
})();
