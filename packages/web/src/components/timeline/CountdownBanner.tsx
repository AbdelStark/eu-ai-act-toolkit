'use client';

import type { TimelineEvent } from '@eu-ai-act/sdk';

interface CountdownBannerProps {
  event: TimelineEvent | null;
}

export function CountdownBanner({ event }: CountdownBannerProps) {
  if (!event || event.daysUntil <= 0) return null;

  return (
    <div className="border-b border-slate-200/80 bg-slate-50/80">
      <div className="container-page flex items-center justify-between gap-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-eu-blue/10">
            <svg className="h-3.5 w-3.5 text-eu-blue" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </span>
          <p className="text-[13px] text-slate-600">
            <span className="font-semibold text-navy">{event.title}</span>
            <span className="mx-1.5 text-slate-300">/</span>
            <span className="font-medium text-eu-blue">{event.daysUntil} days</span>
          </p>
        </div>
        <time dateTime={event.date} className="hidden text-xs text-slate-400 sm:block">
          {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </time>
      </div>
    </div>
  );
}
