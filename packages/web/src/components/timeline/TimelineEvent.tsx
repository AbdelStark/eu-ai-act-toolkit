'use client';

import type { TimelineEvent as TimelineEventType } from '@eu-ai-act/sdk';
import { ArticleReference } from '@/components/shared/ArticleReference';

interface TimelineEventProps {
  event: TimelineEventType;
}

const statusStyles: Record<TimelineEventType['status'], string> = {
  past: 'border-green-200 bg-green-50/80 shadow-soft-sm',
  upcoming: 'border-amber-200 bg-amber-50/80 shadow-soft ring-1 ring-amber-200/50',
  future: 'border-slate-200 bg-slate-50 shadow-soft-sm',
};

const statusBadgeStyles: Record<TimelineEventType['status'], string> = {
  past: 'bg-green-100 text-green-700',
  upcoming: 'bg-amber-100 text-amber-700',
  future: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<TimelineEventType['status'], string> = {
  past: 'In Effect',
  upcoming: 'Upcoming',
  future: 'Future',
};

export function TimelineEvent({ event }: TimelineEventProps) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const daysLabel =
    event.daysUntil > 0
      ? `${event.daysUntil} days remaining`
      : event.daysUntil < 0
        ? `${Math.abs(event.daysUntil)} days ago`
        : 'Today';

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-150 hover:shadow-soft ${statusStyles[event.status]}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeStyles[event.status]}`}>
          {statusLabels[event.status]}
        </span>
        <time className="text-xs font-medium text-slate-400">{formattedDate}</time>
      </div>

      <h3 className="text-base font-bold text-navy">{event.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{event.description}</p>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex flex-wrap gap-1">
          {event.articles.slice(0, 4).map((article) => (
            <ArticleReference key={article} article={article} />
          ))}
          {event.articles.length > 4 && (
            <span className="text-xs text-gray-400">
              +{event.articles.length - 4} more
            </span>
          )}
        </div>
        <span className={`text-xs font-medium ${
          event.daysUntil > 0 ? 'text-amber-600' : event.daysUntil < 0 ? 'text-green-600' : 'text-eu-blue'
        }`}>{daysLabel}</span>
      </div>
    </div>
  );
}
