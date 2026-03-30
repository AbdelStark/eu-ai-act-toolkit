import type { RiskTier, TimelineEvent, TimelineStatus } from '../data/types.js';
import { getTimelineData } from '../data/loader.js';

const MS_PER_DAY = 86_400_000;
const UPCOMING_THRESHOLD_DAYS = 90;

/**
 * Get enforcement timeline with computed status and countdown.
 *
 * Returns all EU AI Act enforcement milestones sorted chronologically.
 * Each event's `status` and `daysUntil` are computed relative to the
 * reference date.
 *
 * @param referenceDate - Date to compute status against (defaults to now)
 * @returns Timeline events sorted by date, with computed fields
 *
 * @example
 * ```typescript
 * const timeline = getTimeline();
 * const next = timeline.find(e => e.status === 'upcoming');
 * console.log(`${next.title}: ${next.daysUntil} days`);
 * ```
 */
export function getTimeline(referenceDate?: Date): TimelineEvent[] {
  const ref = referenceDate ?? new Date();
  const refTime = ref.getTime();
  const raw = getTimelineData();

  return raw
    .map((event): TimelineEvent => {
      const eventTime = new Date(event.date).getTime();
      const daysUntil = Math.ceil((eventTime - refTime) / MS_PER_DAY);
      const status = computeStatus(daysUntil);

      return {
        date: event.date,
        title: event.title,
        description: event.description,
        articles: event.articles,
        categories: event.categories as RiskTier[],
        status,
        daysUntil,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function computeStatus(daysUntil: number): TimelineStatus {
  if (daysUntil < 0) return 'past';
  if (daysUntil <= UPCOMING_THRESHOLD_DAYS) return 'upcoming';
  return 'future';
}
