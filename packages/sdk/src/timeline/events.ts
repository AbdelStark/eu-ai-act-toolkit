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
  if (referenceDate != null && !(referenceDate instanceof Date)) {
    throw new TypeError(
      `getTimeline() referenceDate must be a Date instance or undefined, got ${typeof referenceDate}`,
    );
  }

  if (referenceDate != null && isNaN(referenceDate.getTime())) {
    throw new RangeError('getTimeline() referenceDate is an invalid Date');
  }

  const ref = referenceDate ?? new Date();
  const refTime = ref.getTime();
  const raw = getTimelineData();

  return raw
    .map((event): TimelineEvent => {
      const eventTime = new Date(event.date).getTime();
      const daysUntil = Math.ceil((eventTime - refTime) / MS_PER_DAY);
      const status = computeStatus(daysUntil);

      // Filter out the special 'all' sentinel — expand it to concrete tiers
      const categories: RiskTier[] = event.categories.includes('all' as RiskTier | 'all')
        ? ['prohibited', 'high-risk', 'gpai', 'gpai-systemic', 'limited', 'minimal']
        : event.categories.filter((c): c is RiskTier => c !== 'all');

      return {
        date: event.date,
        title: event.title,
        description: event.description,
        articles: event.articles,
        categories,
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
