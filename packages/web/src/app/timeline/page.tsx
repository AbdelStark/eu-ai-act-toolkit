'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { getTimeline } from '@eu-ai-act/sdk';
import { Layout } from '@/components/shared/Layout';
import { Timeline } from '@/components/timeline/Timeline';

export default function TimelinePage() {
  const t = useTranslations('timeline');
  const events = useMemo(() => getTimeline(), []);

  const timelineProgress = useMemo(() => {
    const start = new Date('2024-08-01').getTime();
    const end = new Date('2027-08-02').getTime();
    const now = Date.now();
    return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
  }, []);

  const milestones = [
    { label: 'Entry into Force', date: 'Aug 2024', position: 0, icon: '⚖️' },
    { label: 'Prohibited AI', date: 'Feb 2025', position: 20, icon: '🚫' },
    { label: 'GPAI Rules', date: 'Aug 2025', position: 37, icon: '🤖' },
    { label: 'High-Risk', date: 'Aug 2026', position: 70, icon: '⚠️' },
    { label: 'Full Effect', date: 'Aug 2027', position: 100, icon: '✅' },
  ];

  // Stats
  const pastCount = events.filter(e => e.status === 'past').length;
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const futureCount = events.filter(e => e.status === 'future').length;
  const nextEvent = events.find(e => e.status === 'upcoming') ?? events.find(e => e.status === 'future');

  return (
    <Layout>
      {/* Hero section */}
      <section className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-eu-blue/8 blur-[100px]" />

        <div className="container-page relative pb-20 pt-16 sm:pb-24 sm:pt-20">
          <div className="max-w-2xl">
            <h1 className="font-display text-white" style={{ fontSize: 'clamp(2rem, 1.5rem + 2.5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              {t('title')}
            </h1>
            <div className="mt-3 h-[2px] w-16 bg-gradient-to-r from-eu-gold-400 to-eu-gold-200" />
            <p className="mt-4 text-base leading-relaxed text-slate-400 max-w-lg">{t('subtitle')}</p>
          </div>

          {/* Stats row */}
          <div className="mt-10 flex flex-wrap gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-white">{Math.round(timelineProgress)}%</span>
              <span className="text-sm text-slate-500">complete</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-green-400">{pastCount}</span>
              <span className="text-sm text-slate-500">in effect</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-amber-400">{upcomingCount}</span>
              <span className="text-sm text-slate-500">upcoming</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-slate-500">{futureCount}</span>
              <span className="text-sm text-slate-500">future</span>
            </div>
          </div>

          {/* Progress visualization */}
          <div className="mt-10">
            {/* Track */}
            <div className="relative">
              <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 via-eu-blue to-eu-blue-400 transition-all duration-1000"
                  style={{ width: `${timelineProgress}%` }}
                />
              </div>

              {/* Milestone dots */}
              {milestones.map((m) => {
                const isPast = m.position <= timelineProgress;
                const isCurrent = Math.abs(m.position - timelineProgress) < 8;
                return (
                  <div
                    key={m.label}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${m.position}%` }}
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                      isCurrent
                        ? 'h-5 w-5 border-eu-blue bg-white shadow-glow-blue'
                        : isPast
                          ? 'border-green-400 bg-green-400'
                          : 'border-white/20 bg-navy'
                    }`}>
                      {isPast && !isCurrent && (
                        <svg className="h-2 w-2 text-navy" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Labels below */}
            <div className="relative mt-6 hidden sm:block">
              {milestones.map((m) => {
                const isPast = m.position <= timelineProgress;
                return (
                  <div
                    key={m.label}
                    className="absolute -translate-x-1/2 text-center"
                    style={{ left: `${m.position}%` }}
                  >
                    <p className={`text-xs font-medium whitespace-nowrap ${isPast ? 'text-slate-300' : 'text-slate-500'}`}>
                      {m.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">{m.date}</p>
                  </div>
                );
              })}
            </div>

            {/* Mobile labels */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
              {milestones.map((m) => {
                const isPast = m.position <= timelineProgress;
                return (
                  <div key={m.label} className={`flex items-center gap-2 text-xs ${isPast ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isPast ? 'bg-green-400' : 'bg-slate-600'}`} />
                    {m.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next deadline callout */}
          {nextEvent && (
            <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">Next deadline</p>
                <p className="text-sm font-semibold text-white">
                  {nextEvent.title}
                  <span className="ml-2 text-amber-400">{nextEvent.daysUntil}d</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Timeline events */}
      <div className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <Timeline events={events} />
        </div>
      </div>
    </Layout>
  );
}
