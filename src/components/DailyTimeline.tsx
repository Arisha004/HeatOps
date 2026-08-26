import React from 'react';
import { HourlyRisk, RiskLevel } from '../types';
import { RISK_COLOR_TOKENS } from '../constants';
import { Clock, Info, AlertTriangle } from 'lucide-react';

interface DailyTimelineProps {
  hourlyRisks: HourlyRisk[];
  selectedHour: HourlyRisk | null;
  onSelectHour: (hour: HourlyRisk) => void;
  isPartialData?: boolean;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  hourlyRisks,
  selectedHour,
  onSelectHour,
  isPartialData = false,
}) => {
  return (
    <div id="daily-timeline-card" className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-600" />
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
            Hourly Heat-Risk Timeline (6 AM – 6 PM)
          </h3>
        </div>
        <span className="text-[11px] text-neutral-500 font-medium hidden xs:inline">
          Tap segment for details
        </span>
      </div>

      {/* Timeline Segments Grid */}
      <div className="space-y-3">
        <div className="flex sm:grid sm:grid-cols-13 gap-1.5 overflow-x-auto pb-2 min-w-full">
          {hourlyRisks.map((item, idx) => {
            const isUnknown = isPartialData && idx >= 7; // Simulate afternoon unknown/stale feed
            const effectiveLevel: RiskLevel = isUnknown ? 'unknown' : item.riskLevel;
            const token = RISK_COLOR_TOKENS[effectiveLevel];
            const isSelected = selectedHour?.hour === item.hour;

            return (
              <button
                key={item.hour}
                id={`timeline-hour-${item.hour.replace(':', '')}`}
                onClick={() => onSelectHour({ ...item, isUnknown })}
                className={`relative group flex flex-col items-center justify-between p-2 rounded-xl transition-all border min-w-[60px] sm:min-w-0 min-h-[96px] sm:min-h-[104px] cursor-pointer shrink-0 ${
                  isSelected
                    ? 'ring-2 ring-neutral-900 ring-offset-1 scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${token.tailwindBg} ${token.tailwindBorder}`}
                title={`${item.hourLabel}: ${item.tempC}°C (Heat Index: ${item.heatIndexC}°C)`}
              >
                {/* Hour Label */}
                <span className="text-[11px] font-bold text-neutral-800 leading-tight tracking-tight">
                  {item.hourLabel}
                </span>

                {/* Risk Level Pill / Color Bar */}
                <div className="w-full flex flex-col items-center gap-1 my-1">
                  <div className={`w-full h-2.5 rounded-full ${token.tailwindFill} shadow-2xs flex items-center justify-center`}>
                    {item.confidence === 'low' && !isUnknown && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" title="Low confidence" />
                    )}
                  </div>
                  <span className={`text-[9px] font-extrabold tracking-tight truncate max-w-full uppercase ${token.tailwindFg}`}>
                    {isUnknown ? 'UNKN' : token.label}
                  </span>
                </div>

                {/* Temp Value */}
                <div className="text-center leading-tight">
                  <span className="text-xs sm:text-sm font-extrabold text-neutral-900 font-mono block">
                    {isUnknown ? '??' : `${item.tempC}°`}
                  </span>
                  <span className="block text-[9px] font-mono text-neutral-500 font-semibold">
                    {isUnknown ? '--' : `HI:${item.heatIndexC}°`}
                  </span>
                </div>

                {/* Low Confidence or Stale Indicator Badge */}
                {(item.confidence === 'low' || isUnknown) && (
                  <div className="absolute -top-1 -right-1 bg-neutral-900 text-white p-0.5 rounded-full" title="Low confidence or stale segment">
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-300" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px]">
          <div className="flex items-center gap-3 flex-wrap">
            {(['safe', 'caution', 'high', 'extreme'] as RiskLevel[]).map((lvl) => {
              const t = RISK_COLOR_TOKENS[lvl];
              return (
                <div key={lvl} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${t.tailwindFill}`} />
                  <span className="font-medium text-neutral-700">
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1 text-neutral-500">
            <Info className="w-3.5 h-3.5" />
            <span>HI = Heat Index (Feels Like)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DailyTimelineSkeleton } from './DailyTimelineSkeleton';
