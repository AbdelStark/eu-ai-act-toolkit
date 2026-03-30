'use client';

import * as Progress from '@radix-ui/react-progress';

interface ComplianceScoreProps {
  completed: number;
  total: number;
  percent: number;
}

export function ComplianceScore({
  completed,
  total,
  percent,
}: ComplianceScoreProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-500">
            Compliance Score
          </h2>
          <p className="mt-1 text-2xl font-bold text-navy">{percent}%</p>
        </div>
        <p className="text-sm text-gray-500">
          {completed}/{total} complete
        </p>
      </div>

      <Progress.Root
        value={percent}
        max={100}
        className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <Progress.Indicator
          className="h-full rounded-full bg-eu-blue transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </Progress.Root>

      {percent === 100 && (
        <p className="mt-3 text-sm font-medium text-green-600">
          All items complete
        </p>
      )}
      {percent < 100 && total - completed > 0 && (
        <p className="mt-3 text-sm text-gray-500">
          {total - completed} items remaining
        </p>
      )}
    </div>
  );
}
