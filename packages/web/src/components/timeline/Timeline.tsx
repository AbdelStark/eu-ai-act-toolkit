'use client';

import { useEffect, useRef, useState } from 'react';
import type { TimelineEvent as TimelineEventType } from '@eu-ai-act/sdk';
import { TimelineEvent } from './TimelineEvent';

interface TimelineProps {
  events: TimelineEventType[];
}

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isVisible;
}

function AnimatedEvent({ event, index, isTodayMarker }: { event: TimelineEventType; index: number; isTodayMarker: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInView(ref);

  return (
    <div ref={ref}>
      {/* Today marker */}
      {isTodayMarker && (
        <div className="relative mb-10 flex items-center justify-center">
          <div className="absolute left-4 right-4 h-px bg-eu-blue/20 sm:left-0 sm:right-0" />
          <div className="relative z-10 flex items-center gap-2 rounded-full bg-eu-blue px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg animate-pulse-ring">
            <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse" />
            Today
          </div>
        </div>
      )}

      <div
        className={`relative flex flex-col sm:flex-row ${
          index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
        } transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Dot on the line */}
        <div className={`absolute left-4 top-4 z-10 hidden h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-white shadow-md sm:left-1/2 sm:block ${
          event.status === 'past' ? 'bg-green-500' : event.status === 'upcoming' ? 'bg-amber-500' : 'bg-gray-300'
        }`} />

        {/* Spacer for alternating layout */}
        <div className="hidden sm:block sm:w-1/2" />

        {/* Event card */}
        <div className="ml-10 sm:ml-0 sm:w-1/2 sm:px-6">
          <TimelineEvent event={event} />
        </div>
      </div>
    </div>
  );
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
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-green-300 via-eu-blue/30 to-gray-200 sm:left-1/2 sm:-translate-x-px" />

      <div className="space-y-10">
        {events.map((event, index) => (
          <AnimatedEvent
            key={event.date + event.title}
            event={event}
            index={index}
            isTodayMarker={index === todayIndex}
          />
        ))}
      </div>
    </div>
  );
}
