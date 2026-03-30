'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { TemplateName } from '@eu-ai-act/sdk';
import { Layout } from '@/components/shared/Layout';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { ExportButton } from '@/components/templates/ExportButton';

export default function TemplatesPage() {
  const t = useTranslations('templates');
  const [selected, setSelected] = useState<TemplateName | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleContentChange = useCallback((content: string) => {
    setGeneratedContent(content);
  }, []);

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-eu-blue/5 px-3 py-1 text-xs font-medium text-eu-blue">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            6 Templates Available
          </div>
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-lg text-slate-500">{t('subtitle')}</p>

          <div className="mt-10">
            {!selected ? (
              <TemplateSelector onSelect={setSelected} />
            ) : (
              <div className="space-y-6 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setGeneratedContent('');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-eu-blue transition-colors hover:text-eu-blue/80 hover:bg-eu-blue/5 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 min-h-[44px]"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Back to templates
                </button>

                <TemplateEditor
                  templateName={selected}
                  onContentChange={handleContentChange}
                />

                {generatedContent && (
                  <div className="flex gap-3">
                    <ExportButton
                      content={generatedContent}
                      filename={`${selected}.md`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
