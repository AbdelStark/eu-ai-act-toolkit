'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { CountdownBanner } from '@/components/timeline/CountdownBanner';
import { getTimeline } from '@eu-ai-act/sdk';

const features = [
  {
    href: '/classify',
    labelKey: 'classifier' as const,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.591.659H9.061a2.25 2.25 0 0 1-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 0 1-2.25 2.25H7.25A2.25 2.25 0 0 1 5 17v-2.5" />
      </svg>
    ),
  },
  {
    href: '/checklist/high-risk',
    labelKey: 'checklists' as const,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    href: '/timeline',
    labelKey: 'timeline' as const,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    href: '/templates',
    labelKey: 'templates' as const,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    href: '/examples/social-scoring',
    labelKey: 'examples' as const,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
] as const;

const stats = [
  { value: '113', labelKey: 'articles' as const },
  { value: '45+', labelKey: 'checklists' as const },
  { value: '6', labelKey: 'templates' as const },
  { value: '5', labelKey: 'examples' as const },
];

export default function HomePage() {
  const t = useTranslations('landing');
  const tFeatures = useTranslations('landing.features');
  const tStats = useTranslations('landing.stats');
  const events = getTimeline();
  const nextEvent = events.find((e) => e.status === 'upcoming') ?? events.find((e) => e.status === 'future') ?? null;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-800 to-eu-blue-800 opacity-90" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #f0f1f5 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="container-page relative py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm" style={{ color: '#d9dce4' }}>
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Regulation (EU) 2024/1689
            </div>
            <h1 className="font-bold tracking-tight" style={{ color: '#f0f1f5' }}>
              {t('hero.title')}
            </h1>
            <p className="mt-5 text-lg sm:text-xl" style={{ color: '#b3b8c9' }}>
              {t('hero.subtitle')}
            </p>
            <p className="mt-4 text-base leading-relaxed" style={{ color: '#8d94ae' }}>
              {t('hero.description')}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/classify"
                className="group inline-flex items-center gap-2 rounded-xl bg-eu-blue px-7 py-3.5 text-base font-semibold shadow-layered-lg transition-all duration-150 hover:bg-eu-blue/90 hover:shadow-layered-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-eu-blue-200 focus:ring-offset-2 focus:ring-offset-navy"
                style={{ color: '#f0f1f5' }}
              >
                {t('hero.ctaClassify')}
                <svg className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/timeline"
                className="inline-flex items-center rounded-xl border border-white/30 px-7 py-3.5 text-base font-semibold transition-all duration-150 hover:bg-white/10 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-eu-blue-200 focus:ring-offset-2 focus:ring-offset-navy"
                style={{ color: '#f0f1f5' }}
              >
                {t('hero.ctaLearnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <p className="text-3xl font-bold tabular-nums text-navy">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{tStats(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown Banner */}
      <CountdownBanner event={nextEvent} />

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-bold text-navy">
              {tFeatures('title')}
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Everything you need to navigate EU AI Act compliance
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Link
                key={feature.href}
                href={feature.href}
                className={`group relative rounded-xl border border-slate-200 bg-slate-50 p-8 shadow-layered-sm transition-all duration-300 hover:border-eu-blue/30 hover:shadow-layered-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 ${
                  index >= 3 ? 'sm:col-span-1 lg:col-span-1' : ''
                }`}
              >
                <div className="inline-flex rounded-xl bg-eu-blue/5 p-3 text-eu-blue transition-colors duration-150 group-hover:bg-eu-blue/10">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-navy group-hover:text-eu-blue transition-colors duration-150">
                  {tFeatures(`${feature.labelKey}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {tFeatures(`${feature.labelKey}.description`)}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-eu-blue opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  Explore
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
