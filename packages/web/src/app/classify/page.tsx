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
          <h1 className="text-3xl font-bold text-navy">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
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
          <p className="text-gray-500">Loading classifier...</p>
        </div>
      }
    >
      <ClassifyContent />
    </Suspense>
  );
}
