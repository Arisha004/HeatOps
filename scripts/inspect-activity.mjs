// Re-checks a FortyGuard activity by ID and prints the FULL raw response.
// This costs NOTHING extra — per FortyGuard's docs, credits are only
// deducted on the submission that completes, not on subsequent GET status
// polls. Use this to inspect exactly what came back instead of guessing.
//
// Run: node scripts/inspect-activity.mjs <activity_id>

import 'dotenv/config';

const KEY = process.env.FORTYGUARD_API_KEY;
if (!KEY) {
  console.error('FORTYGUARD_API_KEY not found in .env.');
  process.exit(1);
}

const activityId = process.argv[2];
if (!activityId) {
  console.error('Usage: node scripts/inspect-activity.mjs <activity_id>');
  process.exit(1);
}

const res = await fetch(`https://api.fortyguard.com/v1/status/${activityId}`, {
  headers: { 'api-key': KEY },
});
const body = await res.json();
console.log(JSON.stringify(body, null, 2));
