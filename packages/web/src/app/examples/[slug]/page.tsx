'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { WorkedExample, ClassificationInput } from '@eu-ai-act/sdk';
import { Layout } from '@/components/shared/Layout';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { encodeClassificationInput } from '@/lib/url-state';

import examplesData from '../../../../../../data/examples.json';

interface ExamplesFile {
  examples: WorkedExample[];
}

export default function ExamplePage() {
  const params = useParams();
  const t = useTranslations('examples');
  const slug = params.slug as string;

  const example = useMemo(() => {
    const data = examplesData as ExamplesFile;
    return data.examples.find((e) => e.slug === slug) ?? null;
  }, [slug]);

  const classifyUrl = useMemo(() => {
    if (!example) return '';
    const encoded = encodeClassificationInput(example.classificationInput);
    return `/classify?q=${encoded}`;
  }, [example]);

  if (!example) {
    return (
      <Layout>
        <div className="container-page py-12">
          <p className="text-gray-600">Example not found.</p>
          <Link
            href="/examples"
            className="mt-4 inline-block text-sm font-medium text-eu-blue hover:underline"
          >
            {t('backToList')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/examples"
            className="text-sm font-medium text-eu-blue transition-colors hover:text-eu-blue/80 focus:outline-none focus:underline"
          >
            &larr; {t('backToList')}
          </Link>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-navy">
                {example.title}
              </h1>
              <RiskBadge tier={example.expectedTier} size="lg" />
            </div>
            <p className="mt-3 text-gray-600">{example.description}</p>
          </div>

          {/* Walkthrough */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-navy">
              {t('walkthrough')}
            </h2>
            <ol className="mt-4 space-y-4">
              {example.walkthrough.map((step, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700"
                >
                  {step}
                </li>
              ))}
            </ol>
          </section>

          {/* CTA */}
          <div className="mt-8 flex gap-3">
            <Link
              href={classifyUrl}
              className="inline-flex items-center rounded-lg bg-eu-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-eu-blue/90 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 min-h-[44px]"
            >
              Classify like this
            </Link>
            {example.expectedTier !== 'prohibited' &&
              example.expectedTier !== 'minimal' && (
                <Link
                  href={`/checklist/${example.expectedTier}`}
                  className="inline-flex items-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 min-h-[44px]"
                >
                  View Checklist
                </Link>
              )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
