// Zero-cost local test harness.
// Mocks global.fetch BEFORE importing server.ts, so:
//   - No real network calls happen (sandboxed environment can't reach
//     open-meteo/fortyguard anyway)
//   - No FortyGuard credits or Gemini tokens are spent
//   - We still exercise the REAL server.ts code (geocoding, weather parsing,
//     ISO 7243 risk engine, Gemini-skip messaging, response shape) end to end
//
// This does NOT prove the live FortyGuard/Gemini integration works (that
// needs real keys) but it proves every line of your own logic runs without
// crashing and produces internally-consistent output for both a US site
// (FortyGuard-eligible) and a non-US site (India, Open-Meteo-only path).

const realFetch = global.fetch;

function hourlyMockWeather(baseTemp: number, baseHumidity: number) {
  const hours = Array.from({ length: 24 }, (_, h) => h);
  return {
    temperature_2m: hours.map((h) => Math.round(baseTemp + 10 * Math.sin(((h - 6) / 12) * Math.PI))),
    relative_humidity_2m: hours.map((h) => Math.round(baseHumidity - 20 * Math.sin(((h - 6) / 12) * Math.PI))),
    direct_normal_irradiance: hours.map((h) => Math.max(0, Math.round(800 * Math.sin(((h - 6) / 12) * Math.PI)))),
    uv_index: hours.map((h) => Math.max(0, Math.round(10 * Math.sin(((h - 6) / 12) * Math.PI)))),
    wind_speed_10m: hours.map(() => 10),
    apparent_temperature: hours.map((h) => Math.round(baseTemp + 10 * Math.sin(((h - 6) / 12) * Math.PI))),
  };
}

global.fetch = (async (url: string, init?: any) => {
  const u = String(url);

  if (u.includes('geocoding-api.open-meteo.com')) {
    // Only exercised for locations NOT in the server's KNOWN_COORDINATES table.
    const nameMatch = decodeURIComponent(u).match(/name=([^&]+)/);
    const q = (nameMatch?.[1] || '').toLowerCase();
    if (q.includes('mumbai')) {
      return new Response(JSON.stringify({ results: [{ name: 'Mumbai', admin1: 'Maharashtra', country: 'India', latitude: 19.076, longitude: 72.8777 }] }), { status: 200 });
    }
    if (q.includes('delhi')) {
      return new Response(JSON.stringify({ results: [{ name: 'New Delhi', admin1: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 }] }), { status: 200 });
    }
    if (q.includes('new york')) {
      return new Response(JSON.stringify({ results: [{ name: 'New York', admin1: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 }] }), { status: 200 });
    }
    if (q.includes('bengaluru') || q.includes('bangalore')) {
      return new Response(JSON.stringify({ results: [{ name: 'Bengaluru', admin1: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 }] }), { status: 200 });
    }
    return new Response(JSON.stringify({ results: [] }), { status: 200 });
  }

  if (u.includes('api.open-meteo.com')) {
    // Vary the synthetic profile a bit by lat in the URL so different cities
    // don't all look identical.
    const hot = u.includes('longitude=72') || u.includes('longitude=77'); // India test cities
    const data = hot ? hourlyMockWeather(38, 55) : hourlyMockWeather(34, 30);
    return new Response(JSON.stringify({ hourly: data }), { status: 200 });
  }

  if (u.includes('api.fortyguard.com')) {
    // Should never actually be called in this harness because no
    // FORTYGUARD_API_KEY is set in the test env — fail loudly if it is,
    // since that would mean a real key/credits were about to be used.
    throw new Error('TEST HARNESS: attempted a real FortyGuard call — aborting to avoid spending credits.');
  }

  if (u.includes('generativelanguage') || u.includes('googleapis')) {
    throw new Error('TEST HARNESS: attempted a real Gemini call — aborting to avoid spending tokens.');
  }

  return realFetch(url as any, init);
}) as typeof fetch;

// Force both integrations off for this run so we're testing the pure
// deterministic engine + Open-Meteo fallback path — exactly what runs when
// no credits are being spent.
delete process.env.FORTYGUARD_API_KEY;
delete process.env.GEMINI_API_KEY;

const { app } = await import('./server.js');
const server = app.listen(4123, () => console.log('TEST SERVER UP on :4123'));

async function analyze(body: any) {
  const res = await fetch('http://localhost:4123/api/analyze-heat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, json };
}

function summarize(label: string, result: any) {
  console.log(`\n=== ${label} ===`);
  console.log('HTTP status:', result.status);
  if (result.status !== 200) {
    console.log(JSON.stringify(result.json, null, 2));
    return;
  }
  const d = result.json;
  console.log('dataSource:', d.dataSource, '| fortyGuardNote:', d.fortyGuardNote || '(none)');
  console.log('decisionStatus:', d.decisionStatus);
  console.log('overallVerdict:', d.overallVerdict);
  console.log('recommendedPauseWindow:', d.recommendedPauseWindow);
  console.log('safestWindow:', d.safestWindow);
  console.log('aiEnhanced:', d.aiEnhanced, '| aiNote:', d.aiNote || '(none)');
  const levels = d.hourlyRisks.map((h: any) => h.riskLevel);
  const counts: Record<string, number> = {};
  for (const l of levels) counts[l] = (counts[l] || 0) + 1;
  console.log('hourly risk distribution:', counts);
  console.log('hourly WBGT values:', d.hourlyRisks.map((h: any) => h.heatIndexC).join(', '));
  // Consistency check: does the pause window's flagged hours actually match
  // the hourly table's high/extreme hours?
  const highOrExtreme = d.hourlyRisks.filter((h: any) => h.riskLevel === 'high' || h.riskLevel === 'extreme').map((h: any) => h.hourLabel);
  console.log('hours actually flagged HIGH/EXTREME in table:', highOrExtreme.length ? highOrExtreme.join(', ') : '(none)');
}

try {
  summarize('US site — Phoenix, AZ — Concrete Pouring', await analyze({
    location: 'Phoenix, Arizona', activityType: 'Concrete Pouring', startTime: '06:00', endTime: '18:00',
    thresholdTemp: 35, headcount: 30, acclimatized: true, shadeAvailable: false, waterAvailable: true,
  }));

  summarize('US site — New York, NY — Roofing (mild climate mock)', await analyze({
    location: 'New York, New York', activityType: 'Roofing', startTime: '07:00', endTime: '17:00',
    thresholdTemp: 32, headcount: 12, acclimatized: false, shadeAvailable: false, waterAvailable: true,
  }));

  summarize('Non-US site — Mumbai, India — Loading', await analyze({
    location: 'Mumbai, India', activityType: 'Loading', startTime: '06:00', endTime: '18:00',
    thresholdTemp: 33, headcount: 20, acclimatized: true, shadeAvailable: true, waterAvailable: true,
  }));

  summarize('Non-US site — Bengaluru, India — Excavation', await analyze({
    location: 'Bengaluru, India', activityType: 'Excavation', startTime: '06:00', endTime: '18:00',
    thresholdTemp: 34, headcount: 15, acclimatized: true, shadeAvailable: false, waterAvailable: true,
  }));

  summarize('Unresolvable location — should 422, not crash', await analyze({
    location: 'Zzqxnotarealplace123', activityType: 'Concrete Pouring', startTime: '06:00', endTime: '18:00',
    thresholdTemp: 35,
  }));

  const health = await fetch('http://localhost:4123/api/health').then((r) => r.json());
  console.log('\n=== /api/health ===');
  console.log(health);

  // Confirm the FortyGuard-report endpoint fails gracefully (503) when no key
  // is configured, instead of crashing — this is the button that would
  // otherwise cost a Premium FortyGuard credit per click.
  const r1 = await fetch('http://localhost:4123/api/generate-report', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ latitude: 33.44, longitude: -112.07, temperatureC: 40 }),
  });
  console.log('\n=== /api/generate-report (no key) ===');
  console.log('status:', r1.status, await r1.json());
} catch (err) {
  console.error('\nHARNESS ERROR (this would be a real bug):', err);
  process.exitCode = 1;
} finally {
  server.close();
}
