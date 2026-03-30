'use client';

import type { TimelineEvent as TimelineEventType } from '@eu-ai-act/sdk';
import { TimelineEvent } from './TimelineEvent';

interface TimelineProps {
  events: TimelineEventType[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No timeline events to display.
      </p>
    );
  }

  // Find the index of the "today" marker (first non-past event)
  const todayIndex = events.findIndex((e) => e.status !== 'past');

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 sm:left-1/2 sm:-translate-x-px" />

      <div className="space-y-8">
        {events.map((event, index) => (
          <div key={event.date + event.title}>
            {/* Today marker */}
            {index === todayIndex && (
              <div className="relative mb-8 flex items-center justify-center">
                <div className="z-10 rounded-full bg-eu-blue px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  Today
                </div>
              </div>
            )}

            <div
              className={`relative flex flex-col sm:flex-row ${
                index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
              }`}
            >
              {/* Dot on the line */}
              <div className="absolute left-4 top-4 z-10 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-eu-blue shadow sm:left-1/2 sm:block" />

              {/* Spacer for alternating layout */}
              <div className="hidden sm:block sm:w-1/2" />

              {/* Event card */}
              <div className="ml-10 sm:ml-0 sm:w-1/2 sm:px-6">
                <TimelineEvent event={event} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
