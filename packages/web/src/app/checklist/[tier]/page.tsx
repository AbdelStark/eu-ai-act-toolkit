'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { RiskTier, ChecklistProgress, Checklist } from '@eu-ai-act/sdk';
import { getChecklist, RISK_TIERS } from '@eu-ai-act/sdk';
import { Layout } from '@/components/shared/Layout';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { ChecklistView } from '@/components/checklist/ChecklistView';
import { exportState, importState, getState, setState } from '@/lib/storage';

const PROGRESS_KEY_PREFIX = 'eu-ai-act-checklist-';

function getProgressKey(tier: string): string {
  return `${PROGRESS_KEY_PREFIX}${tier}`;
}

function loadProgress(tier: string): Record<string, ChecklistProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(getProgressKey(tier));
    return raw ? (JSON.parse(raw) as Record<string, ChecklistProgress>) : {};
  } catch {
    return {};
  }
}

function saveProgress(tier: string, progress: Record<string, ChecklistProgress>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getProgressKey(tier), JSON.stringify(progress));
}

const AVAILABLE_TIERS: { value: string; label: string }[] = [
  { value: 'high-risk', label: 'High-Risk' },
  { value: 'gpai', label: 'GPAI' },
  { value: 'gpai-systemic', label: 'GPAI Systemic' },
  { value: 'limited', label: 'Limited Risk' },
];

export default function ChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('checklists');
  const tier = params.tier as string;

  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [progress, setProgress] = useState<Record<string, ChecklistProgress>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!RISK_TIERS.includes(tier as RiskTier)) {
      setError(`Invalid risk tier: "${tier}"`);
      return;
    }
    try {
      const cl = getChecklist(tier as RiskTier);
      setChecklist(cl);
      setProgress(loadProgress(tier));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load checklist');
    }
  }, [tier]);

  const handleProgressChange = useCallback(
    (updated: Record<string, ChecklistProgress>) => {
      setProgress(updated);
      saveProgress(tier, updated);
    },
    [tier],
  );

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const state = await importState(file);
        if (state.checklist) {
          setProgress(state.checklist);
          saveProgress(tier, state.checklist);
        }
      } catch {
        alert('Failed to import state file.');
      }
    };
    input.click();
  };

  if (error) {
    return (
      <Layout>
        <div className="container-page py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!checklist) {
    return (
      <Layout>
        <div className="container-page py-12 text-center">
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading checklist...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Disclaimer />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          {/* Tier selector */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {AVAILABLE_TIERS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => router.push(`/checklist/${t.value}`)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 ${
                  tier === t.value
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-navy">{t('title')}</h1>
                <RiskBadge tier={tier as RiskTier} />
              </div>
              <p className="mt-2 text-slate-500">{t('subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportState}
                className="inline-flex items-center gap-2 rounded-lg bg-eu-blue px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-eu-blue/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t('export.button')}
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                Import
              </button>
            </div>
          </div>

          <ChecklistView
            items={checklist.items}
            progress={progress}
            onProgressChange={handleProgressChange}
          />
        </div>
      </div>
    </Layout>
  );
}
