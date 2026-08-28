// FortyGuard Enterprise API client — rebuilt against the live docs
// (docs-api.fortyguard.com, confirmed Aug 2026).
//
// Endpoints actually used, and what each is for:
//   POST /v1/heatmap           polygon_aoi + date_time + granularity
//                              -> stats_data.Temperature_stats (Mean/Min/Max)
//                              This is the ONLY endpoint that aggregates over
//                              an area, so it's what powers the real
//                              "500m site vs 15km city" UHI delta.
//   POST /v1/env_params        single lat/lon point + temperature (CELSIUS)
//                              -> derived heat index / humidity / AQI / solar.
//                              No wind field exists here — wind must keep
//                              coming from Open-Meteo.
//   POST /v1/heat_intelligence single lat/lon point + temperature
//                              (FAHRENHEIT) + analysis categories
//                              -> an async PDF REPORT (data.result.download_link),
//                              which can take several minutes. It returns no
//                              numeric readings at all, so it is NOT part of
//                              the numeric telemetry pipeline — see
//                              submitHeatIntelligenceReport() below, intended
//                              to be triggered explicitly by the user, not on
//                              every analysis run.
//   GET  /v1/status/{id}       polls any of the above.
//
// A schema mismatch fails with 400/422 before any credit is charged, so if
// FortyGuard changes field names, callers will see a clear thrown error
// rather than silently-wrong data.

const FORTYGUARD_BASE = 'https://api.fortyguard.com';

export type LonLat = [number, number];

// FortyGuard's documented example (docs-api.fortyguard.com/docs/create-heatmap)
// sends polygon_aoi as a FeatureCollection wrapping a Feature — this matches
// what the code already does.
function polygonFeatureCollection(ring: LonLat[]) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [ring] },
      },
    ],
  };
}

// Builds a square bounding ring of `meters` half-width around (lat, lon).
// Coordinates are [lon, lat], as GeoJSON requires.
export function siteBox(lat: number, lon: number, meters = 500): LonLat[] {
  const dLat = meters / 111_320;
  const dLon = meters / (111_320 * Math.cos((lat * Math.PI) / 180));
  return [
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat], // closed ring
  ];
}

export interface FGDateTime {
  start_date: string; // YYYY-MM-DD
  filter_type: number; // 1 single hour, 2 range of hours, 3 single day, 4 range of days (heatmap only)
  start_time?: string; // HH:MM, required for filter_type 1 and 2
  end_time?: string; // HH:MM, required for filter_type 2
  end_date?: string; // required for filter_type 4
}

export class FortyGuardError extends Error {}

// Every call below runs inside a single serverless request that the platform
// kills at maxDuration, so the whole integration has to be bounded in wall
// clock. Two separate budgets do that:
//   - HTTP_TIMEOUT_MS caps any one socket that hangs without responding.
//     Measured latencies: /v1/heatmap submit ~3s, /v1/status ~1.2s. 8s leaves
//     real headroom over that without letting a dead socket stall the request.
//   - POLL_BUDGET_MS caps how long we wait for a submitted task to finish.
// Worst case per FortyGuard call is therefore ~28s. The heatmap and env_params
// calls run concurrently, so that is the cost of the whole stage, and it leaves
// room for the Gemini call inside the 60s function limit set in vercel.json.
// Raising either value means re-checking that sum against maxDuration.
const HTTP_TIMEOUT_MS = 8000;
export const POLL_BUDGET_MS = 20000;

async function submitTask(path: string, apiKey: string, payload: any): Promise<string> {
  const res = await fetch(`${FORTYGUARD_BASE}${path}`, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new FortyGuardError(`${path} submit failed: HTTP ${res.status} ${JSON.stringify(body)}`);
  }
  const activityId = body?.data?.activity_id;
  if (!activityId) {
    throw new FortyGuardError(`${path} submit returned no activity_id: ${JSON.stringify(body)}`);
  }
  return activityId;
}

// Single, non-looping status check. Exported so callers (e.g. a "Generate
// Report" button that polls slowly, like heat_intelligence) can drive their
// own cadence instead of blocking on a long internal loop.
export async function checkStatus(apiKey: string, activityId: string): Promise<any> {
  const res = await fetch(`${FORTYGUARD_BASE}/v1/status/${activityId}`, {
    headers: { 'api-key': apiKey },
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new FortyGuardError(`status check failed: HTTP ${res.status} ${JSON.stringify(body)}`);
  }
  return body?.data ?? body;
}

// Bounded by wall clock rather than an attempt count. A fixed 15 attempts at a
// 2s interval could block for 30s before giving up - most of a serverless
// request's entire budget spent waiting on an enrichment call that is allowed
// to fail. The deadline is what actually needs to hold, so poll against it.
async function pollTask(
  apiKey: string,
  activityId: string,
  { budgetMs = POLL_BUDGET_MS, intervalMs = 1000 }: { budgetMs?: number; intervalMs?: number } = {}
): Promise<any> {
  const deadline = Date.now() + budgetMs;
  // Never sleep past the deadline - a full interval at the end would push the
  // whole call over budget just to discover it had already run out.
  const waitForNextAttempt = async () => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return;
    await new Promise((r) => setTimeout(r, Math.min(intervalMs, remaining)));
  };

  for (let attempt = 0; Date.now() < deadline; attempt++) {
    let data: any = null;
    try {
      data = await checkStatus(apiKey, activityId);
    } catch (err) {
      // Activity can be briefly unavailable immediately after submission.
      if (attempt < 3) {
        await waitForNextAttempt();
        continue;
      }
      throw err;
    }
    const status = String(data?.status || '').toLowerCase();
    if (status === 'completed' || status === 'succeeded') return data;
    if (status === 'failed' || status === 'error') {
      throw new FortyGuardError(`task ${activityId} failed: ${JSON.stringify(data)}`);
    }
    await waitForNextAttempt();
  }
  throw new FortyGuardError(`task ${activityId} did not complete within ${budgetMs}ms`);
}

// ---------------------------------------------------------------------------
// /v1/heatmap — the real source of the site-vs-city temperature delta (UHI).
// ---------------------------------------------------------------------------

export interface HeatmapStats {
  mean: number | null;
  min: number | null;
  max: number | null;
  nCells: number | null;
  raw: any;
}

export async function fetchHeatmapStats(
  apiKey: string,
  ring: LonLat[],
  dateTime: FGDateTime,
  granularity: 60 | 80 | 100 = 100
): Promise<HeatmapStats> {
  const payload = {
    polygon_aoi: polygonFeatureCollection(ring),
    date_time: dateTime,
    granularity,
    analytic_type: 'tcm', // documented, optional, default 'tcm' — explicit for clarity
  };
  const activityId = await submitTask('/v1/heatmap', apiKey, payload);
  const data = await pollTask(apiKey, activityId);
  // Field casing has been observed inconsistent across responses
  // (Temperature_stats vs temperature_stats) — check both.
  const statsData = data?.result?.stats_data;
  const stats = statsData?.Temperature_stats ?? statsData?.temperature_stats;
  const nCells = typeof statsData?.n_cells === 'number'
    ? statsData.n_cells
    : Array.isArray(data?.result?.map_data?.features)
    ? data.result.map_data.features.length
    : null;

  const pick = (a: any, b: any) => (typeof a === 'number' ? a : typeof b === 'number' ? b : null);
  return {
    mean: pick(stats?.Mean, stats?.mean),
    min: pick(stats?.Minimum, stats?.minimum),
    max: pick(stats?.Maximum, stats?.maximum),
    nCells,
    raw: data,
  };
}

// ---------------------------------------------------------------------------
// /v1/env_params — point-level enrichment (heat index, humidity, AQI, solar).
// IMPORTANT: temperature input here is CELSIUS. No wind field exists.
// ---------------------------------------------------------------------------

export interface EnvParamsReading {
  heatIndexC: number | null;
  humidity: number | null;
  aqi: number | null;
  solarGhiWm2: number | null;
  raw: any;
}

export async function fetchEnvParams(
  apiKey: string,
  lat: number,
  lon: number,
  temperatureC: number,
  dateTime: FGDateTime,
  analysis?: string[] // e.g. ['heat_index_celsius','relative_humidity_percent','air_quality:idx']
): Promise<EnvParamsReading> {
  const payload: any = {
    latitude: lat,
    longitude: lon,
    temperature: temperatureC,
    date_time: dateTime,
  };
  if (analysis && analysis.length) payload.analysis = analysis;

  const activityId = await submitTask('/v1/env_params', apiKey, payload);
  const data = await pollTask(apiKey, activityId);
  const loc = data?.result?.locations?.[0];
  const params = loc?.parameters ?? {};

  const num = (v: any): number | null => {
    if (typeof v === 'number') return v;
    if (Array.isArray(v) && typeof v[0] === 'number') return v[0];
    return null;
  };

  return {
    heatIndexC: num(params.heat_index_celsius),
    humidity: num(params.relative_humidity_percent),
    aqi: num(params['air_quality:idx']),
    solarGhiWm2: typeof loc?.solar_irradiance?.clear_sky?.ghi === 'number' ? loc.solar_irradiance.clear_sky.ghi : null,
    raw: data,
  };
}

// ---------------------------------------------------------------------------
// /v1/heat_intelligence — optional, slow PDF report. Requires FAHRENHEIT.
// This ONLY submits the job; it does not poll to completion, because report
// generation can take several minutes. Drive polling from the caller (e.g.
// a "Generate Report" UI action) using checkStatus() above, and stop once
// status is "Completed" (read result.download_link immediately — it's a
// temporary signed URL) or "Failed" (terminal).
// ---------------------------------------------------------------------------

export type HeatIntelligenceCategory = 'geographic' | 'environmental' | 'urban' | 'events' | 'anthropogenic';

export async function submitHeatIntelligenceReport(
  apiKey: string,
  lat: number,
  lon: number,
  temperatureF: number,
  date: string,
  analysis: HeatIntelligenceCategory[]
): Promise<string> {
  const payload = {
    latitude: lat,
    longitude: lon,
    temperature: temperatureF,
    date,
    analysis,
  };
  return submitTask('/v1/heat_intelligence', apiKey, payload);
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}