'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { RiskBadge } from '@/components/shared/RiskBadge';
import type { WorkedExample } from '@eu-ai-act/sdk';

import examplesData from '../../../../../data/examples.json';

interface ExamplesFile {
  examples: WorkedExample[];
}

export default function ExamplesIndexPage() {
  const t = useTranslations('examples');
  const examples = useMemo(() => (examplesData as ExamplesFile).examples, []);

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-lg text-slate-500">{t('subtitle')}</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {examples.map((example) => (
              <Link
                key={example.slug}
                href={`/examples/${example.slug}`}
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-layered-sm transition-all duration-300 hover:border-eu-blue/30 hover:shadow-layered-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-navy group-hover:text-eu-blue transition-colors duration-150">
                    {example.title}
                  </h3>
                  <RiskBadge tier={example.expectedTier} size="sm" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-3">
                  {example.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-eu-blue opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  View walkthrough
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
