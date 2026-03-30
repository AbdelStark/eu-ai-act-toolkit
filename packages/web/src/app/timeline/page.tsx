'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { getTimeline } from '@eu-ai-act/sdk';
import { Layout } from '@/components/shared/Layout';
import { Timeline } from '@/components/timeline/Timeline';
import { CountdownBanner } from '@/components/timeline/CountdownBanner';

export default function TimelinePage() {
  const t = useTranslations('timeline');
  const events = useMemo(() => getTimeline(), []);
  const nextEvent =
    events.find((e) => e.status === 'upcoming') ??
    events.find((e) => e.status === 'future') ??
    null;

  // Calculate progress through the overall timeline (2024-2027)
  const timelineProgress = useMemo(() => {
    const start = new Date('2024-08-01').getTime();
    const end = new Date('2027-08-02').getTime();
    const now = Date.now();
    const progress = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
    return Math.round(progress);
  }, []);

  const milestones = [
    { label: 'Entry into Force', year: '2024', position: 0 },
    { label: 'Prohibited AI', year: '2025', position: 25 },
    { label: 'GPAI', year: '2025', position: 40 },
    { label: 'High-Risk', year: '2026', position: 65 },
    { label: 'Full Effect', year: '2027', position: 100 },
  ];

  return (
    <Layout>
      <CountdownBanner event={nextEvent} />

      <div className="container-page py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-lg text-slate-500">{t('subtitle')}</p>

          {/* Horizontal progress bar */}
          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-layered-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy">Implementation Progress</h3>
              <span className="text-sm font-bold text-eu-blue">{timelineProgress}%</span>
            </div>
            <div className="relative">
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-eu-blue to-eu-blue-400 transition-all duration-700"
                  style={{ width: `${timelineProgress}%` }}
                />
              </div>
              {/* Milestone markers */}
              <div className="relative mt-3 hidden sm:block">
                {milestones.map((m) => (
                  <div
                    key={m.label}
                    className="absolute -translate-x-1/2 text-center"
                    style={{ left: `${m.position}%` }}
                  >
                    <div className={`mx-auto mb-1 h-2 w-0.5 ${m.position <= timelineProgress ? 'bg-eu-blue' : 'bg-gray-300'}`} />
                    <p className="text-xs font-medium text-slate-600 whitespace-nowrap">{m.label}</p>
                    <p className="text-xs text-slate-400">{m.year}</p>
                  </div>
                ))}
              </div>
              {/* Mobile milestone list */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 sm:hidden">
                {milestones.map((m) => (
                  <span key={m.label} className={`text-xs ${m.position <= timelineProgress ? 'text-eu-blue font-medium' : 'text-slate-400'}`}>
                    {m.label} ({m.year})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14">
            <Timeline events={events} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
