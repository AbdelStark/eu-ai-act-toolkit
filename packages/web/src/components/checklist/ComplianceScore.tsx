'use client';

import * as Progress from '@radix-ui/react-progress';

interface ComplianceScoreProps {
  completed: number;
  total: number;
  percent: number;
}

function getScoreColor(percent: number): string {
  if (percent >= 80) return 'text-green-600';
  if (percent >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function getBarColor(percent: number): string {
  if (percent >= 80) return 'bg-gradient-to-r from-green-500 to-green-400';
  if (percent >= 50) return 'bg-gradient-to-r from-amber-500 to-amber-400';
  return 'bg-gradient-to-r from-red-500 to-red-400';
}

export function ComplianceScore({
  completed,
  total,
  percent,
}: ComplianceScoreProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-6">
        {/* Circular score indicator */}
        <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center">
          <svg className="h-20 w-20 -rotate-90 transform" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke={percent >= 80 ? '#22c55e' : percent >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(percent / 100) * 213.6} 213.6`}
              className="transition-all duration-700"
            />
          </svg>
          <span className={`absolute text-xl font-bold ${getScoreColor(percent)}`}>
            {percent}%
          </span>
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-bold text-navy">
            Compliance Score
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {completed} of {total} items complete
          </p>

          <Progress.Root
            value={percent}
            max={100}
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
          >
            <Progress.Indicator
              className={`h-full rounded-full transition-all duration-700 ${getBarColor(percent)}`}
              style={{ width: `${percent}%` }}
            />
          </Progress.Root>

          {percent === 100 && (
            <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-green-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              All items complete
            </p>
          )}
          {percent < 100 && total - completed > 0 && (
            <p className="mt-2 text-sm text-slate-500">
              {total - completed} items remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
