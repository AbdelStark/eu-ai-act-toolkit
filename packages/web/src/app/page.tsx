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
] as const;

export default function HomePage() {
  const t = useTranslations('landing');
  const tFeatures = useTranslations('landing.features');
  const events = getTimeline();
  const nextEvent = events.find((e) => e.status === 'upcoming') ?? events.find((e) => e.status === 'future') ?? null;

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-4 text-lg text-white/70 sm:text-xl">
              {t('hero.subtitle')}
            </p>
            <p className="mt-4 text-base text-white/60">
              {t('hero.description')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/classify"
                className="inline-flex items-center rounded-lg bg-eu-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-eu-blue/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-navy"
              >
                {t('hero.ctaClassify')}
              </Link>
              <Link
                href="/timeline"
                className="inline-flex items-center rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-navy"
              >
                {t('hero.ctaLearnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Banner */}
      <CountdownBanner event={nextEvent} />

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="container-page">
          <h2 className="text-center text-2xl font-bold text-navy sm:text-3xl">
            {tFeatures('title')}
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group rounded-xl border border-gray-200 p-6 transition-all hover:border-eu-blue/30 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
              >
                <div className="text-eu-blue">{feature.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-navy group-hover:text-eu-blue">
                  {tFeatures(`${feature.labelKey}.title`)}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {tFeatures(`${feature.labelKey}.description`)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
