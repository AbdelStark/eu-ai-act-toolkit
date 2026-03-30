'use client';

import type { TimelineEvent } from '@eu-ai-act/sdk';

interface CountdownBannerProps {
  event: TimelineEvent | null;
}

export function CountdownBanner({ event }: CountdownBannerProps) {
  if (!event || event.daysUntil <= 0) return null;

  return (
    <div className="border-b border-eu-blue/10 bg-eu-blue/5">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-eu-blue"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <p className="text-sm font-medium text-navy">
            <span className="font-bold">{event.title}</span>
            {' '}/{' '}
            <span className="text-eu-blue">
              {event.daysUntil} days remaining
            </span>
          </p>
        </div>
        <time
          dateTime={event.date}
          className="hidden flex-shrink-0 text-sm text-gray-500 sm:block"
        >
          {new Date(event.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </div>
    </div>
  );
}
