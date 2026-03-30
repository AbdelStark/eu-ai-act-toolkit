'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { ClassifierWizard } from '@/components/classifier/ClassifierWizard';
import { decodeClassificationInput } from '@/lib/url-state';

function ClassifyContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('classifier');
  const encoded = searchParams.get('q');
  const initialInput = encoded ? decodeClassificationInput(encoded) : null;

  return (
    <Layout>
      <Disclaimer />
      <div className="container-page py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-eu-blue/5 px-3 py-1 text-xs font-medium text-eu-blue">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082" />
            </svg>
            Interactive Wizard
          </div>
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-lg text-slate-500">{t('subtitle')}</p>
          <div className="mt-8">
            <ClassifierWizard initialInput={initialInput} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ClassifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading classifier...
          </div>
        </div>
      }
    >
      <ClassifyContent />
    </Suspense>
  );
}
