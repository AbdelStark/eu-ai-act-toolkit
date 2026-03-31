'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { CountdownBanner } from '@/components/timeline/CountdownBanner';
import { getTimeline } from '@eu-ai-act/sdk';

const features = [
  {
    href: '/classify',
    labelKey: 'classifier' as const,
    accent: 'from-eu-blue to-eu-blue-300',
    size: 'large' as const,
  },
  {
    href: '/checklist/high-risk',
    labelKey: 'checklists' as const,
    accent: 'from-emerald-500 to-teal-400',
    size: 'medium' as const,
  },
  {
    href: '/timeline',
    labelKey: 'timeline' as const,
    accent: 'from-amber-500 to-orange-400',
    size: 'medium' as const,
  },
  {
    href: '/templates',
    labelKey: 'templates' as const,
    accent: 'from-violet-500 to-purple-400',
    size: 'medium' as const,
  },
  {
    href: '/examples',
    labelKey: 'examples' as const,
    accent: 'from-rose-500 to-pink-400',
    size: 'medium' as const,
  },
  {
    href: '/penalties',
    labelKey: 'penalties' as const,
    accent: 'from-red-500 to-orange-400',
    size: 'small' as const,
  },
  {
    href: '/gaps',
    labelKey: 'gaps' as const,
    accent: 'from-cyan-500 to-blue-400',
    size: 'small' as const,
  },
  {
    href: '/standards',
    labelKey: 'standards' as const,
    accent: 'from-slate-500 to-slate-400',
    size: 'small' as const,
  },
  {
    href: '/reports',
    labelKey: 'reports' as const,
    accent: 'from-indigo-500 to-blue-400',
    size: 'small' as const,
  },
] as const;

const stats = [
  { value: '113', labelKey: 'articles' as const },
  { value: '45+', labelKey: 'checklists' as const },
  { value: '8', labelKey: 'templates' as const },
  { value: '10', labelKey: 'examples' as const },
];

export default function HomePage() {
  const t = useTranslations('landing');
  const tFeatures = useTranslations('landing.features');
  const tStats = useTranslations('landing.stats');
  const events = useMemo(() => getTimeline(), []);
  const nextEvent = useMemo(
    () => events.find((e) => e.status === 'upcoming') ?? events.find((e) => e.status === 'future') ?? null,
    [events],
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-eu-blue/8 blur-[120px]" />

        <div className="container-page relative">
          <div className="pb-16 pt-20 sm:pb-24 sm:pt-28 lg:pb-32 lg:pt-36">
            {/* Reg badge */}
            <div className="mb-8 animate-fade-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[13px] font-medium text-slate-300 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-eu-gold-400" />
                Regulation (EU) 2024/1689
              </span>
            </div>

            {/* Headline — left-aligned, editorial */}
            <div className="max-w-3xl">
              <h1 className="animate-fade-in-up font-display text-white" style={{ fontSize: 'clamp(2.25rem, 1.5rem + 3.5vw, 4.25rem)', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                {t('hero.title')}
              </h1>
              <div className="mt-2 h-[2px] w-16 bg-gradient-to-r from-eu-gold-400 to-eu-gold-200 animate-fade-in animation-delay-200" />
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400 animate-fade-in animation-delay-200">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in-up animation-delay-300">
              <Link
                href="/classify"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-navy shadow-soft-lg transition-all duration-200 hover:shadow-soft-xl hover:-translate-y-0.5"
              >
                {t('hero.ctaClassify')}
                <svg className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/timeline"
                className="inline-flex items-center rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-white hover:border-white/25"
              >
                {t('hero.ctaLearnMore')}
              </Link>
            </div>

            {/* Stats — inline, understated */}
            <div className="mt-16 flex flex-wrap items-center gap-8 border-t border-white/[0.06] pt-8 animate-fade-in animation-delay-400">
              {stats.map((stat) => (
                <div key={stat.labelKey} className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums text-white">{stat.value}</span>
                  <span className="text-sm text-slate-500">{tStats(stat.labelKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <CountdownBanner event={nextEvent} />

      {/* Features — bento grid */}
      <section className="py-24 sm:py-32">
        <div className="container-page">
          <div className="max-w-xl">
            <h2 className="font-display text-navy">
              {tFeatures('title')}
            </h2>
            <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-eu-gold-400 to-eu-gold-200" />
            <p className="mt-5 text-base leading-relaxed text-slate-500">
              Everything you need to navigate EU AI Act compliance — from initial classification through full documentation.
            </p>
          </div>

          {/* Bento layout: 2 rows with asymmetric sizing */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Primary feature — spans 2 cols on lg */}
            <Link
              href={features[0].href}
              className="group relative overflow-hidden rounded-2xl bg-navy p-8 sm:p-10 lg:col-span-2 lg:row-span-2 transition-all duration-300 hover:shadow-soft-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-eu-blue/20 via-transparent to-transparent" />
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-eu-blue/10 blur-[80px] transition-all duration-500 group-hover:bg-eu-blue/15" />
              <div className="relative">
                <span className="chip-blue mb-4 inline-flex text-white/80 border-white/10 bg-white/10">{tFeatures('classifier.title')}</span>
                <h3 className="mt-2 text-display-sm font-display text-white">
                  {t('hero.ctaClassify')}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                  {tFeatures('classifier.description')}
                </p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-eu-blue-300 transition-all duration-200 group-hover:gap-3">
                  Start classification
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Medium features */}
            {features.slice(1, 5).map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 transition-all duration-300 hover:border-slate-300 hover:shadow-soft-lg hover:-translate-y-0.5"
              >
                <div className={`absolute right-0 top-0 h-24 w-24 rounded-full bg-gradient-to-br ${feature.accent} opacity-[0.06] blur-[40px] transition-opacity duration-300 group-hover:opacity-[0.12]`} />
                <div className="relative">
                  <h3 className="text-base font-semibold text-navy group-hover:text-eu-blue transition-colors duration-150">
                    {tFeatures(`${feature.labelKey}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {tFeatures(`${feature.labelKey}.description`)}
                  </p>
                  <div className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-slate-400 transition-colors duration-150 group-hover:text-eu-blue">
                    Explore
                    <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}

            {/* Small features — bottom row */}
            {features.slice(5).map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white px-5 py-4 transition-all duration-200 hover:border-slate-300 hover:shadow-soft"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${feature.accent} opacity-80`}>
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-navy group-hover:text-eu-blue transition-colors">
                    {tFeatures(`${feature.labelKey}.title`)}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400 truncate">
                    {tFeatures(`${feature.labelKey}.description`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Open source callout */}
      <section className="border-t border-slate-200">
        <div className="container-page py-16 sm:py-20">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-navy">Open source & community-driven</h3>
              <p className="mt-1.5 text-sm text-slate-500 max-w-lg">
                Built in the open. Contribute, report issues, or use the SDK in your own compliance tools.
              </p>
            </div>
            <a
              href="https://github.com/AbdelStark/eu-ai-act-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-navy shadow-soft-sm transition-all duration-200 hover:shadow-soft hover:border-slate-300 hover:-translate-y-0.5 shrink-0"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
