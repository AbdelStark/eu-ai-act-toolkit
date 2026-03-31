'use client';

import { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import type { ChecklistItem as ChecklistItemType, ChecklistProgress } from '@eu-ai-act/sdk';
import { ArticleReference } from '@/components/shared/ArticleReference';

interface ChecklistItemProps {
  item: ChecklistItemType;
  progress: ChecklistProgress | undefined;
  onToggle: (itemId: string, checked: boolean) => void;
  onEvidenceChange: (itemId: string, evidence: string) => void;
}

export function ChecklistItem({
  item,
  progress,
  onToggle,
  onEvidenceChange,
}: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [justChecked, setJustChecked] = useState(false);
  const isChecked = progress?.checked ?? false;

  const handleToggle = (checked: boolean) => {
    onToggle(item.id, checked);
    if (checked) {
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 300);
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all duration-150 ${
      isChecked
        ? 'border-green-200 bg-green-50/50'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-soft-sm'
    }`}>
      <div className="flex items-start gap-3">
        <div className={justChecked ? 'animate-check-bounce' : ''}>
          <Checkbox.Root
            id={item.id}
            checked={isChecked}
            onCheckedChange={(checked) => handleToggle(checked === true)}
            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 ${
              isChecked
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300 hover:border-eu-blue'
            }`}
          >
            <Checkbox.Indicator>
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 14 14" fill="none">
                <path
                  d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Checkbox.Indicator>
          </Checkbox.Root>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <label
              htmlFor={item.id}
              className={`text-sm font-medium cursor-pointer transition-colors duration-200 ${
                isChecked ? 'text-slate-400 line-through' : 'text-navy'
              }`}
            >
              {item.text}
            </label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.required
                    ? 'bg-red-50 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {item.required ? 'Required' : 'Recommended'}
              </span>
              <ArticleReference
                article={item.article}
                paragraph={item.paragraph ?? undefined}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 inline-flex items-center gap-1 rounded px-1 py-1 text-xs text-slate-400 hover:text-navy focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-1 transition-colors min-h-[44px] sm:min-h-0"
          >
            <svg className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            {expanded ? 'Hide details' : 'Show details'}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 animate-slide-down">
              <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>
              <div>
                <label
                  htmlFor={`evidence-${item.id}`}
                  className="block text-xs font-medium text-slate-500"
                >
                  Evidence / Notes
                </label>
                <textarea
                  id={`evidence-${item.id}`}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue transition-colors"
                  placeholder="Describe how you comply with this requirement..."
                  value={progress?.evidence ?? ''}
                  onChange={(e) =>
                    onEvidenceChange(item.id, e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
