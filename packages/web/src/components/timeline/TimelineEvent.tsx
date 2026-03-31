'use client';

import { useTranslations } from 'next-intl';
import type { TimelineEvent as TimelineEventType } from '@eu-ai-act/sdk';

interface TimelineEventProps {
  event: TimelineEventType;
  eventIndex?: number;
}

const statusDot: Record<TimelineEventType['status'], string> = {
  past: 'bg-green-500 ring-green-500/20',
  upcoming: 'bg-amber-500 ring-amber-500/20',
  future: 'bg-slate-300 ring-slate-300/20',
};

const statusBadge: Record<TimelineEventType['status'], string> = {
  past: 'bg-green-50 text-green-700 border-green-200',
  upcoming: 'bg-amber-50 text-amber-700 border-amber-200',
  future: 'bg-slate-50 text-slate-500 border-slate-200',
};

const statusFilterKeys: Record<TimelineEventType['status'], string> = {
  past: 'past',
  upcoming: 'upcoming',
  future: 'future',
};

export function TimelineEvent({ event, eventIndex }: TimelineEventProps) {
  const tTimeline = useTranslations('timeline');
  const sdkT = useTranslations('sdk');

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const daysLabel =
    event.daysUntil > 0
      ? tTimeline('daysUntil', { days: event.daysUntil })
      : event.daysUntil < 0
        ? tTimeline('daysPast', { days: Math.abs(event.daysUntil) })
        : tTimeline('today');

  const statusLabel = tTimeline(`filters.${statusFilterKeys[event.status]}`);

  const eventTitle = eventIndex !== undefined && sdkT.has(`timeline.${eventIndex}.title`)
    ? sdkT(`timeline.${eventIndex}.title`)
    : event.title;
  const eventDescription = eventIndex !== undefined && sdkT.has(`timeline.${eventIndex}.description`)
    ? sdkT(`timeline.${eventIndex}.description`)
    : event.description;

  const isUpcoming = event.status === 'upcoming';

  return (
    <div className="relative flex gap-4 py-4 pl-0 sm:gap-5 sm:pl-3">
      {/* Dot */}
      <div className="relative z-10 mt-1.5 flex-shrink-0">
        <div className={`h-[9px] w-[9px] rounded-full ring-4 ${statusDot[event.status]}`} />
      </div>

      {/* Content */}
      <div className={`group flex-1 rounded-xl border p-4 transition-all duration-200 sm:p-5 ${
        isUpcoming
          ? 'border-amber-200/80 bg-amber-50/30 shadow-soft-sm hover:shadow-soft'
          : event.status === 'past'
            ? 'border-slate-200/60 bg-white hover:border-slate-200 hover:shadow-soft-sm'
            : 'border-slate-200/60 bg-slate-50/50 hover:border-slate-200 hover:shadow-soft-sm'
      }`}>
        {/* Top row: badge + date */}
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${statusBadge[event.status]}`}>
            {statusLabel}
          </span>
          <time className="text-xs tabular-nums text-slate-400">{formattedDate}</time>
        </div>

        {/* Title */}
        <h3 className={`mt-3 text-[15px] font-semibold leading-snug ${isUpcoming ? 'text-amber-900' : 'text-navy'}`}>
          {eventTitle}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
          {eventDescription}
        </p>

        {/* Bottom row: articles + days */}
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {event.articles.length > 0 && (
              <span className="text-[11px] text-slate-400">
                Art. {event.articles.slice(0, 5).join(', ')}
                {event.articles.length > 5 && ` +${event.articles.length - 5}`}
              </span>
            )}
          </div>
          <span className={`text-xs font-medium tabular-nums ${
            event.daysUntil > 0 ? 'text-amber-600' : event.daysUntil < 0 ? 'text-green-600' : 'text-eu-blue'
          }`}>
            {daysLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
