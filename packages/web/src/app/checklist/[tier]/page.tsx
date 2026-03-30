'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
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

export default function ChecklistPage() {
  const params = useParams();
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
        <div className="container-page py-12">
          <p className="text-gray-500">Loading checklist...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Disclaimer />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-navy">{t('title')}</h1>
                <RiskBadge tier={tier as RiskTier} />
              </div>
              <p className="mt-2 text-gray-600">{t('subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportState}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
              >
                {t('export.button')}
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
              >
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
