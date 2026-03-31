'use client';

import { useTranslations } from 'next-intl';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const t = useTranslations('classifier');
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-navy">
          {t('progress.question', { current, total })}
        </span>
        <span className="rounded-full bg-eu-blue/5 px-2.5 py-0.5 text-xs font-semibold text-eu-blue">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={t('progress.question', { current, total })}
        className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-eu-blue to-eu-blue-400 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
