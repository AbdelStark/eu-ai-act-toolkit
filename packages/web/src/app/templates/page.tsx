'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { TemplateName } from '@eu-ai-act/sdk';
import { Layout } from '@/components/shared/Layout';
import { Disclaimer } from '@/components/shared/Disclaimer';
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
      <Disclaimer />
      <div className="container-page py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-navy">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>

          <div className="mt-10">
            {!selected ? (
              <TemplateSelector onSelect={setSelected} />
            ) : (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setGeneratedContent('');
                  }}
                  className="text-sm font-medium text-eu-blue transition-colors hover:text-eu-blue/80 focus:outline-none focus:underline"
                >
                  &larr; Back to templates
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
