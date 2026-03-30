'use client';

import type { TimelineEvent as TimelineEventType } from '@eu-ai-act/sdk';
import { ArticleReference } from '@/components/shared/ArticleReference';

interface TimelineEventProps {
  event: TimelineEventType;
}

const statusStyles: Record<TimelineEventType['status'], string> = {
  past: 'border-green-300 bg-green-50',
  upcoming: 'border-amber-300 bg-amber-50',
  future: 'border-gray-200 bg-white',
};

const dotStyles: Record<TimelineEventType['status'], string> = {
  past: 'bg-green-500',
  upcoming: 'bg-amber-500',
  future: 'bg-gray-300',
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
    <div className={`rounded-lg border p-4 ${statusStyles[event.status]}`}>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${dotStyles[event.status]}`}
          aria-hidden="true"
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {statusLabels[event.status]}
        </span>
      </div>

      <p className="text-sm font-medium text-gray-500">{formattedDate}</p>
      <h3 className="mt-1 text-base font-bold text-navy">{event.title}</h3>
      <p className="mt-1 text-sm text-gray-600">{event.description}</p>

      <div className="mt-3 flex items-center justify-between">
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
        <span className="text-xs text-gray-500">{daysLabel}</span>
      </div>
    </div>
  );
}
