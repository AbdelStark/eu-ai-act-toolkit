'use client';

import type { TemplateName } from '@eu-ai-act/sdk';

interface TemplateSelectorProps {
  onSelect: (templateName: TemplateName) => void;
}

const TEMPLATES: {
  name: TemplateName;
  title: string;
  description: string;
  icon: string;
  preview: string;
  badge: string;
}[] = [
  {
    name: 'technical-documentation',
    title: 'Technical Documentation',
    description: 'Comprehensive technical documentation required under Annex IV for high-risk AI systems.',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
    preview: '# Technical Documentation\n## 1. System Description\n## 2. Design Specifications\n## 3. Development Process',
    badge: 'Annex IV',
  },
  {
    name: 'risk-management-system',
    title: 'Risk Management System',
    description: 'Risk management plan per Article 9 covering identification, evaluation, and mitigation.',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z',
    preview: '# Risk Management Plan\n## 1. Risk Identification\n## 2. Risk Analysis\n## 3. Mitigation Measures',
    badge: 'Art. 9',
  },
  {
    name: 'data-governance',
    title: 'Data Governance Plan',
    description: 'Data quality, bias assessment, and governance practices per Article 10.',
    icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375',
    preview: '# Data Governance Plan\n## 1. Data Sources\n## 2. Quality Metrics\n## 3. Bias Assessment',
    badge: 'Art. 10',
  },
  {
    name: 'human-oversight-plan',
    title: 'Human Oversight Plan',
    description: 'Human oversight measures and intervention capabilities per Article 14.',
    icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    preview: '# Human Oversight Plan\n## 1. Oversight Roles\n## 2. Monitoring Procedures\n## 3. Intervention Protocol',
    badge: 'Art. 14',
  },
  {
    name: 'monitoring-plan',
    title: 'Post-Market Monitoring Plan',
    description: 'Post-market monitoring and incident reporting per Articles 72-73.',
    icon: 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5',
    preview: '# Post-Market Monitoring\n## 1. Data Collection\n## 2. Performance Tracking\n## 3. Incident Response',
    badge: 'Art. 72-73',
  },
  {
    name: 'declaration-of-conformity',
    title: 'Declaration of Conformity',
    description: 'EU Declaration of Conformity per Article 47 and Annex V.',
    icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
    preview: '# EU Declaration of Conformity\n## Provider Information\n## AI System Identification\n## Conformity Assessment',
    badge: 'Art. 47',
  },
];

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATES.map((template) => (
        <button
          key={template.name}
          type="button"
          onClick={() => onSelect(template.name)}
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-all duration-300 hover:border-eu-blue/30 hover:shadow-xl hover:shadow-eu-blue/5 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
        >
          {/* Preview snippet */}
          <div className="border-b border-gray-100 bg-slate-50/80 px-5 pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-red-300" />
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span className="h-2 w-2 rounded-full bg-green-300" />
              </div>
              <span className="text-xs text-slate-400 font-mono truncate">{template.name}.md</span>
            </div>
            <pre className="text-xs text-slate-400 font-mono leading-relaxed overflow-hidden whitespace-pre-wrap" style={{ maxHeight: '4.5rem' }}>
              {template.preview}
            </pre>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <svg
                className="h-7 w-7 flex-shrink-0 text-eu-blue"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={template.icon}
                />
              </svg>
              <span className="rounded-full bg-eu-blue/5 px-2 py-0.5 text-xs font-medium text-eu-blue">
                {template.badge}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-navy group-hover:text-eu-blue transition-colors">
              {template.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              {template.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
