import type {
  RiskTier,
  ClassificationResult,
  ChecklistItem,
  ChecklistProgress,
} from '../data/types.js';
import { RISK_TIERS } from '../data/types.js';
import { getChecklist } from '../checklists/generator.js';
import { countProgress } from '../checklists/scoring.js';
import { calculatePenaltyExposure } from '../penalties/calculator.js';
import type { OrganizationType } from '../penalties/calculator.js';

/**
 * Priority level for a compliance gap.
 *
 * - `'critical'`: Must be addressed immediately — deadline past or imminent.
 * - `'high'`: Required obligation with upcoming deadline (within 180 days).
 * - `'medium'`: Required obligation with future deadline.
 * - `'low'`: Optional/best-practice item.
 */
export type GapPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * A single compliance gap identified during analysis.
 */
export interface ComplianceGap {
  /** The checklist item that has not been completed. */
  item: ChecklistItem;

  /** Computed priority based on requirement status and deadline urgency. */
  priority: GapPriority;

  /** Priority score (0-100) for ordering. Higher = more urgent. */
  priorityScore: number;

  /** Days until the enforcement deadline. Negative = overdue. */
  daysUntilDeadline: number;

  /** Whether this is a required obligation (vs optional/best-practice). */
  required: boolean;

  /** Human-readable urgency description. */
  urgencyLabel: string;

  /** Estimated maximum fine exposure for non-compliance with this item. */
  fineExposureEur: number;
}

/**
 * Category-level gap summary.
 */
export interface CategoryGapSummary {
  /** The obligation category name. */
  category: string;

  /** Total items in this category. */
  totalItems: number;

  /** Number of completed items. */
  completedItems: number;

  /** Number of outstanding gaps. */
  gaps: number;

  /** Completion percentage (0-100). */
  completionPercent: number;

  /** Highest priority gap in this category. */
  highestPriority: GapPriority;
}

/**
 * Input for gap analysis.
 */
export interface GapAnalysisInput {
  /** The classification result to analyze gaps for. */
  classification: ClassificationResult;

  /** Current checklist progress state. Maps item IDs to progress records. */
  progress?: Record<string, ChecklistProgress>;

  /** Reference date for deadline calculations. Defaults to today. */
  referenceDate?: Date;

  /** Organization type for fine exposure calculation. Defaults to 'large'. */
  organizationType?: OrganizationType;

  /** Annual turnover in EUR for fine calculation. */
  annualTurnoverEur?: number;
}

/**
 * Complete gap analysis result.
 */
export interface GapAnalysisResult {
  /** The risk tier analyzed. */
  tier: RiskTier;

  /** Overall compliance readiness percentage (0-100). */
  readinessPercent: number;

  /** All identified gaps, sorted by priority (most urgent first). */
  gaps: ComplianceGap[];

  /** Gap summary grouped by obligation category. */
  categorySummary: CategoryGapSummary[];

  /** Total number of checklist items. */
  totalItems: number;

  /** Number of completed items. */
  completedItems: number;

  /** Number of outstanding gaps. */
  outstandingGaps: number;

  /** Number of critical gaps (deadline past or imminent). */
  criticalGaps: number;

  /** Days until the next enforcement deadline. Negative = overdue. */
  daysUntilDeadline: number;

  /** ISO 8601 enforcement date for this tier. */
  enforcementDate: string;

  /** Maximum fine exposure for outstanding non-compliance. */
  maxFineExposureEur: number;

  /** Human-readable assessment of compliance readiness. */
  assessment: string;

  /** Prioritized remediation recommendations. */
  recommendations: string[];
}

/**
 * Perform a compliance gap analysis for a classified AI system.
 *
 * Analyzes the current checklist completion state against the obligations
 * for the system's risk tier, computing:
 * - Per-item gaps with priority scoring based on deadline urgency
 * - Category-level completion summaries
 * - Overall readiness percentage
 * - Fine exposure estimates
 * - Prioritized remediation recommendations
 *
 * @param input - Gap analysis configuration
 * @returns Comprehensive gap analysis result
 * @throws {TypeError} If input is invalid
 *
 * @example
 * ```typescript
 * const result = analyzeGaps({
 *   classification: classifyResult,
 *   progress: { 'art9-risk-system': { checked: true, evidence: null, checkedAt: '2025-01-01' } },
 *   annualTurnoverEur: 50_000_000,
 * });
 * console.log(result.readinessPercent); // 5
 * console.log(result.criticalGaps);     // 3
 * ```
 */
export function analyzeGaps(input: GapAnalysisInput): GapAnalysisResult {
  validateGapInput(input);

  const { classification, progress = {}, referenceDate } = input;
  const orgType = input.organizationType ?? 'large';
  const refDate = referenceDate ?? new Date();

  // Get the checklist for this tier
  const checklist = getChecklist(classification.tier);
  const { completed, total, percent } = countProgress(checklist.items, progress);

  // Calculate days until enforcement deadline
  const deadlineDate = new Date(classification.enforcementDate);
  const daysUntilDeadline = Math.ceil(
    (deadlineDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Get penalty exposure for fine estimates
  const penaltyExposure = calculatePenaltyExposure({
    tier: classification.tier,
    annualTurnoverEur: input.annualTurnoverEur,
    organizationType: orgType,
  });

  // Per-penalty max fine (distributed estimate per item)
  const maxPenaltyFine = penaltyExposure.maxExposureEur;

  // Identify all gaps (uncompleted items)
  const gaps: ComplianceGap[] = checklist.items
    .filter((item) => !progress[item.id]?.checked)
    .map((item) => computeGap(item, daysUntilDeadline, maxPenaltyFine))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // Category-level summary
  const categorySummary = computeCategorySummary(checklist.items, progress, daysUntilDeadline);

  // Critical gaps count
  const criticalGaps = gaps.filter((g) => g.priority === 'critical').length;

  // Build assessment and recommendations
  const assessment = buildAssessment(
    classification.tier,
    percent,
    criticalGaps,
    gaps.length,
    daysUntilDeadline,
  );
  const recommendations = buildRecommendations(
    gaps,
    categorySummary,
    daysUntilDeadline,
    classification.tier,
  );

  return {
    tier: classification.tier,
    readinessPercent: percent,
    gaps,
    categorySummary,
    totalItems: total,
    completedItems: completed,
    outstandingGaps: gaps.length,
    criticalGaps,
    daysUntilDeadline,
    enforcementDate: classification.enforcementDate,
    maxFineExposureEur: maxPenaltyFine,
    assessment,
    recommendations,
  };
}

/**
 * Get a quick readiness score without full gap analysis.
 *
 * Lighter weight than `analyzeGaps()` — only computes the percentage
 * and basic counts. Useful for dashboard displays.
 *
 * @param tier - Risk tier to assess
 * @param progress - Current checklist progress
 * @returns Quick readiness summary
 */
export function getReadinessScore(
  tier: RiskTier,
  progress: Record<string, ChecklistProgress> = {},
): { percent: number; completed: number; total: number; tier: RiskTier } {
  const checklist = getChecklist(tier);
  const { completed, total, percent } = countProgress(checklist.items, progress);
  return { percent, completed, total, tier };
}

function computeGap(
  item: ChecklistItem,
  daysUntilDeadline: number,
  maxPenaltyFine: number,
): ComplianceGap {
  const priority = computePriority(item.required, daysUntilDeadline);
  const priorityScore = computePriorityScore(item.required, daysUntilDeadline);

  // Fine exposure: required items carry the full penalty risk
  const fineExposure = item.required ? maxPenaltyFine : 0;

  return {
    item,
    priority,
    priorityScore,
    daysUntilDeadline,
    required: item.required,
    urgencyLabel: formatUrgency(daysUntilDeadline, item.required),
    fineExposureEur: fineExposure,
  };
}

function computePriority(required: boolean, daysUntilDeadline: number): GapPriority {
  if (!required) return 'low';
  if (daysUntilDeadline <= 0) return 'critical';
  if (daysUntilDeadline <= 180) return 'high';
  return 'medium';
}

function computePriorityScore(required: boolean, daysUntilDeadline: number): number {
  if (!required) return 10;

  // Base score for required items
  let score = 50;

  if (daysUntilDeadline <= 0) {
    // Overdue: max urgency, more overdue = higher score
    score = 100 + Math.min(Math.abs(daysUntilDeadline), 365);
  } else if (daysUntilDeadline <= 90) {
    // Imminent: 90-100
    score = 90 + Math.round((90 - daysUntilDeadline) / 9);
  } else if (daysUntilDeadline <= 180) {
    // Upcoming: 70-90
    score = 70 + Math.round((180 - daysUntilDeadline) / 4.5);
  } else if (daysUntilDeadline <= 365) {
    // Future: 50-70
    score = 50 + Math.round((365 - daysUntilDeadline) / 9.25);
  }

  return score;
}

function formatUrgency(daysUntilDeadline: number, required: boolean): string {
  if (!required) return 'Optional — best practice';

  if (daysUntilDeadline < 0) {
    const overdueDays = Math.abs(daysUntilDeadline);
    return `OVERDUE by ${overdueDays} day${overdueDays !== 1 ? 's' : ''} — immediate action required`;
  }
  if (daysUntilDeadline === 0) {
    return 'Deadline is TODAY — immediate action required';
  }
  if (daysUntilDeadline <= 30) {
    return `${daysUntilDeadline} days remaining — urgent`;
  }
  if (daysUntilDeadline <= 90) {
    return `${daysUntilDeadline} days remaining — action needed soon`;
  }
  if (daysUntilDeadline <= 180) {
    return `${daysUntilDeadline} days remaining — plan remediation`;
  }
  return `${daysUntilDeadline} days remaining`;
}

function computeCategorySummary(
  items: ChecklistItem[],
  progress: Record<string, ChecklistProgress>,
  daysUntilDeadline: number,
): CategoryGapSummary[] {
  const categories = new Map<string, { total: number; completed: number; priorities: GapPriority[] }>();

  for (const item of items) {
    const cat = categories.get(item.category) ?? { total: 0, completed: 0, priorities: [] };
    cat.total++;
    if (progress[item.id]?.checked) {
      cat.completed++;
    } else {
      cat.priorities.push(computePriority(item.required, daysUntilDeadline));
    }
    categories.set(item.category, cat);
  }

  const priorityOrder: GapPriority[] = ['critical', 'high', 'medium', 'low'];

  return Array.from(categories.entries())
    .map(([category, data]): CategoryGapSummary => {
      const gaps = data.total - data.completed;
      const highestPriority = data.priorities.length > 0
        ? data.priorities.reduce((best, p) =>
            priorityOrder.indexOf(p) < priorityOrder.indexOf(best) ? p : best,
          )
        : 'low';

      return {
        category,
        totalItems: data.total,
        completedItems: data.completed,
        gaps,
        completionPercent: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 100,
        highestPriority: gaps > 0 ? highestPriority : 'low',
      };
    })
    .sort((a, b) => {
      // Sort by highest priority first, then by most gaps
      const aPrio = priorityOrder.indexOf(a.highestPriority);
      const bPrio = priorityOrder.indexOf(b.highestPriority);
      if (aPrio !== bPrio) return aPrio - bPrio;
      return b.gaps - a.gaps;
    });
}

function buildAssessment(
  tier: RiskTier,
  readinessPercent: number,
  criticalGaps: number,
  totalGaps: number,
  daysUntilDeadline: number,
): string {
  if (tier === 'minimal') {
    return 'Minimal risk — no mandatory obligations. Consider voluntary codes of conduct (Article 69).';
  }

  if (totalGaps === 0) {
    return 'All checklist items complete. Compliance readiness appears satisfactory. Continue monitoring for regulatory updates.';
  }

  const parts: string[] = [];

  // Readiness assessment
  if (readinessPercent >= 80) {
    parts.push(`Near-complete at ${readinessPercent}% readiness.`);
  } else if (readinessPercent >= 50) {
    parts.push(`Partially compliant at ${readinessPercent}% readiness.`);
  } else if (readinessPercent > 0) {
    parts.push(`Early-stage compliance at ${readinessPercent}% readiness.`);
  } else {
    parts.push('No compliance items completed. Comprehensive remediation program required.');
  }

  // Deadline urgency
  if (daysUntilDeadline < 0) {
    parts.push(`Enforcement deadline has passed (${Math.abs(daysUntilDeadline)} days overdue). Immediate remediation required to avoid penalties.`);
  } else if (daysUntilDeadline <= 90) {
    parts.push(`Enforcement deadline in ${daysUntilDeadline} days — urgent action needed.`);
  } else if (daysUntilDeadline <= 180) {
    parts.push(`Enforcement deadline in ${daysUntilDeadline} days — prioritized remediation plan recommended.`);
  }

  // Critical gaps
  if (criticalGaps > 0) {
    parts.push(`${criticalGaps} critical gap${criticalGaps !== 1 ? 's' : ''} requiring immediate attention.`);
  }

  parts.push(`${totalGaps} total gap${totalGaps !== 1 ? 's' : ''} remaining.`);

  return parts.join(' ');
}

function buildRecommendations(
  gaps: ComplianceGap[],
  categorySummary: CategoryGapSummary[],
  daysUntilDeadline: number,
  tier: RiskTier,
): string[] {
  const recs: string[] = [];

  if (tier === 'minimal') {
    recs.push('Consider adopting voluntary codes of conduct per Article 69.');
    return recs;
  }

  if (gaps.length === 0) {
    recs.push('Maintain documentation and monitor for regulatory updates from the AI Office.');
    recs.push('Schedule periodic compliance reviews to ensure continued adherence.');
    return recs;
  }

  // Critical items first
  const criticalGaps = gaps.filter((g) => g.priority === 'critical');
  if (criticalGaps.length > 0) {
    const categories = [...new Set(criticalGaps.map((g) => g.item.category))];
    recs.push(
      `URGENT: Address ${criticalGaps.length} overdue obligation${criticalGaps.length !== 1 ? 's' : ''} in: ${formatCategoryList(categories)}.`,
    );
  }

  // Worst category
  const worstCategory = categorySummary
    .filter((c) => c.gaps > 0 && c.completionPercent < 100)
    .sort((a, b) => a.completionPercent - b.completionPercent)[0];

  if (worstCategory && worstCategory.completionPercent < 50) {
    recs.push(
      `Focus on "${formatCategoryName(worstCategory.category)}" — only ${worstCategory.completionPercent}% complete (${worstCategory.gaps} gaps).`,
    );
  }

  // High-priority items
  const highGaps = gaps.filter((g) => g.priority === 'high');
  if (highGaps.length > 0) {
    recs.push(
      `Plan remediation for ${highGaps.length} high-priority item${highGaps.length !== 1 ? 's' : ''} due within 180 days.`,
    );
  }

  // Risk management is foundational
  const riskMgmtGaps = gaps.filter((g) => g.item.category === 'risk-management');
  if (riskMgmtGaps.length > 0 && tier === 'high-risk') {
    recs.push('Establish the risk management system (Art. 9) first — it informs all other obligations.');
  }

  // Documentation
  const docGaps = gaps.filter((g) => g.item.category === 'documentation');
  if (docGaps.length > 0) {
    recs.push(`Complete ${docGaps.length} outstanding documentation requirement${docGaps.length !== 1 ? 's' : ''} (Art. 11/53).`);
  }

  // Timeline advice
  if (daysUntilDeadline > 0 && daysUntilDeadline <= 365) {
    recs.push(`Create a remediation timeline targeting completion at least 30 days before the ${tier === 'gpai' || tier === 'gpai-systemic' ? 'GPAI' : 'enforcement'} deadline.`);
  }

  return recs;
}

function formatCategoryList(categories: string[]): string {
  return categories.map(formatCategoryName).join(', ');
}

function formatCategoryName(cat: string): string {
  return cat
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function validateGapInput(input: GapAnalysisInput): void {
  if (input == null || typeof input !== 'object') {
    throw new TypeError('analyzeGaps() requires a GapAnalysisInput object');
  }
  if (input.classification == null || typeof input.classification !== 'object') {
    throw new TypeError('GapAnalysisInput.classification is required');
  }
  if (typeof input.classification.tier !== 'string') {
    throw new TypeError('GapAnalysisInput.classification.tier must be a valid RiskTier');
  }
  if (!RISK_TIERS.includes(input.classification.tier as RiskTier)) {
    throw new RangeError(
      `GapAnalysisInput.classification.tier must be one of: ${RISK_TIERS.join(', ')}. Got: '${input.classification.tier}'`,
    );
  }
  if (typeof input.classification.enforcementDate !== 'string') {
    throw new TypeError('GapAnalysisInput.classification.enforcementDate must be a date string');
  }
}
