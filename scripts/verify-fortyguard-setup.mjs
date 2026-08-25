// Run with: node scripts/verify-fortyguard-setup.mjs
//
// A minimal, one-shot smoke test for the FINAL, confirmed FortyGuard
// integration used by this app (see lib/fortyguard.ts). Run this once before
// a demo/judging session to confirm your FORTYGUARD_API_KEY works end to end.
//
// Cost: exactly 2 submitted activities (1x /v1/heatmap, 1x /v1/env_params),
// each polled to completion. No brute-forcing, no guessed payloads.

import 'dotenv/config';

const API_KEY = process.env.FORTYGUARD_API_KEY;
if (!API_KEY) {
  console.error('FORTYGUARD_API_KEY not found in your .env file.');
  process.exit(1);
}

const BASE = 'https://api.fortyguard.com';
const today = new Date().toISOString().slice(0, 10);

async function submit(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${path} submit failed: HTTP ${res.status} ${JSON.stringify(body)}`);
  const activityId = body?.data?.activity_id;
  if (!activityId) throw new Error(`${path} submit returned no activity_id: ${JSON.stringify(body)}`);
  return activityId;
}

async function poll(activityId, { maxAttempts = 15, intervalMs = 2000 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${BASE}/v1/status/${activityId}`, { headers: { 'api-key': API_KEY } });
    const body = await res.json().catch(() => null);
    const data = body?.data ?? body;
    const status = String(data?.status || '').toLowerCase();
    if (status === 'completed') return data;
    if (status === 'failed') throw new Error(`activity ${activityId} failed: ${JSON.stringify(data)}`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`activity ${activityId} did not complete in time`);
}

// Small 500m box over Mumbai (site) — mirrors lib/fortyguard.ts:siteBox()
const siteRing = [
  [72.8547, 19.0385],
  [72.8593, 19.0385],
  [72.8593, 19.0475],
  [72.8547, 19.0475],
  [72.8547, 19.0385],
];

console.log('--- 1/2: POST /v1/heatmap (site polygon -> Temperature_stats) ---');
{
  const activityId = await submit('/v1/heatmap', {
    polygon_aoi: {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [siteRing] } }],
    },
    date_time: { start_date: today, start_time: '14:00', filter_type: 1 },
    granularity: 100,
    analytic_type: 'tcm',
  });
  const data = await poll(activityId);
  const stats = data?.result?.stats_data?.Temperature_stats;
  console.log('PASS — Temperature_stats:', JSON.stringify(stats));
}

console.log('\n--- 2/2: POST /v1/env_params (point -> heat index / humidity / AQI) ---');
{
  const activityId = await submit('/v1/env_params', {
    latitude: 19.043,
    longitude: 72.857,
    temperature: 32, // Celsius
    date_time: { start_date: today, start_time: '14:00', filter_type: 1 },
    analysis: ['heat_index_celsius', 'relative_humidity_percent', 'air_quality:idx'],
  });
  const data = await poll(activityId);
  const loc = data?.result?.locations?.[0];
  console.log('PASS — parameters:', JSON.stringify(loc?.parameters));
}

console.log('\nAll checks passed. FortyGuard integration is working end to end.');
