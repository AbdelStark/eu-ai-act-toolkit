'use client';

import { useState, useMemo } from 'react';
import type { ChecklistItem as ChecklistItemType, ChecklistProgress } from '@eu-ai-act/sdk';
import { ChecklistItem } from './ChecklistItem';
import { ComplianceScore } from './ComplianceScore';

type FilterStatus = 'all' | 'complete' | 'incomplete' | 'required' | 'recommended';

interface ChecklistViewProps {
  items: ChecklistItemType[];
  progress: Record<string, ChecklistProgress>;
  onProgressChange: (progress: Record<string, ChecklistProgress>) => void;
}

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All Items' },
  { value: 'complete', label: 'Completed' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'required', label: 'Required' },
  { value: 'recommended', label: 'Recommended' },
];

export function ChecklistView({
  items,
  progress,
  onProgressChange,
}: ChecklistViewProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');

  const { completed, total, percent } = useMemo(() => {
    const t = items.length;
    const c = items.filter((item) => progress[item.id]?.checked).length;
    return { completed: c, total: t, percent: t === 0 ? 0 : Math.round((c / t) * 100) };
  }, [items, progress]);

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'complete':
        return items.filter((i) => progress[i.id]?.checked);
      case 'incomplete':
        return items.filter((i) => !progress[i.id]?.checked);
      case 'required':
        return items.filter((i) => i.required);
      case 'recommended':
        return items.filter((i) => !i.required);
      default:
        return items;
    }
  }, [items, progress, filter]);

  const handleToggle = (itemId: string, checked: boolean) => {
    const updated = {
      ...progress,
      [itemId]: {
        checked,
        evidence: progress[itemId]?.evidence ?? null,
        checkedAt: checked ? new Date().toISOString() : null,
      },
    };
    onProgressChange(updated);
  };

  const handleEvidenceChange = (itemId: string, evidence: string) => {
    const updated = {
      ...progress,
      [itemId]: {
        checked: progress[itemId]?.checked ?? false,
        evidence: evidence || null,
        checkedAt: progress[itemId]?.checkedAt ?? null,
      },
    };
    onProgressChange(updated);
  };

  return (
    <div className="space-y-6">
      <ComplianceScore completed={completed} total={total} percent={percent} />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 ${
              filter === f.value
                ? 'bg-eu-blue text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            progress={progress[item.id]}
            onToggle={handleToggle}
            onEvidenceChange={handleEvidenceChange}
          />
        ))}
        {filteredItems.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="empty-state-title">No items found</p>
            <p className="empty-state-description">No checklist items match the current filter. Try a different filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
