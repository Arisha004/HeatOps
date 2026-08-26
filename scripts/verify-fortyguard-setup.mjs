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

// Small ~500m box over downtown Phoenix, Arizona — mirrors lib/fortyguard.ts:siteBox().
// MUST be a United States coordinate: FortyGuard's current release only covers
// the US (docs-api.fortyguard.com/docs/limitations, "Regional Coverage"), and
// out-of-region requests return "Completed" with n_cells: 0 rather than an
// error — which would burn both credits and prove nothing.
const SITE_LAT = 33.4484;
const SITE_LON = -112.0740;
const siteRing = [
  [-112.0767, 33.4462],
  [-112.0713, 33.4462],
  [-112.0713, 33.4507],
  [-112.0767, 33.4507],
  [-112.0767, 33.4462],
];

let heatmapOk = true;
let envParamsOk = true;
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
  const statsData = data?.result?.stats_data;
  const stats = statsData?.Temperature_stats ?? statsData?.temperature_stats;
  console.log('Temperature_stats:', JSON.stringify(stats));
  console.log('n_cells:', statsData?.n_cells);
  const mean = stats?.Mean ?? stats?.mean;
  if (typeof mean !== 'number') {
    // A "Completed" activity with no cells is NOT a pass. Reporting it as one
    // hides the fact that the UHI delta will be unavailable at demo time.
    heatmapOk = false;
    console.log(
      'FAIL — heatmap completed but returned no Temperature_stats ' +
      `(n_cells: ${statsData?.n_cells}). The site-vs-city UHI delta will be ` +
      'unavailable; env_params readings are still used.'
    );
  }
  if (typeof mean === 'number') {
    // Unit sanity check: a US summer surface reading near 95 is Fahrenheit;
    // near 35 it is Celsius. server.ts treats this value as CELSIUS.
    console.log(`       UNIT CHECK -> Mean=${mean}  =>  looks like ${mean > 60 ? 'FAHRENHEIT (server.ts treats it as CELSIUS - BUG)' : 'CELSIUS (matches server.ts)'}`);
  }
}

console.log('\n--- 2/2: POST /v1/env_params (point -> heat index / humidity / AQI) ---');
{
  const activityId = await submit('/v1/env_params', {
    latitude: SITE_LAT,
    longitude: SITE_LON,
    temperature: 32, // Celsius
    date_time: { start_date: today, start_time: '14:00', filter_type: 1 },
    analysis: ['heat_index_celsius', 'relative_humidity_percent', 'air_quality:idx'],
  });
  const data = await poll(activityId);
  const loc = data?.result?.locations?.[0];
  const params = loc?.parameters;
  if (!params || !Object.keys(params).length) {
    envParamsOk = false;
    console.log('FAIL — env_params returned no parameters.');
  } else {
    console.log('PASS — parameters:', JSON.stringify(params));
  }
}

console.log('\n--- SUMMARY ---');
console.log(`/v1/heatmap    : ${heatmapOk ? 'PASS' : 'NO DATA (UHI delta unavailable)'}`);
console.log(`/v1/env_params : ${envParamsOk ? 'PASS' : 'FAIL'}`);
if (!heatmapOk || !envParamsOk) {
  console.log('\nFortyGuard integration is only PARTIALLY working. See failures above.');
  process.exit(1);
}
console.log('\nAll checks passed. FortyGuard integration is working end to end.');
