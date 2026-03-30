'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { getTimeline } from '@eu-ai-act/sdk';
import { Layout } from '@/components/shared/Layout';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Timeline } from '@/components/timeline/Timeline';
import { CountdownBanner } from '@/components/timeline/CountdownBanner';

export default function TimelinePage() {
  const t = useTranslations('timeline');
  const events = useMemo(() => getTimeline(), []);
  const nextEvent =
    events.find((e) => e.status === 'upcoming') ??
    events.find((e) => e.status === 'future') ??
    null;

  return (
    <Layout>
      <Disclaimer />
      <CountdownBanner event={nextEvent} />
      <div className="container-page py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-navy">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
          <div className="mt-10">
            <Timeline events={events} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
