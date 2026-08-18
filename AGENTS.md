# HeatOps — MVP Architecture & Build Spec

**What we're demoing:** a site supervisor enters a location, activity, crew size, and shift window. A 6-stage multi-agent pipeline pulls FortyGuard's hyperlocal heat data, runs a deterministic risk engine, and returns a **go / adjust / no-go** decision with an adjusted shift window, work-rest cycle, hydration rate, and a printable worker briefing — with every stage streaming live in the UI.

**The one-line pitch:** *"Your site runs 4.2 °C hotter than the Mumbai average, and stays above the safe threshold for 6 straight hours. Move the pour to 05:30–11:00 and you keep all 30 workers."*

This document is complete. Everything needed to build the MVP is here — formulas, thresholds, tables, prompts, and commands. No external decisions required.

---

## 1. Bootstrap

Environment Variables:
```env
FORTYGUARD_API_KEY=
ANTHROPIC_API_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Both API keys stay server-side. The browser never sees either — all FortyGuard and AI calls happen in the route handler.

---

## 2. FortyGuard API — confirmed surface

Pulled from `https://api.fortyguard.com/openapi.json` (FastAPI `v1.0.1-beta`).

| Method | Path | Use in MVP |
|---|---|---|
| POST | `/v1/heat_intelligence` | primary hourly temperature series |
| POST | `/v1/env_params` | humidity / wind / solar |
| POST | `/v1/heatmap` | site cell vs city baseline → UHI delta |
| GET | `/v1/status/{activity_id}` | **poll for result** |
| POST | `/v1/hackathon-registration` | get the API key |
| POST | `/v1/system/fetch-api-key-usage` | quota check |
| POST | `/v1/satellite`, `/v1/streetview` | **not in MVP** |

### Three facts that shape the build

1. **Every data call is async.** POST returns an `activity_id`; you poll `GET /v1/status/{activity_id}` until it resolves. No FortyGuard call is a synchronous function.
2. **There is no exceedance endpoint and no persistence endpoint.** Those are metrics *we* compute from the hourly series — they live in `risk/`, not `tools/`. This is our IP, not an API passthrough.
3. **Quota is metered.** The cache is mandatory, not an optimisation.

### Phase 0 Fixtures & Demo Fallback

Fallback fixtures for reliability:
- `fixtures/heat_intelligence.mumbai.json`
- `fixtures/env_params.mumbai.json`
- `fixtures/heatmap.mumbai.json`

If FortyGuard is down or rate-limited during judging, the app serves seeded high-fidelity microclimate simulations and the demo runs flawlessly.

---

## 3. Point → polygon

The form takes a pin; FortyGuard takes an area. Use a **500 m square buffer** — small enough to be "this site", big enough to contain grid cells.

```ts
// lib/geo.ts
export function siteBox(lat: number, lon: number, meters = 500) {
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

// City baseline box — 15 km, for the UHI comparison
export const cityBox = (lat: number, lon: number) => siteBox(lat, lon, 15_000);
```

**Demo locations**:
- Dharavi, Mumbai (19.0380, 72.8538)
- BKC, Mumbai (19.0662, 72.8697)
- Navi Mumbai / Vashi (19.0771, 73.0000)
- Noida / Gurugram Sector 62 (28.3900, 77.0400)

---

## 4. Contracts (`types/index.ts`)

- `Band`: `LOW`, `MODERATE`, `HIGH`, `EXTREME`
- `Activity`: `construction`, `delivery`, `agriculture`, `events`
- `OperationSpec`: location, activity, headcount, shift (date, start, end), acclimatized, shadeAvailable, waterAvailable
- `HeatDataset`: hourly readings (tempC, humidityPct, windMs, solarWm2), siteTempC, cityBaselineTempC, source
- `RiskProfile`: index (`wbgt-approx` | `air-temp`), hourly risk, peak, exceedanceHours, longestPersistenceHours, cumulativeExposure, uhiDeltaC, band, safestWindow, drivers
- `MitigationPlan`: verdict (`GO` | `ADJUST` | `NO-GO`), headline, recommendedWindow, workRestCycle, hydrationLitresPerWorkerPerHour, stopWorkTrigger, actions, citedNumbers
- `Verdict`: ok, issues

---

## 5. Transport & Cache (`lib/fortyguard.ts`)

Submit payload to `/v1/heat_intelligence`, `/v1/env_params`, `/v1/heatmap`, poll `/v1/status/{activity_id}` with exponential backoff until completed, and cache results by hash key.

---

## 6. The Risk Engine (`risk/`)

Deterministic pure functions for safety compliance:

### 6.1 WBGT approximation (Australian BoM simplified WBGT):
```
e    = (RH / 100) × 6.105 × exp( 17.27 × Ta / (237.7 + Ta) )     [vapour pressure, hPa]
WBGT = 0.567 × Ta + 0.393 × e + 3.94
```
- Full sun / no shade correction: `+2.0 °C` (when shadeAvailable === false and solarWm2 > 500 or midday).
- Wind cooling: `−min(1.5, windMs × 0.3) °C`.
- Fallback: if humidity unavailable, band on raw air temperature (`index: 'air-temp'`).

### 6.2 Bands and Threshold Shifts:
- Base WBGT thresholds (ISO 7243 / ACGIH TLV):
  - LOW: < 25.0 °C
  - MODERATE: 25.0 – 27.9 °C
  - HIGH: 28.0 – 30.4 °C
  - EXTREME: ≥ 30.5 °C
- Offsets:
  - Heavy construction: −1.5 °C
  - Agriculture / Events: 0 °C
  - Delivery: +1.0 °C
  - Unacclimatized: −1.5 °C
  - No water available: −1.0 °C

### 6.3 Derived Metrics:
- `exceedanceHours`: Hours at HIGH or above.
- `longestPersistenceHours`: Longest unbroken run of severe hours.
- `cumulativeExposure`: Sum of hourly risk scores across shift.
- `uhiDeltaC`: Site peak minus city baseline (Hyperlocal UHI intensity).
- `safestWindow`: Longest contiguous window at MODERATE or below.

### 6.4 Mitigation Table (ACGIH/NIOSH grounded):
- **LOW**: Continuous work, 0.5 L/hr hydration.
- **MODERATE**: 45 min work / 15 min rest, 0.75 L/hr hydration.
- **HIGH**: 30 min work / 30 min rest, 1.0 L/hr hydration, shade + electrolytes, shift window adjustment.
- **EXTREME**: 15 min work / 45 min rest or suspend outdoor work, 1.0 L/hr hydration, emergency triggers.

### 6.5 Deterministic Verdict Rule:
- `NO-GO`: EXTREME band and no safe window exists.
- `ADJUST`: EXTREME band OR exceedanceHours >= 3 OR (HIGH band and persistence >= 2).
- `GO`: within safe threshold limits.

---

## 7. Multi-Agent Pipeline Architecture

6 Stages:
1. **Intake** (LLM): Form input → Validated OperationSpec.
2. **Fetch** (Deterministic): Concurrent FortyGuard jobs → HeatDataset.
3. **Risk** (Deterministic Math): HeatDataset + Spec → RiskProfile.
4. **Mitigation** (LLM with deterministic constraints): RiskProfile + Table → MitigationPlan.
5. **Verify** (Deterministic checks + Safety audit LLM): Plan validation against numbers in RiskProfile.
6. **Briefing** (LLM): 120-word spoken toolbox talk for crew supervisors.

---

## 8. Navigation & Interaction Rules
- Clicking the **HeatOps logo** from anywhere (Header, Footer, or Sidebar) MUST immediately redirect/navigate to the home/landing page and scroll to top.
- Responsive across all screens (Mobile, Tablet, Laptop, Desktop).
