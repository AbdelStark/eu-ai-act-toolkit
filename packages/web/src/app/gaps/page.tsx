'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Layout } from '@/components/shared/Layout';
import { RiskBadge, type RiskTier } from '@/components/shared/RiskBadge';
import {
  classify,
  getReadinessScore,
  analyzeGaps,
  formatFineAmount,
  RISK_TIERS,
  type RiskTier as SdkRiskTier,
  type GapPriority,
  type ComplianceGap,
  type CategoryGapSummary,
  type GapAnalysisResult,
} from '@eu-ai-act/sdk';

const priorityColors: Record<GapPriority, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
};

/** Build a minimal ClassificationResult for a given tier. */
function classificationForTier(tier: SdkRiskTier) {
  const inputs: Record<string, Record<string, unknown>> = {
    prohibited: { socialScoring: true },
    'high-risk': { annexIIISafetyComponent: true, annexIIICategory: 'employment' },
    gpai: { isGpai: true, gpaiSystemicRisk: false },
    'gpai-systemic': { isGpai: true, gpaiSystemicRisk: true },
    limited: { interactsWithHumans: true },
    minimal: {},
  };
  return classify(inputs[tier] as never);
}

export default function GapsPage() {
  const t = useTranslations('gaps');
  const [selectedTier, setSelectedTier] = useState<SdkRiskTier>('high-risk');
  const [revenue, setRevenue] = useState<string>('100000000');

  const analysis: GapAnalysisResult | null = useMemo(() => {
    try {
      const classification = classificationForTier(selectedTier);
      const rev = parseInt(revenue, 10);
      return analyzeGaps({
        classification,
        progress: {},
        annualTurnoverEur: isNaN(rev) || rev <= 0 ? undefined : rev,
      });
    } catch {
      return null;
    }
  }, [selectedTier, revenue]);

  const readiness = useMemo(() => {
    try {
      return getReadinessScore(selectedTier);
    } catch {
      return null;
    }
  }, [selectedTier]);

  if (!analysis) {
    return (
      <Layout>
        <div className="container-page py-12">
          <div className="empty-state">
            <p className="empty-state-title">No gap analysis available for this tier.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-lg text-slate-500">{t('subtitle')}</p>

          {/* Controls */}
          <div className="mt-8 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-navy">Risk Tier</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as SdkRiskTier)}
                className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
              >
                {RISK_TIERS.filter(t => t !== 'prohibited' && t !== 'minimal').map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy">Annual Turnover (EUR)</label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                min="0"
                className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
              />
            </div>
          </div>

          {/* Dashboard */}
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-layered-sm">
              <p className="text-3xl font-bold text-navy">{analysis.readinessPercent}%</p>
              <p className="mt-1 text-sm text-slate-500">Readiness</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-layered-sm">
              <p className="text-3xl font-bold text-red-600">{analysis.criticalGaps}</p>
              <p className="mt-1 text-sm text-slate-500">Critical Gaps</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-layered-sm">
              <p className="text-3xl font-bold text-orange-600">{analysis.outstandingGaps}</p>
              <p className="mt-1 text-sm text-slate-500">Outstanding</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-layered-sm">
              <p className="text-3xl font-bold text-navy">{formatFineAmount(analysis.maxFineExposureEur)}</p>
              <p className="mt-1 text-sm text-slate-500">Max Fine Exposure</p>
            </div>
          </div>

          {/* Assessment */}
          <div className="mt-6 rounded-xl border border-eu-blue/20 bg-eu-blue/5 p-5">
            <div className="flex items-center gap-3">
              <RiskBadge tier={selectedTier as RiskTier} />
              <p className="text-sm font-semibold text-navy">Compliance Assessment</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">{analysis.assessment}</p>
            <p className="mt-2 text-xs text-slate-500">
              Enforcement date: {analysis.enforcementDate} ({analysis.daysUntilDeadline > 0 ? `${analysis.daysUntilDeadline} days remaining` : 'overdue'})
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-navy">{t('categories.title')}</h2>
            <div className="mt-4 space-y-3">
              {analysis.categorySummary.map((cat: CategoryGapSummary) => (
                <div key={cat.category} className="rounded-xl border border-slate-200 bg-white p-4 shadow-layered-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-navy">{cat.category}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {cat.completedItems}/{cat.totalItems} completed
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColors[cat.highestPriority]}`}>
                        {cat.highestPriority}
                      </span>
                      <span className="text-sm font-bold text-navy">{cat.completionPercent}%</span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-eu-blue transition-all"
                      style={{ width: `${cat.completionPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-navy">{t('recommendations.title')}</h2>
              <ol className="mt-4 space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-layered-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-eu-blue text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Top gaps */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-navy">{t('topGaps.title')}</h2>
            <div className="mt-4 space-y-3">
              {analysis.gaps.slice(0, 10).map((gap: ComplianceGap, i: number) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-layered-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-navy">{gap.item.description}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {gap.item.article != null && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            Article {gap.item.article}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{gap.urgencyLabel}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColors[gap.priority]}`}>
                        {gap.priority}
                      </span>
                      {gap.fineExposureEur > 0 && (
                        <span className="text-xs text-red-600 font-medium">
                          {formatFineAmount(gap.fineExposureEur)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {analysis.gaps.length > 10 && (
              <p className="mt-4 text-center text-sm text-slate-500">
                Showing top 10 of {analysis.gaps.length} gaps.{' '}
                <Link href={`/checklist/${selectedTier}`} className="text-eu-blue hover:underline">
                  View full checklist
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
