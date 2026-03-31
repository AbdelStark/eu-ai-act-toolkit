'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { RiskBadge, type RiskTier } from '@/components/shared/RiskBadge';
import {
  classify,
  analyzeGaps,
  formatFineAmount,
  type RiskTier as SdkRiskTier,
  type StateFile,
  type ComplianceGap,
  type GapPriority,
} from '@eu-ai-act/sdk';
import { getState } from '@/lib/storage';
import { downloadFile } from '@/lib/export';

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

const TIER_LABELS: Record<SdkRiskTier, string> = {
  prohibited: 'Prohibited',
  'high-risk': 'High-Risk',
  gpai: 'General-Purpose AI (GPAI)',
  'gpai-systemic': 'GPAI with Systemic Risk',
  limited: 'Limited Risk',
  minimal: 'Minimal Risk',
};

const priorityColors: Record<GapPriority, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  low: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
};

const priorityLabels: Record<GapPriority, string> = {
  critical: 'Immediate (Week 1-2)',
  high: 'Short-term (Month 1-3)',
  medium: 'Medium-term (Month 3-6)',
  low: 'Ongoing / Best Practice',
};

interface PlanPhase {
  id: GapPriority;
  title: string;
  timeframe: string;
  description: string;
  gaps: ComplianceGap[];
}

function formatCategory(cat: string): string {
  return cat.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function buildPhases(gaps: ComplianceGap[]): PlanPhase[] {
  const phases: PlanPhase[] = [
    {
      id: 'critical',
      title: 'Phase 1: Immediate Actions',
      timeframe: 'Week 1-2',
      description: 'Address overdue or imminent compliance obligations. These items are past their enforcement deadline or due within 30 days.',
      gaps: gaps.filter((g) => g.priority === 'critical'),
    },
    {
      id: 'high',
      title: 'Phase 2: Short-term Priorities',
      timeframe: 'Month 1-3',
      description: 'Required obligations with enforcement deadlines within 180 days. Plan and begin implementation now.',
      gaps: gaps.filter((g) => g.priority === 'high'),
    },
    {
      id: 'medium',
      title: 'Phase 3: Medium-term Implementation',
      timeframe: 'Month 3-6',
      description: 'Required obligations with enforcement deadlines further out. Build systematic compliance processes.',
      gaps: gaps.filter((g) => g.priority === 'medium'),
    },
    {
      id: 'low',
      title: 'Phase 4: Best Practices & Continuous Improvement',
      timeframe: 'Ongoing',
      description: 'Optional items and best practices that strengthen your compliance posture beyond mandatory requirements.',
      gaps: gaps.filter((g) => g.priority === 'low'),
    },
  ];

  return phases.filter((p) => p.gaps.length > 0);
}

function generatePlanMarkdown(
  state: StateFile,
  phases: PlanPhase[],
  totalGaps: number,
  maxFine: number,
): string {
  const lines: string[] = [];
  const date = new Date().toISOString().split('T')[0];

  lines.push('# EU AI Act Compliance Action Plan');
  lines.push('');
  lines.push(`**System**: ${state.system.name}`);
  lines.push(`**Provider**: ${state.system.provider}`);
  lines.push(`**Risk Tier**: ${TIER_LABELS[state.classification.tier]}`);
  lines.push(`**Date**: ${date}`);
  lines.push(`**Outstanding Actions**: ${totalGaps}`);
  lines.push(`**Max Fine Exposure**: ${formatFineAmount(maxFine)}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const phase of phases) {
    lines.push(`## ${phase.title} (${phase.timeframe})`);
    lines.push('');
    lines.push(`> ${phase.description}`);
    lines.push('');

    // Group by category within phase
    const grouped = new Map<string, ComplianceGap[]>();
    for (const gap of phase.gaps) {
      const cat = gap.item.category;
      const existing = grouped.get(cat) ?? [];
      existing.push(gap);
      grouped.set(cat, existing);
    }

    for (const [category, catGaps] of grouped) {
      lines.push(`### ${formatCategory(category)}`);
      lines.push('');
      for (const gap of catGaps) {
        lines.push(`- [ ] **Art. ${gap.item.article}${gap.item.paragraph ? `(${gap.item.paragraph})` : ''}**: ${gap.item.text}`);
        if (gap.item.description) {
          lines.push(`  > ${gap.item.description}`);
        }
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('*Generated by EU AI Act Compliance Toolkit*');
  lines.push('');
  lines.push('*This action plan does not constitute legal advice. Consult qualified legal counsel for compliance decisions.*');

  return lines.join('\n');
}

export default function PlanPage() {
  const t = useTranslations('plan');
  const [state, setStateLocal] = useState<StateFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStateLocal(getState());
    setLoading(false);
  }, []);

  const tier = state?.classification.tier ?? null;

  const analysis = useMemo(() => {
    if (!tier || tier === 'prohibited' || tier === 'minimal') return null;
    try {
      const classification = classificationForTier(tier);
      return analyzeGaps({
        classification,
        progress: state?.checklist ?? {},
      });
    } catch {
      return null;
    }
  }, [tier, state]);

  const phases = useMemo(() => {
    if (!analysis) return [];
    return buildPhases(analysis.gaps);
  }, [analysis]);

  const handleExportPlan = useCallback(() => {
    if (!state || !phases.length || !analysis) return;
    const md = generatePlanMarkdown(state, phases, analysis.outstandingGaps, analysis.maxFineExposureEur);
    downloadFile(md, `action-plan-${tier}-${Date.now()}.md`, 'text/markdown');
  }, [state, phases, analysis, tier]);

  if (loading) {
    return (
      <Layout>
        <div className="container-page py-12">
          <div className="mx-auto max-w-4xl">
            <div className="skeleton-heading" />
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!state || !tier) {
    return (
      <Layout>
        <div className="container-page py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-navy">{t('empty.title')}</h1>
            <p className="mt-3 text-lg text-slate-500">{t('empty.description')}</p>
            <Link
              href="/classify"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-eu-blue px-6 py-3.5 text-base font-semibold text-white shadow-layered-sm transition-all hover:bg-eu-blue/90 hover:shadow-layered-lg"
            >
              {t('empty.cta')}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!analysis || phases.length === 0) {
    return (
      <Layout>
        <div className="container-page py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-navy">{t('complete.title')}</h1>
            <p className="mt-3 text-lg text-slate-500">{t('complete.description')}</p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-eu-blue px-6 py-3.5 text-base font-semibold text-white"
            >
              {t('complete.cta')}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy sm:text-4xl">{t('title')}</h1>
              <p className="mt-1 text-lg text-slate-500">{t('subtitle')}</p>
              <div className="mt-3 flex items-center gap-3">
                <RiskBadge tier={tier as RiskTier} />
                <span className="text-sm text-slate-500">
                  {state.system.name !== 'AI System' ? state.system.name : TIER_LABELS[tier]}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportPlan}
              className="inline-flex items-center gap-2 rounded-lg bg-eu-blue px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-eu-blue/90 hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {t('exportPlan')}
            </button>
          </div>

          {/* Summary bar */}
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-layered-sm">
              <p className="text-2xl font-bold text-navy">{analysis.outstandingGaps}</p>
              <p className="mt-0.5 text-xs text-slate-500">{t('summary.actions')}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-layered-sm">
              <p className="text-2xl font-bold text-red-600">{analysis.criticalGaps}</p>
              <p className="mt-0.5 text-xs text-slate-500">{t('summary.immediate')}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-layered-sm">
              <p className="text-2xl font-bold text-navy">{analysis.readinessPercent}%</p>
              <p className="mt-0.5 text-xs text-slate-500">{t('summary.readiness')}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-layered-sm">
              <p className="text-2xl font-bold text-navy">{formatFineAmount(analysis.maxFineExposureEur)}</p>
              <p className="mt-0.5 text-xs text-slate-500">{t('summary.exposure')}</p>
            </div>
          </div>

          {/* Phases */}
          <div className="mt-10 space-y-8">
            {phases.map((phase) => {
              const colors = priorityColors[phase.id];

              // Group gaps by category
              const grouped = new Map<string, ComplianceGap[]>();
              for (const gap of phase.gaps) {
                const cat = gap.item.category;
                const existing = grouped.get(cat) ?? [];
                existing.push(gap);
                grouped.set(cat, existing);
              }

              return (
                <div key={phase.id} className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className={`text-xl font-bold ${colors.text}`}>{phase.title}</h2>
                        <p className="mt-1 text-sm text-slate-600">{phase.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-3 py-1 text-sm font-bold ${colors.text} ${colors.bg} border ${colors.border}`}>
                          {phase.gaps.length} {phase.gaps.length === 1 ? 'action' : 'actions'}
                        </span>
                        <span className="text-xs text-slate-500">{phase.timeframe}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-white">
                    {Array.from(grouped.entries()).map(([category, catGaps]) => (
                      <div key={category} className="border-b border-slate-100 last:border-b-0">
                        <div className="bg-slate-50 px-6 py-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {formatCategory(category)}
                          </h3>
                        </div>
                        <ul className="divide-y divide-slate-50">
                          {catGaps.map((gap, i) => (
                            <li key={i} className="px-6 py-3">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white text-slate-400">
                                  <span className="text-[10px]">{i + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-navy">{gap.item.text}</p>
                                  {gap.item.description && (
                                    <p className="mt-0.5 text-xs text-slate-500">{gap.item.description}</p>
                                  )}
                                  <div className="mt-1.5 flex flex-wrap gap-2">
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                      Art. {gap.item.article}{gap.item.paragraph ? `(${gap.item.paragraph})` : ''}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{gap.urgencyLabel}</span>
                                    {gap.fineExposureEur > 0 && (
                                      <span className="text-[10px] font-medium text-red-600">
                                        {formatFineAmount(gap.fineExposureEur)} exposure
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-layered-sm">
              <h2 className="text-lg font-bold text-navy">{t('recommendations')}</h2>
              <ol className="mt-4 space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-eu-blue text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Disclaimer */}
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
