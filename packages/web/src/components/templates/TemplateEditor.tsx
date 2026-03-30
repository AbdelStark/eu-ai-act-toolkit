'use client';

import { useState, useEffect } from 'react';
import type { TemplateName, TemplateInput } from '@eu-ai-act/sdk';
import { generateTemplate } from '@eu-ai-act/sdk';

interface TemplateEditorProps {
  templateName: TemplateName;
  onContentChange?: (content: string) => void;
}

const TEMPLATE_TITLES: Record<TemplateName, string> = {
  'technical-documentation': 'Technical Documentation',
  'risk-management-system': 'Risk Management System',
  'data-governance': 'Data Governance Plan',
  'human-oversight-plan': 'Human Oversight Plan',
  'monitoring-plan': 'Post-Market Monitoring Plan',
  'declaration-of-conformity': 'Declaration of Conformity',
};

export function TemplateEditor({
  templateName,
  onContentChange,
}: TemplateEditorProps) {
  const [systemName, setSystemName] = useState('');
  const [provider, setProvider] = useState('');
  const [intendedPurpose, setIntendedPurpose] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!systemName || !provider || !intendedPurpose) {
      setPreview('');
      onContentChange?.('');
      return;
    }
    try {
      const input: TemplateInput = {
        systemName,
        provider,
        intendedPurpose,
        version: version || undefined,
      };
      const content = generateTemplate(templateName, input);
      setPreview(content);
      onContentChange?.(content);
    } catch {
      setPreview('');
      onContentChange?.('');
    }
  }, [templateName, systemName, provider, intendedPurpose, version, onContentChange]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-navy">
        {TEMPLATE_TITLES[templateName]}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="systemName" className="block text-sm font-medium text-navy">
            AI System Name *
          </label>
          <input
            id="systemName"
            type="text"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="e.g. Hiring Screener v2"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
          />
        </div>
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-navy">
            Provider / Organization *
          </label>
          <input
            id="provider"
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="purpose" className="block text-sm font-medium text-navy">
            Intended Purpose *
          </label>
          <textarea
            id="purpose"
            rows={2}
            value={intendedPurpose}
            onChange={(e) => setIntendedPurpose(e.target.value)}
            placeholder="Describe the system's intended purpose..."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
          />
        </div>
        <div>
          <label htmlFor="version" className="block text-sm font-medium text-navy">
            Version
          </label>
          <input
            id="version"
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
          />
        </div>
      </div>

      {/* Live Preview */}
      {preview ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-navy">Preview</h3>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
              {preview}
            </pre>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          Fill in all required fields (*) to see a live preview.
        </p>
      )}
    </div>
  );
}
