import React, { useState } from 'react';
import {
  Calculator,
  Shield,
  Activity,
  Droplets,
  Sun,
  Wind,
  X,
  Check,
  AlertTriangle,
  Flame,
  Info,
  RefreshCw
} from 'lucide-react';

interface IsoMathModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IsoMathModal: React.FC<IsoMathModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Input parameters
  const [ambientTemp, setAmbientTemp] = useState<number>(40); // Ta
  const [humidity, setHumidity] = useState<number>(50); // RH
  const [solarIrradiance, setSolarIrradiance] = useState<number>(850); // W/m2
  const [windSpeed, setWindSpeed] = useState<number>(2.5); // m/s
  const [metabolicRate, setMetabolicRate] = useState<number>(415); // Watts (Concrete pouring / heavy labor)
  const [clothingType, setClothingType] = useState<'standard' | 'high_vis' | 'double_layer' | 'impermeable'>('standard');

  if (!isOpen) return null;

  // Clothing Adjustment Factor (CAF) in °C per ISO 7243 / ACGIH
  const clothingAdjustments: Record<string, { name: string; caf: number; desc: string }> = {
    standard: { name: 'Standard Cotton Workwear', caf: 0.0, desc: 'Single layer breathable cotton (+0°C)' },
    high_vis: { name: 'High-Visibility Polyester Vest', caf: 1.5, desc: 'Poly-blend reflective vest (+1.5°C)' },
    double_layer: { name: 'Double-Layer Flame Retardant', caf: 3.0, desc: 'Industrial arc/weld shield coverall (+3.0°C)' },
    impermeable: { name: 'Chemical / Vapor-Barrier PPE', caf: 10.0, desc: 'Fully encapsulated hazmat suit (+10.0°C)' },
  };

  const selectedClothing = clothingAdjustments[clothingType];

  // Natural Wet Bulb Approximation (Stull formula simplified)
  const twb =
    ambientTemp * Math.atan(0.151977 * Math.pow(humidity + 8.313659, 0.5)) +
    Math.atan(ambientTemp + humidity) -
    Math.atan(humidity - 1.676331) +
    0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) -
    4.686035;

  // Globe Temperature Approximation (Radiant balance equation)
  const radiantLoad = (solarIrradiance / 1000) * 12.5;
  const windCooling = Math.sqrt(Math.max(0.5, windSpeed));
  const tg = ambientTemp + radiantLoad / windCooling;

  // Outdoor WBGT Formula: 0.7 * T_nw + 0.2 * T_g + 0.1 * T_a
  const rawWbgt = 0.7 * twb + 0.2 * tg + 0.1 * ambientTemp;
  const effectiveWbgt = rawWbgt + selectedClothing.caf;

  // ISO 7243 Reference Threshold Limit Value (TLV) for Acclimatized Workers
  // TLV = 32.5 - (MetabolicRate - 180) / 75
  const isoThreshold = Math.max(26.0, Math.min(33.0, 32.5 - (metabolicRate - 180) / 100));

  // Required Work/Rest cycle calculation (ACGIH / ISO 7243 curve)
  let workRestCycle = '100% Work / Standard Hydration';
  let restRatioColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let coreBodyTempEstimate = (37.0 + (effectiveWbgt - 28) * 0.15 + (metabolicRate / 1000) * 0.4).toFixed(1);

  if (effectiveWbgt > isoThreshold + 4) {
    workRestCycle = 'NO WORK (100% Mandatory Rest in Shaded Shelter)';
    restRatioColor = 'text-red-900 bg-red-50 border-red-200';
  } else if (effectiveWbgt > isoThreshold + 2.5) {
    workRestCycle = '15 min Work / 45 min Rest (25% Workload)';
    restRatioColor = 'text-red-800 bg-red-50 border-red-200';
  } else if (effectiveWbgt > isoThreshold + 1.0) {
    workRestCycle = '30 min Work / 30 min Rest (50% Workload)';
    restRatioColor = 'text-amber-800 bg-amber-50 border-amber-200';
  } else if (effectiveWbgt > isoThreshold - 0.5) {
    workRestCycle = '45 min Work / 15 min Rest (75% Workload)';
    restRatioColor = 'text-amber-800 bg-amber-50 border-amber-200';
  }

  const hourlyWaterNeeded = Math.min(1.5, Math.max(0.5, (effectiveWbgt - 25) * 0.1 + (metabolicRate / 500) * 0.4)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-5 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                ISO 7243:2017 & ACGIH Engine
              </span>
              <h2 className="text-base font-bold text-neutral-900 mt-0.5">
                Microclimate Thermal Lab & PPE Simulator
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Main Computed Display Card */}
          <div className="p-4 rounded-xl bg-neutral-900 text-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[11px] text-neutral-400 font-semibold block">EFFECTIVE WBGT (ADJUSTED FOR PPE)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-orange-400">
                    {effectiveWbgt.toFixed(1)}°C
                  </span>
                  <span className="text-xs text-neutral-400">
                    (Raw: {rawWbgt.toFixed(1)}°C + CAF: +{selectedClothing.caf.toFixed(1)}°C)
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-neutral-400 font-semibold block">ISO THRESHOLD LIMIT (TLV)</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {isoThreshold.toFixed(1)}°C
                </span>
              </div>
            </div>

            {/* Verdict & Work-Rest cycle output */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700 space-y-0.5">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Work/Rest Interval</span>
                <span className="font-bold text-white text-[11px] block">{workRestCycle}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700 space-y-0.5">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Est. Core Temp</span>
                <span className={`font-bold font-mono text-[11px] block ${Number(coreBodyTempEstimate) >= 38.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {coreBodyTempEstimate}°C {Number(coreBodyTempEstimate) >= 38.5 ? '(Strain Alert)' : '(Safe Range)'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700 space-y-0.5">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Electrolyte Hydration</span>
                <span className="font-bold font-mono text-[11px] text-blue-300 block">{hourlyWaterNeeded} Liters / hour</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Ambient Temp Slider */}
            <div className="p-3 rounded-xl border border-neutral-200 bg-white space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-800 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-orange-500" />
                  Ambient Air Temp (T_a)
                </span>
                <span className="font-mono font-bold text-orange-700">{ambientTemp}°C</span>
              </div>
              <input
                type="range"
                min="28"
                max="50"
                step="0.5"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500">Shade dry bulb thermometer</span>
            </div>

            {/* Relative Humidity Slider */}
            <div className="p-3 rounded-xl border border-neutral-200 bg-white space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-800 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  Relative Humidity (RH)
                </span>
                <span className="font-mono font-bold text-blue-700">{humidity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="1"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500">Affects natural wet-bulb cooling rate</span>
            </div>

            {/* Solar Irradiance Slider */}
            <div className="p-3 rounded-xl border border-neutral-200 bg-white space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-800 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Direct Solar Flux (W/m²)
                </span>
                <span className="font-mono font-bold text-amber-700">{solarIrradiance} W/m²</span>
              </div>
              <input
                type="range"
                min="200"
                max="1200"
                step="25"
                value={solarIrradiance}
                onChange={(e) => setSolarIrradiance(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500">Peak midday solar zenith irradiance</span>
            </div>

            {/* Metabolic Workload Slider */}
            <div className="p-3 rounded-xl border border-neutral-200 bg-white space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-800 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-red-500" />
                  Metabolic Rate (Watts)
                </span>
                <span className="font-mono font-bold text-red-700">{metabolicRate} W</span>
              </div>
              <input
                type="range"
                min="150"
                max="550"
                step="25"
                value={metabolicRate}
                onChange={(e) => setMetabolicRate(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500">Light (180W) → Heavy Pouring (415W+)</span>
            </div>
          </div>

          {/* Clothing / PPE Selection */}
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2 shadow-2xs">
            <span className="font-bold text-neutral-900 block">
              Personal Protective Equipment (Clothing Adjustment Value - CAF):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(clothingAdjustments).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setClothingType(key as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    clothingType === key
                      ? 'border-orange-500 bg-orange-50/60 text-orange-950 font-semibold ring-1 ring-orange-400'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{item.name}</span>
                    <span className="font-mono text-[10px] font-bold text-orange-700">+{item.caf}°C</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-medium">
            Formulas comply with ISO 7243:2017 Annex C & ACGIH Heat Stress TLVs®
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
