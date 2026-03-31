'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
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
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isVisible;
}

function AnimatedEvent({ event, index, eventIndex }: { event: TimelineEventType; index: number; eventIndex: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInView(ref);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out-expo ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      <TimelineEvent event={event} eventIndex={eventIndex} />
    </div>
  );
}

export function Timeline({ events }: TimelineProps) {
  const t = useTranslations('timeline');

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
        <p className="empty-state-title">No timeline events</p>
      </div>
    );
  }

  const todayIndex = events.findIndex((e) => e.status !== 'past');

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px sm:left-8" style={{
        background: 'linear-gradient(to bottom, #22c55e 0%, #22c55e var(--past-pct), #e2e4ec var(--past-pct), #e2e4ec 100%)',
        // @ts-ignore
        '--past-pct': `${todayIndex >= 0 ? (todayIndex / events.length) * 100 : 100}%`,
      } as React.CSSProperties} />

      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={event.date + event.title}>
            {/* Today marker */}
            {index === todayIndex && (
              <div className="relative flex items-center py-6 pl-0 sm:pl-3">
                <div className="absolute left-[15px] z-10 flex h-[9px] w-[9px] items-center justify-center rounded-full bg-eu-blue ring-4 ring-eu-blue/20 sm:left-[28px]" />
                <div className="ml-12 flex items-center gap-2 sm:ml-16">
                  <span className="text-xs font-bold uppercase tracking-widest text-eu-blue">
                    {t('today')}
                  </span>
                  <div className="h-px flex-1 bg-eu-blue/10" />
                </div>
              </div>
            )}

            <AnimatedEvent
              event={event}
              index={index}
              eventIndex={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
