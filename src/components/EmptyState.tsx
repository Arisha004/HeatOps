import React from 'react';
import { Sun, Plus, ArrowRight } from 'lucide-react';
import { PRESET_SITES } from '../constants';
import { PredefinedSitePreset } from '../types';

interface EmptyStateProps {
  onSetupNewSite: () => void;
  onSelectPreset: (preset: PredefinedSitePreset) => void;
  language: 'en' | 'hi';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSetupNewSite, onSelectPreset, language }) => {
  return (
    <div id="empty-state-card" className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl border border-neutral-200 shadow-xs text-center space-y-6">
      {/* Calm Zen Icon Header */}
      <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
        <Sun className="w-7 h-7 text-amber-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          {language === 'en' ? 'No Active Site Evaluated' : 'कोई सक्रिय साइट नहीं है'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
          {language === 'en'
            ? 'HeatOps answers one question in under 3 seconds: Is it safe for outdoor labor to work right now, and when should work pause?'
            : 'हीट-ऑप्स 3 सेकंड में उत्तर देता है: क्या अभी काम करना सुरक्षित है और कब रुकना चाहिए?'}
        </p>
      </div>

      {/* Main CTA */}
      <button
        id="btn-empty-start-setup"
        onClick={onSetupNewSite}
        className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs min-h-[48px] cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>{language === 'en' ? 'Setup First Site Run' : 'पहला साइट रन शुरू करें'}</span>
      </button>

      {/* Quick 1-Tap Presets */}
      <div className="pt-4 border-t border-neutral-100 space-y-2 text-left">
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          {language === 'en' ? 'Or load 1-tap template' : 'या टेम्पलेट चुनें'}
        </p>
        <div className="space-y-1.5">
          {PRESET_SITES.slice(0, 3).map((preset, idx) => (
            <button
              key={idx}
              id={`empty-preset-${idx}`}
              onClick={() => onSelectPreset(preset)}
              className="w-full text-left p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/80 hover:border-neutral-300 transition-all text-xs flex items-center justify-between group min-h-[44px]"
            >
              <div>
                <span className="font-semibold text-neutral-900 block truncate max-w-[200px]">
                  {preset.siteName}
                </span>
                <span className="text-[10px] text-neutral-500 truncate block">
                  {preset.location} • {preset.activityType}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
