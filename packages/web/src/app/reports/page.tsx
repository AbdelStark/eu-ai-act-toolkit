'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { RiskBadge, type RiskTier } from '@/components/shared/RiskBadge';
import {
  getChecklist,
  generateReport,
  RISK_TIERS,
  type RiskTier as SdkRiskTier,
  type OrganizationType,
} from '@eu-ai-act/sdk';
import { classificationForTier } from '@/lib/classification-helpers';

const orgTypes: { value: OrganizationType; label: string }[] = [
  { value: 'large', label: 'Large enterprise' },
  { value: 'sme', label: 'SME' },
  { value: 'startup', label: 'Startup' },
  { value: 'eu-institution', label: 'EU institution' },
];

export default function ReportsPage() {
  const t = useTranslations('reports');
  const [tier, setTier] = useState<SdkRiskTier>('high-risk');
  const [systemName, setSystemName] = useState('');
  const [provider, setProvider] = useState('');
  const [purpose, setPurpose] = useState('');
  const [orgType, setOrgType] = useState<OrganizationType>('large');
  const [revenue, setRevenue] = useState<string>('');
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(() => {
    if (!systemName.trim() || !provider.trim() || !purpose.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const classification = classificationForTier(tier);
      const checklist = getChecklist(tier);
      const rev = parseInt(revenue, 10);

      const result = generateReport(classification, checklist, {
        systemName: systemName.trim(),
        provider: provider.trim(),
        intendedPurpose: purpose.trim(),
        organizationType: orgType,
        annualTurnoverEur: isNaN(rev) || rev <= 0 ? undefined : rev,
        includeArticleAppendix: true,
        includePenalties: true,
        includeGapAnalysis: true,
      });

      setReport(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      setReport(null);
    }
  }, [tier, systemName, provider, purpose, orgType, revenue]);

  const handleDownload = useCallback(() => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eu-ai-act-report-${tier}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [report, tier]);

  const handleCopy = useCallback(() => {
    if (!report) return;
    navigator.clipboard.writeText(report);
  }, [report]);

  return (
    <Layout>
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="page-header pb-8 pt-0">
            <h1>{t('title')}</h1>
            <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-eu-gold-400 to-eu-gold-200" />
          </div>
          <p className="mt-2 text-lg text-slate-500">{t('subtitle')}</p>

          {/* Form */}
          <div className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-navy">{t('form.title')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('form.description')}</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-navy">AI System Name *</label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="e.g., Hiring Screener v2"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy">Provider / Organization *</label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy">Risk Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as SdkRiskTier)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                >
                  {RISK_TIERS.map((tier) => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-navy">Intended Purpose *</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Describe the intended purpose of your AI system..."
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy">Organization Type</label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                >
                  {orgTypes.map((org) => (
                    <option key={org.value} value={org.value}>{org.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy">Annual Turnover (EUR)</label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="100000000"
                  min="0"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 rounded-xl bg-eu-blue px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-150 hover:bg-eu-blue/90 hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>

          {/* Report Output */}
          {report && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy">Generated Report</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-eu-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-eu-blue/90 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download Markdown
                  </button>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white shadow-soft overflow-hidden">
                <pre className="max-h-[600px] overflow-auto p-6 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {report}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
