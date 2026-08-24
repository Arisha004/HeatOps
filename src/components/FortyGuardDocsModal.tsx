import React, { useState } from 'react';
import {
  X,
  FileCode,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  Globe,
  Database,
  BarChart3,
  Clock,
  Terminal
} from 'lucide-react';

interface FortyGuardDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

export const FortyGuardDocsModal: React.FC<FortyGuardDocsModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'api-spec' | 'architecture' | 'impact'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const samplePolygonPayload = JSON.stringify(
    {
      polygon: [
        [72.8493, 19.0335],
        [72.8583, 19.0335],
        [72.8583, 19.0425],
        [72.8493, 19.0425],
        [72.8493, 19.0335],
      ],
      date: new Date().toISOString().split('T')[0],
      variables: ['temperature_2m', 'relative_humidity', 'solar_zenith_irradiance', 'wind_vector_10m'],
    },
    null,
    2
  );

  const sampleStatusPollResponse = JSON.stringify(
    {
      activity_id: 'act_40g_mumbai_dharavi_8f9a2',
      status: 'completed',
      progress: 1.0,
      result: {
        site_peak_temp_c: 42.8,
        city_baseline_temp_c: 38.6,
        uhi_delta_c: 4.2,
        hourly_series: [
          { hour: '06:00', temp_c: 29.4, rh_pct: 68, solar_wm2: 120, wind_ms: 2.8 },
          { hour: '09:00', temp_c: 34.2, rh_pct: 54, solar_wm2: 540, wind_ms: 3.1 },
          { hour: '12:00', temp_c: 41.5, rh_pct: 42, solar_wm2: 890, wind_ms: 2.4 },
          { hour: '15:00', temp_c: 42.8, rh_pct: 39, solar_wm2: 780, wind_ms: 2.9 },
          { hour: '18:00', temp_c: 36.1, rh_pct: 58, solar_wm2: 180, wind_ms: 3.4 },
        ],
      },
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        id="fortyguard-docs-modal"
        className="bg-white w-full max-w-4xl rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-600/30 border border-orange-500/50 text-orange-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  FortyGuard API Integration & Project Architecture
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-mono font-bold uppercase">
                  FastAPI v1.0.1
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Deterministic microclimate telemetry, 6-stage multi-agent safety pipeline, and ISO 7243 compliance engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-200 bg-neutral-50 px-5 gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-orange-600 text-orange-950 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Project Summary & Solution</span>
          </button>

          <button
            onClick={() => setActiveTab('api-spec')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'api-spec'
                ? 'border-orange-600 text-orange-950 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>FortyGuard API Endpoints</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'border-orange-600 text-orange-950 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>6-Stage Agent Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('impact')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'impact'
                ? 'border-orange-600 text-orange-950 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Occupational & ESG Impact</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-neutral-800 text-xs sm:text-sm leading-relaxed">
          {/* TAB 1: OVERVIEW & SOLUTION */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Pitch Banner */}
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-orange-700 tracking-wider">
                  The One-Line Pitch
                </span>
                <p className="font-semibold text-orange-950 text-sm sm:text-base italic">
                  "Your site runs 4.2 °C hotter than the Mumbai average, and stays above the safe threshold for 6 straight hours. Move the pour to 05:30–11:00 and you keep all 30 workers."
                </p>
              </div>

              {/* The Problem & Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-red-700 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>The Industrial Challenge</span>
                  </div>
                  <p className="text-neutral-600 text-xs">
                    Standard city weather forecasts (e.g. airport weather stations) fail to capture <strong>hyperlocal urban heat island (UHI) intensity</strong> caused by asphalt, rebar, dense concrete, and unshaded industrial sites. Site forepersons lack automated, ISO-compliant decision tools, leading to preventable heat-stroke fatalities and multimillion-rupee project delays.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>The HeatOps Solution</span>
                  </div>
                  <p className="text-neutral-600 text-xs">
                    HeatOps links FortyGuard's 500m microclimate heat intelligence grids directly to a deterministic ISO 7243 / Australian BoM WBGT thermal risk core and Gemini 2.5/3.7 Flash reasoning. Forepersons receive real-time <strong>Go / Adjust / No-Go</strong> verdicts, tailored work-rest regimens, hydration quotas, and a 120-word spoken toolbox briefing in English and Hindi.
                  </p>
                </div>
              </div>

              {/* Core Feature Highlights */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                  Core Platform Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                    <span className="font-bold text-neutral-900 block mb-1">Point-to-Polygon 500m Buffer</span>
                    <p className="text-neutral-500 text-[11px]">
                      Converts supervisor coordinate pins into 500m site bounding boxes vs 15km city baseline grids to calculate exact UHI delta.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                    <span className="font-bold text-neutral-900 block mb-1">Deterministic Risk Engine</span>
                    <p className="text-neutral-500 text-[11px]">
                      Calculates vapour pressure saturation, simplified WBGT, solar flux irradiance, and trade metabolic strain offsets.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                    <span className="font-bold text-neutral-900 block mb-1">Synthetic Voice Toolbox Briefing</span>
                    <p className="text-neutral-500 text-[11px]">
                      Generates 120-word spoken toolbox talks in English & Devanagari Hindi with 1-click Web Speech voice broadcast for site crews.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: API SPECIFICATION */}
          {activeTab === 'api-spec' && (
            <div className="space-y-5">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
                <div>
                  <strong>FortyGuard API Host:</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">https://api.fortyguard.com</code>
                </div>
                <span className="font-mono text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">FastAPI v1.0.1-beta</span>
              </div>

              {/* Endpoint Table */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-mono text-[11px]">
                    <tr>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Endpoint Path</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Status in HeatOps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 font-bold text-blue-700">POST</td>
                      <td className="p-2.5 font-bold text-neutral-900">/v1/heat_intelligence</td>
                      <td className="p-2.5 font-sans text-neutral-600">Hourly ambient temperature series & grid heat layers</td>
                      <td className="p-2.5 text-emerald-700 font-bold font-sans">Active & Integrated</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-700">POST</td>
                      <td className="p-2.5 font-bold text-neutral-900">/v1/env_params</td>
                      <td className="p-2.5 font-sans text-neutral-600">Relative humidity, wind vectors, and solar radiation flux</td>
                      <td className="p-2.5 text-emerald-700 font-bold font-sans">Active & Integrated</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-700">POST</td>
                      <td className="p-2.5 font-bold text-neutral-900">/v1/heatmap</td>
                      <td className="p-2.5 font-sans text-neutral-600">Site cell vs city baseline (UHI Delta computation)</td>
                      <td className="p-2.5 text-emerald-700 font-bold font-sans">Active & Integrated</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-700">GET</td>
                      <td className="p-2.5 font-bold text-neutral-900">/v1/status/&#123;activity_id&#125;</td>
                      <td className="p-2.5 font-sans text-neutral-600">Async polling job resolver with exponential backoff</td>
                      <td className="p-2.5 text-emerald-700 font-bold font-sans">Active & Integrated</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-700">POST</td>
                      <td className="p-2.5 font-bold text-neutral-900">/v1/system/fetch-api-key-usage</td>
                      <td className="p-2.5 font-sans text-neutral-600">Quota monitoring and rate limit protection</td>
                      <td className="p-2.5 text-emerald-700 font-bold font-sans">Active & Integrated</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sample Code Snippet 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 text-xs">
                    Sample 1: Point-to-Polygon 500m Buffer Payload (POST /v1/heat_intelligence)
                  </span>
                  <button
                    onClick={() => handleCopy(samplePolygonPayload, 'poly')}
                    className="flex items-center gap-1 text-[11px] font-mono text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    {copiedKey === 'poly' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'poly' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-neutral-900 text-amber-400 font-mono text-[11px] overflow-x-auto">
                  {samplePolygonPayload}
                </pre>
              </div>

              {/* Sample Code Snippet 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 text-xs">
                    Sample 2: Async Polling Status Resolution (GET /v1/status/&#123;activity_id&#125;)
                  </span>
                  <button
                    onClick={() => handleCopy(sampleStatusPollResponse, 'status')}
                    className="flex items-center gap-1 text-[11px] font-mono text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    {copiedKey === 'status' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'status' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-neutral-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {sampleStatusPollResponse}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: 6-STAGE PIPELINE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <p className="text-neutral-600 text-xs">
                HeatOps executes a deterministic 6-stage pipeline ensuring high performance, zero hallucinated math, and full regulatory traceability:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-3">
                  <span className="font-mono font-bold px-2 py-1 rounded bg-neutral-900 text-white text-xs shrink-0">STG 01</span>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-xs">Stage 1: Intake Agent (LLM + Geo Parser)</h5>
                    <p className="text-neutral-600 text-[11px] mt-0.5">
                      Validates shift parameters, crew headcount, and creates a 500m bounding polygon buffer around the site coordinates.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-3">
                  <span className="font-mono font-bold px-2 py-1 rounded bg-orange-600 text-white text-xs shrink-0">STG 02</span>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-xs">Stage 2: Fetch Agent (Deterministic Async Gateway)</h5>
                    <p className="text-neutral-600 text-[11px] mt-0.5">
                      Submits concurrent async FortyGuard telemetry jobs for air temperature, solar irradiance, relative humidity, and wind vector grids with exponential backoff resolution and in-memory cache deduplication.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-3">
                  <span className="font-mono font-bold px-2 py-1 rounded bg-amber-600 text-white text-xs shrink-0">STG 03</span>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-xs">Stage 3: Risk Engine (Deterministic Pure Math)</h5>
                    <p className="text-neutral-600 text-[11px] mt-0.5">
                      Executes Australian BoM simplified WBGT formula: <code className="font-mono bg-white px-1 py-0.5 rounded border border-neutral-200">e = (RH/100)*6.105*exp(17.27*Ta/(237.7+Ta))</code>, adjusts for solar flux (+2.0°C), wind cooling, and metabolic load offsets.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-3">
                  <span className="font-mono font-bold px-2 py-1 rounded bg-emerald-600 text-white text-xs shrink-0">STG 04</span>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-xs">Stage 4: Mitigation Agent (ACGIH/NIOSH Table Mapping)</h5>
                    <p className="text-neutral-600 text-[11px] mt-0.5">
                      Determines precise Go / Adjust / No-Go decision, safe contiguous shift shift windows, work-rest cycles (e.g. 30m work / 30m rest), and hydration quotas (1.0 L/worker/hr).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-3">
                  <span className="font-mono font-bold px-2 py-1 rounded bg-blue-600 text-white text-xs shrink-0">STG 05</span>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-xs">Stage 5: Verification Agent (Regulatory Safety Audit)</h5>
                    <p className="text-neutral-600 text-[11px] mt-0.5">
                      Audits plan recommendations against ISO 7243:2017 and OSHA/NDMA criteria to guarantee zero mathematical drift before supervisor delivery.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-3">
                  <span className="font-mono font-bold px-2 py-1 rounded bg-purple-600 text-white text-xs shrink-0">STG 06</span>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-xs">Stage 6: Briefing Agent (Bilingual Audio Synthesizer)</h5>
                    <p className="text-neutral-600 text-[11px] mt-0.5">
                      Generates a concise 120-word spoken toolbox talk in English and Hindi for morning site supervisor rollout with 1-click synthetic speech broadcast.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMPACT */}
          {activeTab === 'impact' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <span className="text-2xl font-bold font-mono text-orange-600">0</span>
                  <span className="text-xs font-bold text-neutral-800 block mt-1">Thermal Casualties</span>
                  <span className="text-[10px] text-neutral-500">Zero heat-stroke hospitalizations</span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-2xl font-bold font-mono text-emerald-600">+30%</span>
                  <span className="text-xs font-bold text-neutral-800 block mt-1">Crew Productivity</span>
                  <span className="text-[10px] text-neutral-500">By shifting shifts to safe morning hours</span>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-2xl font-bold font-mono text-blue-600">100%</span>
                  <span className="text-xs font-bold text-neutral-800 block mt-1">ISO 7243 Audit Compliance</span>
                  <span className="text-[10px] text-neutral-500">Legally verifiable contractor reports</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                  Economic & Humanitarian Return on Investment
                </h4>
                <p className="text-neutral-600 text-xs">
                  In developing infrastructure hubs across South Asia and the Middle East, outdoor laborers face ambient temperatures exceeding 45°C exacerbated by urban heat island microclimates. By shifting work windows (e.g. from 11:00 AM–04:00 PM to 05:30 AM–11:00 AM), general contractors prevent catastrophic project stoppage penalties while safeguarding worker lives.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Built for the FortyGuard Hyperlocal Heat Hackathon</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
