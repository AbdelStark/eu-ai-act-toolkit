'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { RiskBadge, type RiskTier } from '@/components/shared/RiskBadge';
import { ComplianceScore } from '@/components/checklist/ComplianceScore';
import {
  getChecklist,
  getTimeline,
  countProgress,
  analyzeGaps,
  calculatePenaltyExposure,
  formatFineAmount,
  classify,
  type RiskTier as SdkRiskTier,
  type ChecklistProgress,
  type StateFile,
} from '@eu-ai-act/sdk';
import { getState, clearState, exportState, importState } from '@/lib/storage';

/** Tier display labels. */
const TIER_LABELS: Record<SdkRiskTier, string> = {
  prohibited: 'Prohibited',
  'high-risk': 'High-Risk',
  gpai: 'General-Purpose AI (GPAI)',
  'gpai-systemic': 'GPAI with Systemic Risk',
  limited: 'Limited Risk',
  minimal: 'Minimal Risk',
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

const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [state, setStateLocal] = useState<StateFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStateLocal(getState());
    setLoading(false);
  }, []);

  const tier = state?.classification.tier ?? null;

  const checklist = useMemo(() => {
    if (!tier || tier === 'prohibited' || tier === 'minimal') return null;
    try {
      return getChecklist(tier);
    } catch {
      return null;
    }
  }, [tier]);

  const progress = useMemo(() => {
    return state?.checklist ?? {};
  }, [state]);

  const progressStats = useMemo(() => {
    if (!checklist) return null;
    return countProgress(checklist.items, progress);
  }, [checklist, progress]);

  const gapAnalysis = useMemo(() => {
    if (!tier || tier === 'prohibited' || tier === 'minimal') return null;
    try {
      const classification = classificationForTier(tier);
      return analyzeGaps({
        classification,
        progress,
      });
    } catch {
      return null;
    }
  }, [tier, progress]);

  const penaltyExposure = useMemo(() => {
    if (!tier) return null;
    try {
      return calculatePenaltyExposure({ tier });
    } catch {
      return null;
    }
  }, [tier]);

  const timelineEvents = useMemo(() => {
    return getTimeline();
  }, []);

  const nextDeadline = useMemo(() => {
    const upcoming = timelineEvents.find((e) => e.status === 'upcoming');
    return upcoming ?? timelineEvents.find((e) => e.status === 'future') ?? null;
  }, [timelineEvents]);

  const tierDeadline = useMemo(() => {
    if (!tier) return null;
    return timelineEvents.find(
      (e) => e.categories.includes(tier) && (e.status === 'upcoming' || e.status === 'future'),
    ) ?? null;
  }, [tier, timelineEvents]);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure? This will clear your saved classification and checklist progress.')) {
      clearState();
      setStateLocal(null);
    }
  }, []);

  const handleImport = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const imported = await importState(file);
        setStateLocal(imported);
      } catch {
        alert('Failed to import state file. Please check the file format.');
      }
    };
    input.click();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container-page py-12">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="skeleton-heading" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // No saved state — prompt user to classify first
  if (!state || !tier) {
    return (
      <Layout>
        <div className="container-page py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-eu-blue/10 text-eu-blue">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-navy">{t('empty.title')}</h1>
            <p className="mt-3 text-lg text-slate-500">{t('empty.description')}</p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/classify"
                className="inline-flex items-center gap-2 rounded-xl bg-eu-blue px-6 py-3.5 text-base font-semibold text-white shadow-layered-sm transition-all hover:bg-eu-blue/90 hover:shadow-layered-lg hover:-translate-y-0.5"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5" />
                </svg>
                {t('empty.cta')}
              </Link>
              <button
                type="button"
                onClick={handleImport}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 text-base font-semibold text-navy transition-all hover:bg-slate-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                {t('empty.import')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const hasChecklist = tier !== 'prohibited' && tier !== 'minimal';

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy sm:text-4xl">{t('title')}</h1>
              <p className="mt-1 text-lg text-slate-500">{t('subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportState}
                className="inline-flex items-center gap-1.5 rounded-lg bg-eu-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-eu-blue/90"
                title="Export state"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t('actions.export')}
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
                title="Import state"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                {t('actions.import')}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                title="Reset"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                {t('actions.reset')}
              </button>
            </div>
          </div>

          {/* System Info Card */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-layered-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <RiskBadge tier={tier as RiskTier} size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-navy">{TIER_LABELS[tier]}</h2>
                  {state.classification.subTier && (
                    <p className="text-sm text-slate-500">{state.classification.subTier}</p>
                  )}
                  <p className="mt-0.5 text-xs text-slate-400">
                    {t('classifiedOn')} {new Date(state.system.classifiedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-xs font-medium text-slate-500">{t('conformityAssessment')}</span>
                <span className="text-sm font-semibold text-navy">
                  {state.classification.conformityAssessment === 'self'
                    ? 'Self-assessment'
                    : state.classification.conformityAssessment === 'third-party'
                      ? 'Third-party assessment'
                      : 'None required'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Compliance Progress */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-layered-sm">
              <p className="text-xs font-medium text-slate-500">{t('metrics.compliance')}</p>
              {progressStats ? (
                <>
                  <p className="mt-2 text-3xl font-bold text-navy">{progressStats.percent}%</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {progressStats.completed}/{progressStats.total} {t('metrics.itemsComplete')}
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-eu-blue transition-all"
                      style={{ width: `${progressStats.percent}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-400">{t('metrics.noChecklist')}</p>
              )}
            </div>

            {/* Gap Analysis */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-layered-sm">
              <p className="text-xs font-medium text-slate-500">{t('metrics.gaps')}</p>
              {gapAnalysis ? (
                <>
                  <p className="mt-2 text-3xl font-bold text-red-600">{gapAnalysis.criticalGaps}</p>
                  <p className="mt-1 text-xs text-slate-400">{t('metrics.criticalGaps')}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {gapAnalysis.outstandingGaps} {t('metrics.totalOutstanding')}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-400">N/A</p>
              )}
            </div>

            {/* Penalty Exposure */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-layered-sm">
              <p className="text-xs font-medium text-slate-500">{t('metrics.maxFine')}</p>
              {penaltyExposure ? (
                <>
                  <p className="mt-2 text-3xl font-bold text-navy">
                    {formatFineAmount(penaltyExposure.maxExposureEur)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {penaltyExposure.penalties.length} {t('metrics.penaltyCategories')}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-400">N/A</p>
              )}
            </div>

            {/* Next Deadline */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-layered-sm">
              <p className="text-xs font-medium text-slate-500">{t('metrics.nextDeadline')}</p>
              {tierDeadline ? (
                <>
                  <p className="mt-2 text-3xl font-bold text-navy">
                    {tierDeadline.daysUntil > 0 ? tierDeadline.daysUntil : 0}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {tierDeadline.daysUntil > 0 ? t('metrics.daysRemaining') : t('metrics.overdue')}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{tierDeadline.date}</p>
                </>
              ) : nextDeadline ? (
                <>
                  <p className="mt-2 text-3xl font-bold text-navy">
                    {nextDeadline.daysUntil > 0 ? nextDeadline.daysUntil : 0}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {nextDeadline.daysUntil > 0 ? t('metrics.daysRemaining') : t('metrics.overdue')}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-400">N/A</p>
              )}
            </div>
          </div>

          {/* Two-column layout for details */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Category Breakdown */}
            {gapAnalysis && gapAnalysis.categorySummary.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-layered-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy">{t('categories.title')}</h3>
                  <Link href="/gaps" className="text-sm font-medium text-eu-blue hover:underline">
                    {t('categories.viewAll')}
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {gapAnalysis.categorySummary.map((cat) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-navy capitalize">
                            {cat.category.replace(/-/g, ' ')}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[cat.highestPriority] ?? ''}`}>
                              {cat.highestPriority}
                            </span>
                            <span className="text-xs text-slate-500">
                              {cat.completedItems}/{cat.totalItems}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              cat.completionPercent === 100
                                ? 'bg-green-500'
                                : cat.completionPercent > 50
                                  ? 'bg-eu-blue'
                                  : 'bg-orange-400'
                            }`}
                            style={{ width: `${cat.completionPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-layered-sm">
              <h3 className="text-lg font-bold text-navy">{t('quickActions.title')}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {hasChecklist && (
                  <Link
                    href={`/checklist/${tier}`}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-eu-blue/30 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-eu-blue/10 text-eu-blue">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">{t('quickActions.checklist')}</p>
                      <p className="text-xs text-slate-500">{t('quickActions.checklistDesc')}</p>
                    </div>
                  </Link>
                )}
                <Link
                  href="/templates"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-eu-blue/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-eu-blue/10 text-eu-blue">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{t('quickActions.templates')}</p>
                    <p className="text-xs text-slate-500">{t('quickActions.templatesDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/reports"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-eu-blue/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-eu-blue/10 text-eu-blue">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{t('quickActions.report')}</p>
                    <p className="text-xs text-slate-500">{t('quickActions.reportDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/gaps"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-eu-blue/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-eu-blue/10 text-eu-blue">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{t('quickActions.gaps')}</p>
                    <p className="text-xs text-slate-500">{t('quickActions.gapsDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/penalties"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-eu-blue/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-eu-blue/10 text-eu-blue">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{t('quickActions.penalties')}</p>
                    <p className="text-xs text-slate-500">{t('quickActions.penaltiesDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/classify"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-eu-blue/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{t('quickActions.reclassify')}</p>
                    <p className="text-xs text-slate-500">{t('quickActions.reclassifyDesc')}</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Upcoming Timeline Events */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-layered-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy">{t('timeline.title')}</h3>
                <Link href="/timeline" className="text-sm font-medium text-eu-blue hover:underline">
                  {t('timeline.viewAll')}
                </Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {timelineEvents
                  .filter((e) => e.status !== 'past')
                  .slice(0, 3)
                  .map((event, i) => (
                    <div
                      key={i}
                      className={`rounded-lg border p-4 ${
                        event.categories.includes(tier)
                          ? 'border-eu-blue/30 bg-eu-blue/5'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">{event.date}</span>
                        {event.status === 'upcoming' && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            SOON
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-navy">{event.title}</p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{event.description}</p>
                      {event.daysUntil > 0 && (
                        <p className="mt-2 text-xs font-medium text-eu-blue">
                          {event.daysUntil} {t('timeline.daysAway')}
                        </p>
                      )}
                      {event.categories.includes(tier) && (
                        <span className="mt-2 inline-block rounded-full bg-eu-blue/10 px-2 py-0.5 text-[10px] font-medium text-eu-blue">
                          {t('timeline.affectsYou')}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Recommendations */}
            {gapAnalysis && gapAnalysis.recommendations.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-layered-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-navy">{t('recommendations.title')}</h3>
                <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                  {gapAnalysis.recommendations.slice(0, 6).map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-eu-blue text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-xs leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Legal disclaimer */}
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-xs text-slate-400 italic">
              {t('disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
