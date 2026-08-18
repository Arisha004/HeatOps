import React, { useState } from 'react';
import { HourlyRisk } from '../types';
import { RISK_COLOR_TOKENS } from '../constants';
import {
  X,
  Thermometer,
  Droplets,
  AlertTriangle,
  Shield,
  Sun,
  Activity,
  UserCheck,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface HourDetailSheetProps {
  hourData: HourlyRisk | null;
  onClose: () => void;
  language: 'en' | 'hi';
}

export const HourDetailSheet: React.FC<HourDetailSheetProps> = ({ hourData, onClose, language }) => {
  const [selectedPpe, setSelectedPpe] = useState<'standard' | 'high_vis' | 'heavy_coverall'>('standard');

  if (!hourData) return null;

  const isUnknown = hourData.isUnknown;
  const level = isUnknown ? 'unknown' : hourData.riskLevel;
  const token = RISK_COLOR_TOKENS[level];

  // PPE clothing adjustment factors
  const ppeOffsets = {
    standard: 0.0,
    high_vis: 1.5,
    heavy_coverall: 3.0,
  };

  const adjustedHeatIndex = (hourData.heatIndexC || hourData.tempC) + ppeOffsets[selectedPpe];
  const isPpeExtreme = adjustedHeatIndex >= 42;
  const isPpeHigh = adjustedHeatIndex >= 38;

  // Recommended work/rest regimen for this specific hour
  let dynamicRegimen = '45 min Work / 15 min Rest';
  if (adjustedHeatIndex >= 44) {
    dynamicRegimen = '100% Work Stop (Mandatory Shade)';
  } else if (adjustedHeatIndex >= 41) {
    dynamicRegimen = '15 min Work / 45 min Rest';
  } else if (adjustedHeatIndex >= 37) {
    dynamicRegimen = '30 min Work / 30 min Rest';
  } else if (adjustedHeatIndex < 32) {
    dynamicRegimen = 'Standard Work / Continuous Hydration';
  }

  return (
    <div
      id="hour-detail-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-neutral-200 p-5 sm:p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
              {hourData.hourLabel} ({hourData.hour})
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${token.badgeClass}`}>
              {isUnknown ? 'STALE / UNKNOWN' : token.label}
            </span>
          </div>

          <button
            id="btn-close-hour-detail"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Low Confidence or Stale Data Alert Box */}
        {(hourData.confidence === 'low' || hourData.confidence === 'moderate' || isUnknown) && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">
                {isUnknown
                  ? language === 'en' ? 'Unverified / Stale Window' : 'अपुष्ट या पुराना डेटा'
                  : language === 'en' ? 'Low Confidence Forecast' : 'कम विश्वास पूर्वानुमान'}
              </span>
              <p>
                {isUnknown
                  ? language === 'en'
                    ? 'Live microclimate telemetry interrupted for this hour. Exercise on-site thermal caution.'
                    : 'इस घंटे के लिए लाइव डेटा उपलब्ध नहीं है। साइट पर तापमान जांचें।'
                  : language === 'en'
                  ? 'Rapid convective cloud or dust flux detected. Verify ambient temp with on-site thermometer.'
                  : 'मौसम का तेज़ी से बदलाव संभव है। साइट पर थर्मामीटर से दोबारा जांचें।'}
              </p>
            </div>
          </div>
        )}

        {/* Hour Metrics Grid (4 items) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-semibold">
              <Thermometer className="w-3.5 h-3.5 text-neutral-600" />
              <span>{language === 'en' ? 'Dry Bulb' : 'तापमान'}</span>
            </div>
            <p className="text-base font-bold font-mono text-neutral-900">{isUnknown ? '--' : `${hourData.tempC}°C`}</p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-semibold">
              <Shield className="w-3.5 h-3.5 text-orange-600" />
              <span>{language === 'en' ? 'WBGT Index' : 'महसूस ताप'}</span>
            </div>
            <p className="text-base font-bold font-mono text-orange-950">{isUnknown ? '--' : `${hourData.heatIndexC}°C`}</p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-semibold">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'en' ? 'Humidity' : 'नमी'}</span>
            </div>
            <p className="text-base font-bold font-mono text-neutral-900">{isUnknown ? '--' : `${hourData.humidity}%`}</p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-semibold">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'en' ? 'UV Index' : 'UV सूचकांक'}</span>
            </div>
            <p className="text-base font-bold font-mono text-neutral-900">{isUnknown ? '--' : `${hourData.uvIndex} / 12`}</p>
          </div>
        </div>

        {/* Interactive PPE Strain Calculator */}
        <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-orange-600" />
              {language === 'en' ? 'PPE Thermal Strain Modifier' : 'पीपीई थर्मल स्ट्रेन गणना'}
            </span>
            <span className="font-mono text-xs font-bold text-orange-700">
              Adj. WBGT: {adjustedHeatIndex.toFixed(1)}°C
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              onClick={() => setSelectedPpe('standard')}
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                selectedPpe === 'standard'
                  ? 'bg-white border-orange-500 font-bold text-orange-950 ring-1 ring-orange-400 shadow-2xs'
                  : 'bg-white/60 border-neutral-200 text-neutral-600 hover:bg-white'
              }`}
            >
              <div className="text-[11px]">Cotton Wear</div>
              <div className="text-[10px] text-neutral-400 font-mono">+0°C</div>
            </button>

            <button
              onClick={() => setSelectedPpe('high_vis')}
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                selectedPpe === 'high_vis'
                  ? 'bg-white border-orange-500 font-bold text-orange-950 ring-1 ring-orange-400 shadow-2xs'
                  : 'bg-white/60 border-neutral-200 text-neutral-600 hover:bg-white'
              }`}
            >
              <div className="text-[11px]">High-Vis Vest</div>
              <div className="text-[10px] text-orange-600 font-mono">+1.5°C</div>
            </button>

            <button
              onClick={() => setSelectedPpe('heavy_coverall')}
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                selectedPpe === 'heavy_coverall'
                  ? 'bg-white border-orange-500 font-bold text-orange-950 ring-1 ring-orange-400 shadow-2xs'
                  : 'bg-white/60 border-neutral-200 text-neutral-600 hover:bg-white'
              }`}
            >
              <div className="text-[11px]">Heavy Coverall</div>
              <div className="text-[10px] text-red-600 font-mono">+3.0°C</div>
            </button>
          </div>

          <div className="p-2 rounded-lg bg-white border border-neutral-200 text-[11px] text-neutral-700 flex items-center justify-between">
            <span className="text-neutral-500">ISO 7243 Work/Rest Protocol:</span>
            <span className="font-bold text-neutral-900">{dynamicRegimen}</span>
          </div>
        </div>

        {/* Actionable Recommendation */}
        <div className="p-3.5 rounded-xl bg-neutral-900 text-white space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            {language === 'en' ? 'Hour Safety Directive' : 'घंटे का सुरक्षा निर्देश'}
          </span>
          <p className="text-xs sm:text-sm font-semibold leading-snug">
            {isUnknown
              ? language === 'en'
                ? 'Check ambient wet-bulb reading manually on site before resuming.'
                : 'साइट पर मैन्युअल तापमान जांचें।'
              : hourData.recommendation}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          id="btn-dismiss-hour-detail"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors min-h-[44px] cursor-pointer"
        >
          {language === 'en' ? 'Done' : 'पूर्ण'}
        </button>
      </div>
    </div>
  );
};
