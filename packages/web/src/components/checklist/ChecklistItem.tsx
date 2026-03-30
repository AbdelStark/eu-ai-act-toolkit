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
  const isChecked = progress?.checked ?? false;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300">
      <div className="flex items-start gap-3">
        <Checkbox.Root
          id={item.id}
          checked={isChecked}
          onCheckedChange={(checked) =>
            onToggle(item.id, checked === true)
          }
          className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-gray-300 transition-colors data-[state=checked]:border-eu-blue data-[state=checked]:bg-eu-blue focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
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

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <label
              htmlFor={item.id}
              className={`text-sm font-medium cursor-pointer ${
                isChecked ? 'text-gray-400 line-through' : 'text-navy'
              }`}
            >
              {item.text}
            </label>
            <div className="flex items-center gap-2">
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
            className="mt-1 text-xs text-gray-500 hover:text-navy focus:outline-none focus:underline"
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-gray-600">{item.description}</p>
              <div>
                <label
                  htmlFor={`evidence-${item.id}`}
                  className="block text-xs font-medium text-gray-500"
                >
                  Evidence / Notes
                </label>
                <textarea
                  id={`evidence-${item.id}`}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
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
