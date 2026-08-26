// Diagnoses "n_cells: 0" from /v1/heatmap by testing two variables
// independently: polygon size, and how recent the requested date/time is.
//
// Run: node scripts/diagnose-heatmap-cells.mjs
// Requires FORTYGUARD_API_KEY in your .env (loaded automatically).

import 'dotenv/config';

const KEY = process.env.FORTYGUARD_API_KEY;
if (!KEY) {
  console.error('FORTYGUARD_API_KEY not found in .env — nothing to test.');
  process.exit(1);
}

const BASE = 'https://api.fortyguard.com';
const PHOENIX = { lat: 33.4484, lon: -112.0740 }; // Downtown Phoenix, Arizona

function ring(lat, lon, meters) {
  const dLat = meters / 111320;
  const dLon = meters / (111320 * Math.cos((lat * Math.PI) / 180));
  const c = [
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat],
  ];
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [c] } }] };
}

async function submit(payload) {
  const res = await fetch(`${BASE}/v1/heatmap`, {
    method: 'POST',
    headers: { 'api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`submit failed HTTP ${res.status}: ${JSON.stringify(body)}`);
  return body?.data?.activity_id;
}

async function poll(id) {
  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${BASE}/v1/status/${id}`, { headers: { 'api-key': KEY } });
    const body = await res.json();
    const status = String(body?.data?.status || '').toLowerCase();
    if (status === 'completed' || status === 'succeeded') return body.data;
    if (status === 'failed' || status === 'error') throw new Error(`task failed: ${JSON.stringify(body)}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('timed out polling');
}

async function run(label, meters, daysAgo) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  const dateStr = d.toISOString().slice(0, 10);
  const hour = new Date().getUTCHours();
  const payload = {
    polygon_aoi: ring(PHOENIX.lat, PHOENIX.lon, meters),
    date_time: { start_date: dateStr, filter_type: 1, start_time: `${String(hour).padStart(2, '0')}:00` },
    granularity: 100,
    analytic_type: 'tcm',
  };
  try {
    const id = await submit(payload);
    const data = await poll(id);
    const nCells = data?.result?.stats_data?.n_cells;
    const stats = data?.result?.stats_data?.Temperature_stats;
    console.log(`[${label}] meters=${meters} date=${dateStr} hour=${hour} -> n_cells=${nCells}, Temperature_stats=${JSON.stringify(stats)}`);
  } catch (err) {
    console.log(`[${label}] meters=${meters} date=${dateStr} hour=${hour} -> ERROR: ${err.message}`);
  }
}

console.log('--- Testing polygon size (same date/hour as your app uses) ---');
await run('500m (current app size)', 500, 0);
await run('2000m', 2000, 0);
await run('5000m', 5000, 0);

console.log('\n--- Testing date recency (same 500m size) ---');
await run('today', 500, 0);
await run('yesterday', 500, 1);
await run('2 days ago', 500, 2);

console.log('\nDone. Whichever line(s) show n_cells > 0 tell you the actual constraint.');
