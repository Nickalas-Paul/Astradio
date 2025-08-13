// scripts/renderDeploy.js - single source of truth for Render deploy (no tsx needed)
const https = require('https');

const NAME = process.env.RENDER_SERVICE_NAME || 'Astradio-1';
const TOKEN = process.env.RENDER_API_KEY;
const BASE = 'https://api.render.com/v1';

if (!TOKEN) {
  console.error('Missing RENDER_API_KEY'); process.exit(1);
}

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
  // 0) Guard: ensure root lockfile is tracked
  // (Render uses --frozen-lockfile; if missing/outdated, it will fail)
  // We don't parse here; rely on CI to enforce.

  // 1) Find service by name
  const list = await req('GET', '/services?limit=100');
  const svc = list.find(s => s.name === NAME);
  if (!svc) throw new Error(`Service '${NAME}' not found`);

  // 2) Enforce workspace-root install + path-based API build/start
  await req('PATCH', `/services/${svc.id}`, {
    rootDir: ".",
    buildCommand: "corepack enable && pnpm -w install --frozen-lockfile && pnpm -C apps/api build",
    startCommand: "pnpm -C apps/api start"
  });

  // 3) Trigger deploy with cache clear
  const dep = await req('POST', `/services/${svc.id}/deploys`, { clearCache: true });
  const depId = dep.id;
  process.stdout.write(`Deploy ${depId}`);

  // 4) Poll until live/failed
  while (true) {
    await new Promise(r => setTimeout(r, 6000));
    const d = await req('GET', `/deploys/${depId}`);
    process.stdout.write(` → ${d.status}`);
    if (['live', 'succeeded'].includes(d.status)) break;
    if (['failed', 'canceled', 'deactivated'].includes(d.status)) {
      throw new Error(`\nDeploy ${d.status}. Check Render build logs.`);
    }
  }

  // 5) Print URL and quick health
  const svc2 = await req('GET', `/services/${svc.id}`);
  const url = (svc2.serviceDetails && svc2.serviceDetails.url) || svc2.url;
  console.log(`\n✅ Live at ${url}`);

  try {
    await new Promise((resolve, reject) => {
      https.get(url + '/health', res => res.statusCode === 200 ? resolve() : reject(new Error(String(res.statusCode))))
        .on('error', reject);
    });
    console.log('Health: 200');
  } catch {
    console.log('Health pending (warming)');
  }
})().catch(e => { console.error(e.message || e); process.exit(1); });
