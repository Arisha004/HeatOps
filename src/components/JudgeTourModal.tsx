import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Flame,
  Activity,
  FileDown,
  Send,
  Radio,
  X,
  ExternalLink,
  ChevronRight,
  Calculator,
  Layers,
  Globe2,
  Smartphone
} from 'lucide-react';
import { PredefinedSitePreset } from '../types';
import { PRESET_SITES } from '../constants';

interface JudgeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PredefinedSitePreset) => void;
  onOpenPdfReport: () => void;
  onOpenSmsDispatcher: () => void;
  onOpenAuth: () => void;
  onOpenIsoMath: () => void;
  isSimulatingLiveSensor: boolean;
  onToggleLiveSensor: () => void;
}

export const JudgeTourModal: React.FC<JudgeTourModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onOpenPdfReport,
  onOpenSmsDispatcher,
  onOpenAuth,
  onOpenIsoMath,
  isSimulatingLiveSensor,
  onToggleLiveSensor,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'tech'>('presets');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Gradient Banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 flex items-start justify-between gap-4 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                  Interactive Demo & Scenarios Guide
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs font-semibold text-neutral-600">HeatOps v3.4</span>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mt-0.5">
                Live Site Scenarios & Interactive Demo
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

        {/* Navigation Tabs */}
        <div className="flex px-6 pt-3 border-b border-neutral-200 bg-white gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'border-orange-600 text-orange-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Live Site Scenarios
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tech'
                ? 'border-orange-600 text-orange-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Architecture & Math (ISO 7243)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: Live Site Scenarios */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-neutral-600 text-xs">
                Click any real-world industrial site scenario below to instantly run full microclimate thermal risk calculations:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_SITES.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-neutral-200 hover:border-orange-500 bg-white hover:bg-orange-50/40 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 text-xs group-hover:text-orange-600 transition-colors">
                        {preset.siteName}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-orange-600" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>{preset.location.split(',')[0]}</span>
                      <span>•</span>
                      <span className="font-semibold text-neutral-700">{preset.activityType}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-600 pt-1 border-t border-neutral-100">
                      <span>Shift: {preset.startTime} – {preset.endTime}</span>
                      <span className="font-bold text-orange-700">Limit: {preset.thresholdTemp}°C</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Architecture & ISO 7243 Math */}
          {activeTab === 'tech' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-neutral-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-orange-400 font-bold">
                    ISO 7243:2017 MATHEMATICAL FOUNDATION
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenIsoMath();
                    }}
                    className="text-[11px] text-orange-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Open Formula Lab <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-mono text-xs bg-black/40 p-2.5 rounded-lg text-emerald-400 border border-neutral-800">
                  Outdoor WBGT = 0.7·T_nw + 0.2·T_g + 0.1·T_a
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Where <code className="text-orange-300">T_nw</code> is natural wet-bulb temperature (sweat cooling potential), <code className="text-orange-300">T_g</code> is 150mm black globe temperature (solar + radiant load), and <code className="text-orange-300">T_a</code> is ambient dry bulb temperature.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
                  <span className="font-bold text-neutral-900 block">Metabolic Workload (W)</span>
                  <span className="text-[11px] text-neutral-600">
                    Concrete Pouring: 415W • Asphalt: 460W • Masonry: 300W
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
                  <span className="font-bold text-neutral-900 block">Clothing Value (CAF)</span>
                  <span className="text-[11px] text-neutral-600">
                    Coverall: +0°C • High-Vis Vest: +1.5°C • Chemical PPE: +10°C
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Test Strip */}
          <div className="pt-2 border-t border-neutral-200">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Quick Feature Access:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenPdfReport();
                }}
                className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-orange-600" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenSmsDispatcher();
                }}
                className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>SMS Dispatch</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Auth</span>
              </button>

              <button
                onClick={onToggleLiveSensor}
                className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer ${
                  isSimulatingLiveSensor
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isSimulatingLiveSensor ? 'text-emerald-600 animate-pulse' : 'text-neutral-500'}`} />
                <span>{isSimulatingLiveSensor ? 'IoT Stream ON' : 'IoT Sensor Stream'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-medium">
            HeatOps • Occupational Thermal Safety Intelligence
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Start Live Experience →
          </button>
        </div>
      </div>
    </div>
  );
};
