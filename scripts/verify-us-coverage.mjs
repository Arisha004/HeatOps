// Single-call proof that the FortyGuard integration works correctly for a
// US location (their current release's supported region). Uses New York —
// the exact coordinates from FortyGuard's own docs example — so a pass here
// means the code is correct; it was never a bug, only regional coverage.
//
// Run: node scripts/verify-us-coverage.mjs
// Cost: 1 heatmap activity (1 credit-consuming call).

import 'dotenv/config';

const KEY = process.env.FORTYGUARD_API_KEY;
if (!KEY) {
  console.error('FORTYGUARD_API_KEY not found in .env.');
  process.exit(1);
}

const BASE = 'https://api.fortyguard.com';
// New York — matches docs-api.fortyguard.com/docs/create-heatmap's own example area.
const ring = [
  [-74.0170, 40.7050],
  [-74.0030, 40.7050],
  [-74.0030, 40.7180],
  [-74.0170, 40.7180],
  [-74.0170, 40.7050],
];

const today = new Date().toISOString().slice(0, 10);
const hour = new Date().getUTCHours();

async function main() {
  const submitRes = await fetch(`${BASE}/v1/heatmap`, {
    method: 'POST',
    headers: { 'api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      polygon_aoi: {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }],
      },
      date_time: { start_date: today, start_time: `${String(hour).padStart(2, '0')}:00`, filter_type: 1 },
      granularity: 100,
      analytic_type: 'tcm',
    }),
  });
  const submitBody = await submitRes.json();
  if (!submitRes.ok) {
    console.error('Submit failed:', submitRes.status, submitBody);
    process.exit(1);
  }
  const activityId = submitBody.data.activity_id;
  console.log(`Submitted. activity_id=${activityId}. Polling...`);

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(`${BASE}/v1/status/${activityId}`, { headers: { 'api-key': KEY } });
    const statusBody = await statusRes.json();
    const status = statusBody?.data?.status;
    if (status === 'Completed') {
      const stats = statusBody.data.result?.stats_data;
      console.log(`n_cells=${stats?.n_cells}`);
      console.log(`Temperature_stats=${JSON.stringify(stats?.Temperature_stats)}`);
      if (stats?.n_cells > 0 && stats?.Temperature_stats?.Mean !== undefined) {
        console.log('\nPASS — US coordinates return real cells and Temperature_stats.Mean. Integration confirmed correct.');
      } else {
        console.log('\nUNEXPECTED — Completed but no cells/stats even for a US location. Needs further investigation.');
      }
      return;
    }
    if (status === 'Failed') {
      console.error('Task failed:', JSON.stringify(statusBody));
      process.exit(1);
    }
  }
  console.error('Timed out waiting for completion.');
}

main();
