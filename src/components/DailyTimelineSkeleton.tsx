import React from 'react';

interface DailyTimelineSkeletonProps {
}

export const DailyTimelineSkeleton: React.FC<DailyTimelineSkeletonProps> = ({
}) => {
  return (
    <div
      id="daily-timeline-skeleton"
      className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3 shadow-xs animate-pulse"
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-neutral-300 rounded-full" />
          <div className="h-4 w-48 sm:w-64 bg-neutral-200 rounded-md" />
        </div>
        <div className="h-3 w-32 bg-neutral-100 rounded-md hidden xs:block" />
      </div>

      {/* 13 Timeline Segments Grid */}
      <div className="space-y-3">
        <div className="flex sm:grid sm:grid-cols-13 gap-1.5 overflow-x-auto pb-2 min-w-full">
          {Array.from({ length: 13 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-between p-2 rounded-xl border border-neutral-200 bg-neutral-50 min-w-[60px] sm:min-w-0 min-h-[96px] sm:min-h-[104px] shrink-0 space-y-2"
            >
              {/* Hour Label */}
              <div className="h-3 w-7 bg-neutral-200 rounded-md" />

              {/* Center Temperature & Heat Index */}
              <div className="flex flex-col items-center gap-1 w-full my-auto">
                <div className="h-4 w-9 bg-neutral-300 rounded-md" />
                <div className="h-2.5 w-6 bg-neutral-200 rounded-md" />
              </div>

              {/* Status Badge Placeholder */}
              <div className="h-4 w-11 bg-neutral-200 rounded-full" />
            </div>
          ))}
        </div>

        {/* Legend Skeleton */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-neutral-100 gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                <div className="h-3 w-12 bg-neutral-100 rounded-md" />
              </div>
            ))}
          </div>
          <div className="h-3 w-36 bg-neutral-100 rounded-md" />
        </div>
      </div>
    </div>
  );
};
