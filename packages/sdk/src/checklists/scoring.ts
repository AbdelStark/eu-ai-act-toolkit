import type { ChecklistItem, ChecklistProgress } from '../data/types.js';

/**
 * Calculate compliance completion score.
 *
 * Computes the fraction of checklist items that have been checked off,
 * using the progress tracking state. Items not present in the progress
 * map are treated as unchecked.
 *
 * @param items - Checklist items to score against
 * @param progress - User's tracking progress (item ID → completion state)
 * @returns Completion rate from 0 to 1
 *
 * @example
 * ```typescript
 * const score = calculateScore(checklist.items, stateFile.checklist);
 * console.log(`${Math.round(score * 100)}% complete`); // "49% complete"
 * ```
 */
export function calculateScore(
  items: ChecklistItem[],
  progress: Record<string, ChecklistProgress>,
): number {
  if (items.length === 0) return 0;

  const checked = items.filter((item) => progress[item.id]?.checked === true);
  return checked.length / items.length;
}

/**
 * Count completed and total items for display.
 *
 * @param items - Checklist items
 * @param progress - User's tracking progress
 * @returns Object with completed, total, and percentage
 */
export function countProgress(
  items: ChecklistItem[],
  progress: Record<string, ChecklistProgress>,
): { completed: number; total: number; percent: number } {
  const total = items.length;
  const completed = items.filter((item) => progress[item.id]?.checked === true).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}
