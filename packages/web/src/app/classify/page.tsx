'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { ClassifierWizard } from '@/components/classifier/ClassifierWizard';
import { decodeClassificationInput } from '@/lib/url-state';

function ClassifyContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('classifier');
  const encoded = searchParams.get('q');
  const initialInput = encoded ? decodeClassificationInput(encoded) : null;

  return (
    <Layout>
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="page-header pb-8 pt-0">
            <span className="chip-blue mb-3 inline-flex">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082" />
              </svg>
              Interactive Wizard
            </span>
            <h1>{t('title')}</h1>
            <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-eu-gold-400 to-eu-gold-200" />
            <p>{t('subtitle')}</p>
          </div>
          <ClassifierWizard initialInput={initialInput} />
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
          <div className="flex items-center gap-3 text-slate-400">
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
