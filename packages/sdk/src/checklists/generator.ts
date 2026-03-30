import type { Checklist, ChecklistItem, RiskTier } from '../data/types.js';
import { RISK_TIERS } from '../data/types.js';
import { getChecklistsData } from '../data/loader.js';

/**
 * Get the compliance checklist for a given risk tier.
 *
 * Returns all checklist items with their article references, descriptions,
 * and required/optional status. The `completionRate` starts at 0 —
 * tracking state is the consumer's responsibility.
 *
 * @param tier - The risk tier to get the checklist for
 * @returns Complete checklist with items and zero completion rate
 * @throws {RangeError} If tier is not a valid RiskTier
 *
 * @example
 * ```typescript
 * const checklist = getChecklist('high-risk');
 * console.log(checklist.items.length); // ~40 items
 * console.log(checklist.completionRate); // 0
 * ```
 */
export function getChecklist(tier: RiskTier): Checklist {
  if (tier == null) {
    throw new TypeError(
      `getChecklist() requires a RiskTier string, but received ${tier === null ? 'null' : 'undefined'}`,
    );
  }

  if (typeof tier !== 'string' || !RISK_TIERS.includes(tier as RiskTier)) {
    throw new RangeError(
      `Invalid risk tier: '${String(tier)}'. Must be one of: ${RISK_TIERS.join(', ')}`,
    );
  }

  const data = getChecklistsData();
  const tierData = data[tier];

  if (!tierData) {
    return { tier, items: [], completionRate: 0 };
  }

  const items: ChecklistItem[] = tierData.items.map((raw) => ({
    id: raw.id,
    article: raw.article,
    paragraph: raw.paragraph ?? null,
    text: raw.text,
    description: raw.description,
    required: raw.required,
    category: raw.category,
    checked: false,
    evidence: undefined,
    notes: undefined,
  }));

  return { tier, items, completionRate: 0 };
}
