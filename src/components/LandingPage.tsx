import React, { useState } from 'react';
import {
  ShieldAlert,
  Thermometer,
  Sun,
  Users,
  Send,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Building2,
  Truck,
  HardHat,
  Sparkles,
  Zap,
  Globe2,
  Clock,
  Gauge,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
  Award,
  PhoneCall,
  Activity,
  AlertTriangle,
  Play
} from 'lucide-react';
import { Logo } from './Logo';
import { ThermalGlobe3D } from './ThermalGlobe3D';
import { WbgtStation3D } from './WbgtStation3D';
import { SiteThermalZone3D } from './SiteThermalZone3D';
import { PredefinedSitePreset } from '../types';
import { PRESET_SITES } from '../constants';
import { HeroSection } from './HeroSection';

interface LandingPageProps {
  onLaunchTool: () => void;
  onSelectPresetDemo: (preset?: PredefinedSitePreset) => void;
  onOpenAuth?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchTool,
  onSelectPresetDemo,
  onOpenAuth,
}) => {
  // Active 3D Tab View
  const [active3dTab, setActive3dTab] = useState<'globe' | 'station' | 'zones'>('globe');

  // Interactive Live Sandbox preset state
  const [selectedSandboxIndex, setSelectedSandboxIndex] = useState<number>(0);

  // Interactive ROI Calculator State
  const [workerCount, setWorkerCount] = useState<number>(50);
  const [shiftHours, setShiftHours] = useState<number>(10);

  // FAQ expanded items state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const activeSandboxPreset = PRESET_SITES[selectedSandboxIndex] || PRESET_SITES[0];

  // Precalculated sandbox metrics for fast interactive preview
  const sandboxStats = [
    {
      wbgt: 35.6,
      ambient: 43.8,
      humidity: 48,
      status: 'NO-GO',
      statusClass: 'bg-red-50 text-red-900 border-red-200',
      statusBadge: 'CRITICAL NO-GO',
      pauseWindow: '11:00 AM – 03:30 PM',
      riskFactor: '+2.5°C Concrete Hydration Exertion',
    },
    {
      wbgt: 36.4,
      ambient: 44.5,
      humidity: 32,
      status: 'NO-GO',
      statusClass: 'bg-red-50 text-red-900 border-red-200',
      statusBadge: 'CRITICAL NO-GO',
      pauseWindow: '10:30 AM – 04:00 PM',
      riskFactor: '+4.5°C Bitumen Thermal Radiation',
    },
    {
      wbgt: 34.2,
      ambient: 41.2,
      humidity: 52,
      status: 'NO-GO',
      statusClass: 'bg-red-50 text-red-900 border-red-200',
      statusBadge: 'CRITICAL NO-GO',
      pauseWindow: '11:30 AM – 03:00 PM',
      riskFactor: '+3.8°C Metal Roof Reflection',
    },
    {
      wbgt: 31.8,
      ambient: 38.5,
      humidity: 60,
      status: 'CAUTION',
      statusClass: 'bg-amber-50 text-amber-900 border-amber-200',
      statusBadge: 'CAUTION (MODERATE)',
      pauseWindow: 'Mandatory 15-min rest every 45 min',
      riskFactor: 'High Humidity Loading Bay Enclosure',
    },
  ];

  const currentSandboxStat = sandboxStats[selectedSandboxIndex];

  // ROI Calculations
  const estimatedAvoidedIncidents = Math.max(1, Math.round((workerCount * shiftHours * 0.008)));
  const estimatedProductiveHoursSaved = Math.round(workerCount * (shiftHours * 0.18));
  const estimatedComplianceRating = 99.8;

  const faqs = [
    {
      qEn: 'How does HeatOps calculate WBGT without on-site hardware sensors?',
      aEn: 'HeatOps blends real-time multi-band satellite thermal feeds, ambient shade temperatures, relative humidity evaporation rates, and solar zenith angles calibrated to ISO 7243 standard formulas. It adds activity-specific metabolic exertion factors (+4.5°C for asphalt, +3.8°C for metal roofing).',
    },
    {
      qEn: 'Does the SMS crew broadcast work on basic feature phones at remote job sites?',
      aEn: 'Yes. HeatOps sends lightweight, carrier-grade SMS messages in plain English. No app installation or smartphone data connection is required for crew members or supervisors.',
    },
    {
      qEn: 'Can we customize our company’s thermal safety threshold (°C)?',
      aEn: 'Absolutely. While the default safety limit adheres to ISO 7243 & NIOSH guidelines (35°C WBGT), safety managers can adjust thresholds anywhere between 30°C and 42°C to match specific corporate HSE policies.',
    },
    {
      qEn: 'What happens if our site loses mobile internet connectivity?',
      aEn: 'HeatOps features an offline telemetry cache that retains the most recent 12-hour hourly risk forecast and site protocol matrices locally in the browser, ensuring continuous operation without disruptions.',
    },
  ];

  return (
    <div id="landing-page" className="space-y-12 py-2 animate-fade-in max-w-5xl mx-auto text-neutral-900">
      {/* 1. TOP HERO SECTION WITH 3D COBE GLOBE */}
      <HeroSection
        onLaunchTool={onLaunchTool}
        onSelectPresetDemo={(presetIndex) =>
          onSelectPresetDemo(PRESET_SITES[presetIndex] || PRESET_SITES[0])
        }
      />

      {/* 4 Core Hero Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto border-t border-neutral-200 pt-6">
          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-0.5 text-left">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-mono font-bold text-neutral-500">REALTIME</span>
            </div>
            <span className="text-xl font-extrabold text-neutral-900 font-mono">&lt;1.2s</span>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase block">
              Analysis Speed
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-0.5 text-left">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono font-bold text-neutral-500">GSM/WHATSAPP</span>
            </div>
            <span className="text-xl font-extrabold text-neutral-900 font-mono">100%</span>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase block">
              Feature Phone SMS
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-0.5 text-left">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <Award className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-mono font-bold text-neutral-500">COMPLIANCE</span>
            </div>
            <span className="text-xl font-extrabold text-neutral-900 font-mono">ISO 7243</span>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase block">
              Standard WBGT
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-0.5 text-left">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <Activity className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-mono font-bold text-neutral-500">SAFETY</span>
            </div>
            <span className="text-xl font-extrabold text-neutral-900 font-mono">Zero</span>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase block">
              Heat Fatalities
            </span>
          </div>
        </div>

      {/* 2. REGULATORY & STANDARDS COMPLIANCE BANNER */}
      <section id="standards-strip" className="p-4 bg-neutral-900 text-white rounded-2xl border border-neutral-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                Industrial Ergonomics & Thermal Regulatory Alignment
              </span>
              <span className="text-[11px] text-neutral-400">
                Grounded in ISO 7243, NIOSH Criteria 2016-106 & OSHA Heat Guidelines
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
            <span className="px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">
              ISO 7243:2017
            </span>
            <span className="px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-amber-300">
              OSHA HEAT NEP
            </span>
            <span className="px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">
              OSHA 3154
            </span>
            <span className="px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-emerald-300">
              NWS GRID CALIBRATED
            </span>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 3D TECHNOLOGY SHOWCASE WITH TAB CONTROLS */}
      <section id="3d-interactive-showcase" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wider block">
              Interactive 3D Engine Suite
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Explore Thermal Strain Physics & Hardware
            </h2>
          </div>

          {/* Tab Switcher */}
          <div className="inline-flex p-1 bg-neutral-200/80 rounded-xl text-xs font-semibold gap-1 self-start sm:self-auto">
            <button
              onClick={() => setActive3dTab('globe')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                active3dTab === 'globe'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Solar Dome 3D</span>
            </button>

            <button
              onClick={() => setActive3dTab('station')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                active3dTab === 'station'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span>2. WBGT Sensor 3D</span>
            </button>

            <button
              onClick={() => setActive3dTab('zones')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                active3dTab === 'zones'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Site Zones 3D</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="transition-all duration-300">
          {active3dTab === 'globe' && <ThermalGlobe3D />}
          {active3dTab === 'station' && <WbgtStation3D />}
          {active3dTab === 'zones' && <SiteThermalZone3D />}
        </div>
      </section>

      {/* 4. INTERACTIVE LIVE EVALUATOR SANDBOX PREVIEW */}
      <section id="interactive-sandbox" className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wider block">
              Interactive Sandbox
            </span>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Test HeatOps Across Real US Sun Belt Job Sites
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Click a site below to inspect risk:
          </span>
        </div>

        {/* Site Scenario Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_SITES.map((site, index) => {
            const isSelected = selectedSandboxIndex === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedSandboxIndex(index)}
                className={`p-3 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <span className="font-bold block truncate">{site.siteName.split(' ')[0]} {site.siteName.split(' ')[1]}</span>
                <span className={`text-[10px] block truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {site.activityType}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Evaluated Output Card */}
        <div className="p-5 rounded-2xl bg-neutral-950 text-white border border-neutral-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Selected Site Evaluation</span>
              <h3 className="text-base font-bold text-white">{activeSandboxPreset.siteName} ({activeSandboxPreset.location})</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
              {currentSandboxStat.statusBadge}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-neutral-400 text-[10px] block font-mono">Calculated WBGT Index</span>
              <span className="text-2xl font-bold font-mono text-amber-400">{currentSandboxStat.wbgt}°C</span>
              <span className="text-[10px] text-neutral-500 block">Ambient: {currentSandboxStat.ambient}°C ({currentSandboxStat.humidity}% RH)</span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-neutral-400 text-[10px] block font-mono">Mandatory Work Pause</span>
              <span className="text-sm font-bold font-mono text-red-400 block">{currentSandboxStat.pauseWindow}</span>
              <span className="text-[10px] text-neutral-400 block">{currentSandboxStat.riskFactor}</span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-neutral-400 text-[10px] block font-mono">Generated SMS Broadcast</span>
              <p className="text-[11px] text-neutral-300 font-mono italic leading-snug line-clamp-2">
                "HEAT ALERT: {activeSandboxPreset.siteName} WBGT {currentSandboxStat.wbgt}°C. Stop work {currentSandboxStat.pauseWindow}. Shift to shade."
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-neutral-400">
              Want to inspect the full timeline and trigger SMS?
            </span>
            <button
              onClick={() => onSelectPresetDemo(activeSandboxPreset)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Open Full Interactive Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. 4-STEP OPERATIONAL HOW-IT-WORKS PIPELINE */}
      <section id="how-it-works" className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wider block">
            Operational Architecture
          </span>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            How HeatOps Secures Site Operations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-2 relative">
            <span className="text-2xl font-extrabold font-mono text-neutral-200 block">01</span>
            <h3 className="text-sm font-bold text-neutral-900">
              Site Telemetry Ingestion
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Captures geolocation, activity type, planned shift hours, and worker density multipliers.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-2 relative">
            <span className="text-2xl font-extrabold font-mono text-neutral-200 block">02</span>
            <h3 className="text-sm font-bold text-neutral-900">
              ISO 7243 WBGT Calculation
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Calculates wet-bulb evaporative cooling efficiency and black-globe radiant solar absorption.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-2 relative">
            <span className="text-2xl font-extrabold font-mono text-neutral-200 block">03</span>
            <h3 className="text-sm font-bold text-neutral-900">
              AI Contractor Verdict
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Generates unambiguous GO / CAUTION / NO-GO status with hour-by-hour pause schedules.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-2 relative">
            <span className="text-2xl font-extrabold font-mono text-neutral-200 block">04</span>
            <h3 className="text-sm font-bold text-neutral-900">
              1-Tap Crew SMS Broadcast
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Sends actionable safety orders in plain English directly to field leads and supervisors.
            </p>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE ROI & SAFETY IMPACT CALCULATOR */}
      <section id="safety-calculator" className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Workforce Safety & Compliance Impact Calculator
              </h2>
              <p className="text-xs text-neutral-400">
                Estimate preventable heat incidents based on your crew parameters
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Controls */}
          <div className="md:col-span-6 space-y-5 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-neutral-300">Active Field Workers on Site:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{workerCount} Laborers</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={workerCount}
                onChange={(e) => setWorkerCount(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>10 Small Crew</span>
                <span>250 Medium Site</span>
                <span>500+ Mega Project</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-neutral-300">Daily Outdoor Shift Duration:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{shiftHours} Hours</span>
              </div>
              <input
                type="range"
                min="6"
                max="14"
                step="1"
                value={shiftHours}
                onChange={(e) => setShiftHours(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>6h Partial Shift</span>
                <span>10h Standard</span>
                <span>14h Extended Infra</span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="md:col-span-6 grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 space-y-1">
              <span className="text-neutral-400 text-[10px] font-mono block">Preventable Acute Incidents</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 block">~{estimatedAvoidedIncidents} / Month</span>
              <span className="text-[10px] text-neutral-400 leading-tight block">Avoids hospitalizations & emergency shutdowns</span>
            </div>

            <div className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 space-y-1">
              <span className="text-neutral-400 text-[10px] font-mono block">Optimized Labor Hours</span>
              <span className="text-2xl font-bold font-mono text-amber-400 block">{estimatedProductiveHoursSaved} hrs</span>
              <span className="text-[10px] text-neutral-400 leading-tight block">Prevents heat-exhaustion slowdowns</span>
            </div>

            <div className="col-span-2 p-3 bg-neutral-800/80 rounded-xl border border-neutral-700 flex items-center justify-between text-xs">
              <span className="text-neutral-300">HSE & ISO 7243 Audit Compliance:</span>
              <span className="font-mono font-bold text-emerald-400">{estimatedComplianceRating}% Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ENTERPRISE DOMAINS SECTION */}
      <section id="domains-section" className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Engineered For High-Exertion Field Operations
          </h2>
          <p className="text-xs text-neutral-500">
            Tailored metabolic strain modeling across primary industries
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center">
              <HardHat className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900">Construction Sites</h4>
            <p className="text-neutral-600 leading-relaxed">
              Formwork, concrete pouring, structural steel, roofing sheet installation, masonry, scaffolding.
            </p>
            <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Metabolic Strain: +2.5°C to +3.8°C
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900">Logistics & Fleets</h4>
            <p className="text-neutral-600 leading-relaxed">
              Outdoor loading bays, material transport, truck staging hubs, last-mile container sorting.
            </p>
            <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Enclosure Humidity: +1.5°C
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900">Infrastructure Works</h4>
            <p className="text-neutral-600 leading-relaxed">
              Highway asphalt paving, railway line excavation, pipeline trenching, municipal utilities.
            </p>
            <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200">
              Bitumen Radiative: +4.5°C
            </span>
          </div>
        </div>
      </section>

      {/* 8. ENTERPRISE FAQS ACCORDION */}
      <section id="faqs-section" className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wider block">
            Frequently Asked Questions
          </span>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Everything Contractors Need To Know
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={index}
                className="border border-neutral-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-neutral-900 flex items-center justify-between gap-3 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <span>{faq.qEn}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="p-4 bg-white text-xs text-neutral-600 leading-relaxed border-t border-neutral-200 animate-fade-in">
                    {faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. BOTTOM CONVERSION CTA BANNER */}
      <section id="cta-bottom" className="text-center p-8 sm:p-10 bg-neutral-950 text-white rounded-3xl border border-neutral-800 shadow-xl space-y-6">
        <Logo size={46} className="mx-auto" />
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Deploy HeatOps on Your Site in Seconds
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Zero hardware installation required. Evaluate thermal strain and safeguard your workforce immediately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="btn-landing-bottom-cta"
            onClick={onLaunchTool}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer min-h-[48px]"
          >
            <span>Evaluate Site Risk Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm border border-neutral-700 transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2"
            >
              <span>Contractor Sign In (Supabase)</span>
            </button>
          )}

          <button
            onClick={() => onSelectPresetDemo(PRESET_SITES[0])}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold text-sm border border-neutral-800 transition-all cursor-pointer min-h-[48px]"
          >
            <span>Try Demo Site Preset</span>
          </button>
        </div>
      </section>
    </div>
  );
};
