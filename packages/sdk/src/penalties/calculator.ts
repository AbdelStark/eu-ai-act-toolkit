import type { RiskTier } from '../data/types.js';
import { RISK_TIERS } from '../data/types.js';
import { getPenaltiesData } from '../data/loader.js';

/**
 * Organization size classification for penalty calculation.
 *
 * - `'large'`: Default. Fines are the higher of the fixed EUR amount
 *   or the turnover percentage.
 * - `'sme'`: Small/medium enterprise (< 250 employees, ≤ EUR 50M turnover).
 *   Fines are the lower of the two amounts per Art. 99(6).
 * - `'startup'`: Same reduction as SME under Art. 99(6).
 * - `'eu-institution'`: EU institutions, agencies, and bodies.
 *   Capped at EUR 1,500,000 per Art. 99(7).
 */
export type OrganizationType = 'large' | 'sme' | 'startup' | 'eu-institution';

/**
 * Input for penalty exposure calculation.
 */
export interface PenaltyInput {
  /** The risk tier of the AI system. */
  tier: RiskTier;

  /** Global annual turnover in EUR. Used for turnover-based fine calculation. */
  annualTurnoverEur?: number;

  /** Type of organization for determining applicable reductions. */
  organizationType?: OrganizationType;
}

/**
 * A single applicable penalty tier for the organization.
 */
export interface PenaltyTier {
  /** Unique identifier for this penalty category. */
  id: string;

  /** Source article in Regulation 2024/1689. */
  article: number;

  /** Source paragraph. */
  paragraph: number;

  /** Description of the infringement category. */
  description: string;

  /** Maximum fine in EUR (fixed statutory amount). */
  maxFineFixedEur: number;

  /** Maximum fine based on global annual turnover (EUR). Null if turnover not provided. */
  maxFineTurnoverEur: number | null;

  /** The effective maximum fine after applying organization-type rules. */
  effectiveMaxFineEur: number;

  /** Example violations that fall under this penalty category. */
  violationExamples: string[];
}

/**
 * Result of a penalty exposure assessment.
 */
export interface PenaltyExposure {
  /** The risk tier assessed. */
  tier: RiskTier;

  /** Organization type used for calculation. */
  organizationType: OrganizationType;

  /** All applicable penalty tiers for this risk classification. */
  penalties: PenaltyTier[];

  /** The highest potential single fine across all applicable penalty categories. */
  maxExposureEur: number;

  /** Whether SME/startup reductions were applied. */
  smeReductionApplied: boolean;

  /** Whether the EU institution cap was applied. */
  euInstitutionCapApplied: boolean;

  /** Human-readable summary of the penalty exposure. */
  summary: string;
}

/**
 * Summary of all penalty tiers in the EU AI Act.
 */
export interface PenaltySummary {
  /** Unique identifier. */
  id: string;

  /** Source article. */
  article: number;

  /** Description of the infringement. */
  description: string;

  /** Maximum fine in EUR. */
  maxFineEur: number;

  /** Maximum fine as turnover percentage. */
  maxFineTurnoverPercent: number;

  /** Risk tiers this penalty applies to. */
  applicableTiers: RiskTier[];
}

/**
 * Get all penalty tiers defined in the EU AI Act.
 *
 * Returns a summary of each penalty category with its statutory
 * maximum fines and applicable risk tiers. Useful for reference
 * tables and penalty overviews.
 *
 * @returns Array of penalty summaries sorted by severity (highest fine first).
 */
export function getPenalties(): PenaltySummary[] {
  const data = getPenaltiesData();
  return data.penalties
    .map((p): PenaltySummary => ({
      id: p.id,
      article: p.article,
      description: p.description,
      maxFineEur: p.maxFineEur,
      maxFineTurnoverPercent: p.maxFineTurnoverPercent,
      applicableTiers: p.applicableTiers,
    }))
    .sort((a, b) => b.maxFineEur - a.maxFineEur);
}

/**
 * Get penalty tiers applicable to a specific risk tier.
 *
 * @param tier - The risk tier to look up penalties for.
 * @returns Array of penalty summaries for the given tier.
 */
export function getPenaltiesByTier(tier: RiskTier): PenaltySummary[] {
  return getPenalties().filter((p) => p.applicableTiers.includes(tier));
}

/**
 * Calculate penalty exposure for an AI system based on its risk tier
 * and organization characteristics.
 *
 * Takes into account:
 * - Risk tier to determine applicable penalty categories
 * - Annual turnover for turnover-based fine calculation
 * - Organization type for SME reductions (Art. 99(6)) and
 *   EU institution caps (Art. 99(7))
 *
 * @param input - Penalty calculation input
 * @returns Detailed penalty exposure assessment
 * @throws {TypeError} If input is invalid
 *
 * @example
 * ```typescript
 * const exposure = calculatePenaltyExposure({
 *   tier: 'high-risk',
 *   annualTurnoverEur: 100_000_000,
 *   organizationType: 'large',
 * });
 * // exposure.maxExposureEur === 15_000_000
 * // (3% of 100M = 3M, but statutory max is 15M which is higher)
 * ```
 */
export function calculatePenaltyExposure(input: PenaltyInput): PenaltyExposure {
  validatePenaltyInput(input);

  const orgType = input.organizationType ?? 'large';
  const data = getPenaltiesData();

  // Find applicable penalty categories for this tier
  const applicablePenalties = data.penalties.filter((p) =>
    p.applicableTiers.includes(input.tier),
  );

  const isEuInstitution = orgType === 'eu-institution';
  const isSmeOrStartup = orgType === 'sme' || orgType === 'startup';

  const penalties: PenaltyTier[] = applicablePenalties.map((p) => {
    const maxFineFixed = p.maxFineEur;
    const maxFineTurnover =
      input.annualTurnoverEur != null
        ? Math.round((input.annualTurnoverEur * p.maxFineTurnoverPercent) / 100)
        : null;

    let effectiveMax: number;

    if (isEuInstitution) {
      effectiveMax = data.euInstitutionCap.maxFineEur;
    } else if (isSmeOrStartup) {
      // SME/startup: lower of the two amounts
      if (maxFineTurnover != null) {
        effectiveMax = Math.min(maxFineFixed, maxFineTurnover);
      } else {
        effectiveMax = maxFineFixed;
      }
    } else {
      // Large organization: higher of the two amounts
      if (maxFineTurnover != null) {
        effectiveMax = Math.max(maxFineFixed, maxFineTurnover);
      } else {
        effectiveMax = maxFineFixed;
      }
    }

    return {
      id: p.id,
      article: p.article,
      paragraph: p.paragraph,
      description: p.description,
      maxFineFixedEur: maxFineFixed,
      maxFineTurnoverEur: maxFineTurnover,
      effectiveMaxFineEur: effectiveMax,
      violationExamples: p.violationExamples,
    };
  });

  const maxExposure = penalties.length > 0
    ? Math.max(...penalties.map((p) => p.effectiveMaxFineEur))
    : 0;

  return {
    tier: input.tier,
    organizationType: orgType,
    penalties,
    maxExposureEur: maxExposure,
    smeReductionApplied: isSmeOrStartup,
    euInstitutionCapApplied: isEuInstitution,
    summary: formatExposureSummary(input.tier, maxExposure, orgType, penalties.length),
  };
}

/**
 * Format a penalty amount for human display.
 *
 * @param amountEur - Amount in EUR
 * @returns Formatted string like "EUR 15,000,000" or "EUR 7.5M"
 */
export function formatFineAmount(amountEur: number): string {
  if (amountEur >= 1_000_000) {
    const millions = amountEur / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? millions.toString()
      : millions.toFixed(1);
    return `EUR ${formatted}M`;
  }
  return `EUR ${amountEur.toLocaleString('en-US')}`;
}

function formatExposureSummary(
  tier: RiskTier,
  maxExposure: number,
  orgType: OrganizationType,
  penaltyCount: number,
): string {
  if (tier === 'minimal') {
    return 'Minimal risk AI systems have no specific obligations under the EU AI Act. No penalties apply for voluntary code compliance.';
  }

  if (penaltyCount === 0) {
    return `No specific penalty provisions apply to ${tier} AI systems.`;
  }

  const tierLabels: Record<RiskTier, string> = {
    prohibited: 'prohibited AI practices',
    'high-risk': 'high-risk AI system non-compliance',
    gpai: 'GPAI model non-compliance',
    'gpai-systemic': 'GPAI model with systemic risk non-compliance',
    limited: 'limited-risk transparency non-compliance',
    minimal: 'minimal risk',
  };

  const orgLabels: Record<OrganizationType, string> = {
    large: 'a large organization',
    sme: 'an SME (reduced fines apply)',
    startup: 'a startup (reduced fines apply)',
    'eu-institution': 'an EU institution (capped at EUR 1.5M)',
  };

  return `Maximum penalty exposure for ${tierLabels[tier]} as ${orgLabels[orgType]}: ${formatFineAmount(maxExposure)}. ` +
    `${penaltyCount} penalty categor${penaltyCount === 1 ? 'y' : 'ies'} applicable under Article 99.`;
}

function validatePenaltyInput(input: PenaltyInput): void {
  if (input == null || typeof input !== 'object') {
    throw new TypeError('calculatePenaltyExposure() requires a PenaltyInput object');
  }
  if (typeof input.tier !== 'string') {
    throw new TypeError('PenaltyInput.tier is required and must be a valid RiskTier string');
  }
  if (!RISK_TIERS.includes(input.tier as RiskTier)) {
    throw new RangeError(
      `PenaltyInput.tier must be one of: ${RISK_TIERS.join(', ')}. Got: '${input.tier}'`,
    );
  }
  if (input.annualTurnoverEur != null) {
    if (typeof input.annualTurnoverEur !== 'number' || !isFinite(input.annualTurnoverEur) || input.annualTurnoverEur < 0) {
      throw new TypeError('PenaltyInput.annualTurnoverEur must be a non-negative finite number');
    }
  }
}
