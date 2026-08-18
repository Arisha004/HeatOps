import React from 'react';

interface VerdictAndStatsSkeletonProps {
  language?: 'en' | 'hi';
}

export const VerdictAndStatsSkeleton: React.FC<VerdictAndStatsSkeletonProps> = ({
  language = 'en',
}) => {
  return (
    <div id="verdict-and-stats-skeleton" className="space-y-4 animate-pulse">
      {/* 1. Verdict Banner Skeleton */}
      <div className="bg-white border-l-4 border-l-neutral-300 border-y border-r border-neutral-200 p-4 rounded-xl shadow-xs space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-28 bg-neutral-200 rounded-md" />
            <div className="h-3 w-16 bg-neutral-100 rounded-md" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-20 bg-emerald-100/60 rounded-lg" />
            <div className="h-6 w-20 bg-neutral-200 rounded-lg" />
          </div>
        </div>
        <div className="h-6 w-5/6 bg-neutral-200 rounded-lg" />
        <div className="h-4 w-2/3 bg-neutral-100 rounded-md" />
      </div>

      {/* 2. Primary Decision Card Skeleton */}
      <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 bg-white space-y-4 shadow-xs">
        {/* Decision Badge & Site Title Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="h-7 w-28 bg-neutral-200 rounded-xl" />
            <div className="h-5 w-48 bg-neutral-300 rounded-md" />
            <div className="h-3.5 w-64 bg-neutral-100 rounded-md" />
          </div>
          <div className="h-6 w-24 bg-neutral-100 rounded-full" />
        </div>

        {/* Reason Box */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
          <div className="h-3.5 w-32 bg-neutral-300 rounded-md" />
          <div className="h-4 w-full bg-neutral-200 rounded-md" />
          <div className="h-4 w-4/5 bg-neutral-200 rounded-md" />
        </div>

        {/* Recommended Pause Window Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="h-3 w-36 bg-amber-200/80 rounded-md" />
            <div className="h-5 w-48 bg-amber-300/80 rounded-md" />
          </div>
          <div className="h-8 w-28 bg-amber-200/70 rounded-xl" />
        </div>

        {/* 5-Metric Telemetry Stat Cards Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-36 bg-neutral-200 rounded-md" />
            <div className="h-3 w-24 bg-neutral-100 rounded-md" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="h-2.5 w-14 bg-neutral-200 rounded-md" />
                  <div className="w-4 h-4 bg-neutral-200 rounded-full" />
                </div>
                <div className="h-6 w-16 bg-neutral-300 rounded-lg" />
                <div className="h-2.5 w-12 bg-neutral-200 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Toolbar Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 rounded-xl bg-neutral-100 border border-neutral-200" />
          ))}
        </div>
      </div>
    </div>
  );
};
