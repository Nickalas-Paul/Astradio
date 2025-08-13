// scripts/renderDeploy.ts
import https from 'https';
import fs from 'fs';
import path from 'path';

const NAME = process.env.RENDER_SERVICE_NAME || 'Astradio-1';
const TOKEN = process.env.RENDER_API_KEY!;
const BASE = 'https://api.render.com/v1';

if (!TOKEN) { console.error('Missing RENDER_API_KEY'); process.exit(1); }

function req(method: string, path: string, body?: any): Promise<any> {
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
      let out = ''; res.on('data', d => out += d);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(out ? JSON.parse(out) : {});
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${out}`));
        }
      });
    });
    r.on('error', reject); if (data) r.write(data); r.end();
  });
}

(async () => {
  // 1) Validate root lockfile exists
  const lockfilePath = path.join(process.cwd(), 'pnpm-lock.yaml');
  if (!fs.existsSync(lockfilePath)) {
    throw new Error('pnpm-lock.yaml not found at repo root. Run: pnpm -w install --lockfile-only');
  }
  console.log('✅ Root pnpm-lock.yaml found');

  // 2) Find service
  const list = await req('GET', '/services?limit=100');
  const svc = list.find((s: any) => s.name === NAME);
  if (!svc) throw new Error(`Service '${NAME}' not found`);
  console.log(`✅ Found service: ${svc.name} (${svc.id})`);

  // 3) Patch commands to be path-based and workspace-root install
  await req('PATCH', `/services/${svc.id}`, {
    rootDir: ".",
    buildCommand: "corepack enable && pnpm -w install --frozen-lockfile && pnpm -C apps/api build",
    startCommand: "pnpm -C apps/api start"
  });
  console.log('✅ Service configuration updated');

  // 4) Trigger deploy (clear cache)
  const dep = await req('POST', `/services/${svc.id}/deploys`, { clearCache: true });
  const depId = dep.id;
  process.stdout.write(`🚀 Deploy ${depId}...`);

  // 5) Poll until live/failed
  while (true) {
    await new Promise(r => setTimeout(r, 6000));
    const d = await req('GET', `/deploys/${depId}`);
    process.stdout.write(` ${d.status}`);
    if (['live', 'succeeded'].includes(d.status)) break;
    if (['failed', 'canceled', 'deactivated'].includes(d.status)) throw new Error(`Deploy ${d.status}`);
  }

  // 6) Fetch URL and health-check
  const svc2 = await req('GET', `/services/${svc.id}`);
  const url = svc2.serviceDetails.url;
  console.log(`\n✅ Live at ${url}`);

  // Health check (non-fatal)
  try {
    await new Promise<void>((resolve, reject) => {
      https.get(url + '/health', res => res.statusCode === 200 ? resolve() : reject(new Error(String(res.statusCode))))
        .on('error', reject);
    });
    console.log('Health: 200');
  } catch { console.log('Health pending (warming)'); }
})().catch(e => { console.error(e.message || e); process.exit(1); });
