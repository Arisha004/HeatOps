import React, { useEffect, useState } from 'react';
import { Loader2, Radio, Sparkles, ShieldCheck } from 'lucide-react';
import { VerdictAndStatsSkeleton } from './VerdictAndStatsSkeleton';
import { DailyTimelineSkeleton } from './DailyTimelineSkeleton';

interface LoadingScreenProps {
  location: string;
  activityType: string;
  language: 'en' | 'hi';
}

const HONEST_STATUS_STEPS_EN = [
  'Querying IMD & microclimate satellite telemetry...',
  'Calculating WBGT (Wet Bulb Globe Temperature) index...',
  'Factoring exertion thermal strain for activity...',
  'Evaluating labor pause windows & safety thresholds (ISO 7243)...',
  'Synthesizing AI contractor safety verdict & directives...',
];

const HONEST_STATUS_STEPS_HI = [
  'मौसम और सैटेलाइट डेटा प्राप्त किया जा रहा है...',
  'WBGT (वेट बल्ब ग्लोब तापमान) इंडेक्स की गणना...',
  'कार्य तनाव और गर्मी गुणांक का आकलन...',
  'मजदूरों के लिए सुरक्षा और ब्रेक का समय तय किया जा रहा है...',
  'साइट मैनेजर के लिए स्पष्ट निर्देश तैयार किए जा रहे हैं...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ location, activityType, language }) => {
  const [stepIdx, setStepIdx] = useState(0);

  const steps = language === 'hi' ? HONEST_STATUS_STEPS_HI : HONEST_STATUS_STEPS_EN;

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % steps.length);
    }, 750);
    return () => clearInterval(timer);
  }, [steps]);

  return (
    <div id="dashboard-loading-state" className="space-y-5 animate-fadeIn">
      {/* Active Pipeline Status Banner */}
      <div className="p-4 rounded-2xl bg-neutral-900 text-white shadow-md border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {language === 'en' ? 'Evaluating Microclimate Heat Risk' : 'माइक्रोक्लाइमेट हीट रिस्क का मूल्यांकन जारी'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  LIVE PIPELINE
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                {location || 'Site Coordinates'} • {activityType || 'Active Labor'}
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-amber-400 bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700">
            Stage {stepIdx + 1} of {steps.length}
          </span>
        </div>

        {/* Dynamic Step Status & Progress Bar */}
        <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-neutral-200">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span>{steps[stepIdx]}</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              {Math.round(((stepIdx + 1) / steps.length) * 100)}%
            </span>
          </div>

          <div className="w-full bg-neutral-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 1. Skeleton Loader for Verdict & Stats */}
      <VerdictAndStatsSkeleton language={language} />

      {/* 2. Skeleton Loader for Daily Timeline */}
      <DailyTimelineSkeleton language={language} />

      {/* 3. Skeleton Loader for AI Reasoning Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3 shadow-xs animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-200 rounded-full" />
            <div className="h-4 w-48 bg-neutral-200 rounded-md" />
          </div>
          <div className="h-4 w-28 bg-neutral-100 rounded-md" />
        </div>
        <div className="space-y-2.5 pt-1">
          <div className="h-3.5 w-full bg-neutral-200 rounded-md" />
          <div className="h-3.5 w-11/12 bg-neutral-100 rounded-md" />
          <div className="h-3.5 w-4/5 bg-neutral-100 rounded-md" />
        </div>
      </div>
    </div>
  );
};

