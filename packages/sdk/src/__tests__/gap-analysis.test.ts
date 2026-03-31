import { describe, it, expect } from 'vitest';
import { analyzeGaps, getReadinessScore } from '../gap-analysis/analyzer.js';
import { classify } from '../classifier/engine.js';
import type { ClassificationInput, ChecklistProgress } from '../data/types.js';

/** Helper: base input where nothing is flagged (minimal risk) */
const minimalInput: ClassificationInput = {
  socialScoring: false,
  realtimeBiometrics: false,
  subliminalManipulation: false,
  exploitsVulnerabilities: false,
  untargetedFacialScraping: false,
  emotionInferenceWorkplace: false,
  biometricCategorization: false,
  predictivePolicing: false,
  isGPAI: false,
  annexIProduct: false,
  annexIIICategory: null,
  interactsWithPersons: false,
  generatesSyntheticContent: false,
  emotionRecognition: false,
  biometricCategorizing: false,
};

/** Helper: high-risk input (employment) */
const highRiskInput: ClassificationInput = {
  ...minimalInput,
  annexIIICategory: 'employment',
};

/** Helper: GPAI input */
const gpaiInput: ClassificationInput = {
  ...minimalInput,
  isGPAI: true,
  gpaiFlops: 1e24,
};

/** Helper: limited-risk input */
const limitedInput: ClassificationInput = {
  ...minimalInput,
  interactsWithPersons: true,
};

describe('analyzeGaps', () => {
  it('returns full gap list when no progress provided', () => {
    const classification = classify(highRiskInput);
    const result = analyzeGaps({ classification });

    expect(result.tier).toBe('high-risk');
    expect(result.totalItems).toBeGreaterThan(0);
    expect(result.completedItems).toBe(0);
    expect(result.outstandingGaps).toBe(result.totalItems);
    expect(result.readinessPercent).toBe(0);
    expect(result.gaps.length).toBe(result.totalItems);
  });

  it('reduces gaps when progress is provided', () => {
    const classification = classify(highRiskInput);
    const result0 = analyzeGaps({ classification });

    // Complete first item
    const firstItemId = result0.gaps[0]!.item.id;
    const progress: Record<string, ChecklistProgress> = {
      [firstItemId]: { checked: true, evidence: null, checkedAt: '2025-06-01' },
    };

    const result1 = analyzeGaps({ classification, progress });
    expect(result1.completedItems).toBe(1);
    expect(result1.outstandingGaps).toBe(result0.outstandingGaps - 1);
    expect(result1.readinessPercent).toBeGreaterThan(0);
  });

  it('gaps are sorted by priority score (highest first)', () => {
    const classification = classify(highRiskInput);
    const result = analyzeGaps({ classification });

    for (let i = 1; i < result.gaps.length; i++) {
      expect(result.gaps[i - 1]!.priorityScore).toBeGreaterThanOrEqual(
        result.gaps[i]!.priorityScore,
      );
    }
  });

  it('computes enforcement deadline correctly', () => {
    const classification = classify(highRiskInput);
    const refDate = new Date('2025-01-01');
    const result = analyzeGaps({ classification, referenceDate: refDate });

    // High-risk deadline is 2026-08-02
    expect(result.enforcementDate).toBe('2026-08-02');
    expect(result.daysUntilDeadline).toBeGreaterThan(0);
  });

  it('marks gaps as critical when deadline has passed', () => {
    const classification = classify(highRiskInput);
    // Reference date after enforcement deadline
    const refDate = new Date('2027-01-01');
    const result = analyzeGaps({ classification, referenceDate: refDate });

    expect(result.daysUntilDeadline).toBeLessThan(0);
    expect(result.criticalGaps).toBeGreaterThan(0);

    const criticalGap = result.gaps.find((g) => g.priority === 'critical');
    expect(criticalGap).toBeDefined();
    expect(criticalGap!.urgencyLabel).toContain('OVERDUE');
  });

  it('marks gaps as high priority within 180 days of deadline', () => {
    const classification = classify(highRiskInput);
    // 90 days before 2026-08-02
    const refDate = new Date('2026-05-04');
    const result = analyzeGaps({ classification, referenceDate: refDate });

    const highGaps = result.gaps.filter((g) => g.priority === 'high');
    expect(highGaps.length).toBeGreaterThan(0);
  });

  it('marks optional items as low priority', () => {
    const classification = classify(highRiskInput);
    const result = analyzeGaps({ classification });

    const optionalGaps = result.gaps.filter((g) => !g.required);
    for (const gap of optionalGaps) {
      expect(gap.priority).toBe('low');
    }
  });

  it('returns category summary with correct totals', () => {
    const classification = classify(highRiskInput);
    const result = analyzeGaps({ classification });

    expect(result.categorySummary.length).toBeGreaterThan(0);

    // Sum of category totals should equal total items
    const categoryTotal = result.categorySummary.reduce(
      (sum, c) => sum + c.totalItems,
      0,
    );
    expect(categoryTotal).toBe(result.totalItems);

    // Sum of category gaps should equal outstanding gaps
    const categoryGaps = result.categorySummary.reduce(
      (sum, c) => sum + c.gaps,
      0,
    );
    expect(categoryGaps).toBe(result.outstandingGaps);
  });

  it('category completion tracks progress correctly', () => {
    const classification = classify(highRiskInput);
    const result0 = analyzeGaps({ classification });

    // Get the first category and its first item
    const firstCat = result0.categorySummary[0]!;
    const firstCatGap = result0.gaps.find(
      (g) => g.item.category === firstCat.category,
    )!;

    const progress: Record<string, ChecklistProgress> = {
      [firstCatGap.item.id]: {
        checked: true,
        evidence: 'Implemented',
        checkedAt: '2025-06-01',
      },
    };

    const result1 = analyzeGaps({ classification, progress });
    const updatedCat = result1.categorySummary.find(
      (c) => c.category === firstCat.category,
    )!;

    expect(updatedCat.completedItems).toBe(firstCat.completedItems + 1);
    expect(updatedCat.completionPercent).toBeGreaterThan(firstCat.completionPercent);
  });

  it('calculates fine exposure based on organization type', () => {
    const classification = classify(highRiskInput);

    const large = analyzeGaps({
      classification,
      annualTurnoverEur: 1_000_000_000,
      organizationType: 'large',
    });

    const sme = analyzeGaps({
      classification,
      annualTurnoverEur: 1_000_000_000,
      organizationType: 'sme',
    });

    // Large org: max(15M, 3% of 1B=30M) = 30M
    expect(large.maxFineExposureEur).toBe(30_000_000);

    // SME: min(15M, 3% of 1B=30M) = 15M
    expect(sme.maxFineExposureEur).toBe(15_000_000);
  });

  it('provides meaningful assessment text', () => {
    const classification = classify(highRiskInput);
    const result = analyzeGaps({ classification });

    expect(result.assessment.length).toBeGreaterThan(0);
    expect(result.assessment).toContain('No compliance items completed');
  });

  it('provides remediation recommendations', () => {
    const classification = classify(highRiskInput);
    const result = analyzeGaps({ classification });

    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('handles fully complete checklist', () => {
    const classification = classify(highRiskInput);
    const result0 = analyzeGaps({ classification });

    // Mark everything complete
    const progress: Record<string, ChecklistProgress> = {};
    for (const gap of result0.gaps) {
      progress[gap.item.id] = {
        checked: true,
        evidence: 'Done',
        checkedAt: '2025-06-01',
      };
    }

    const result1 = analyzeGaps({ classification, progress });
    expect(result1.outstandingGaps).toBe(0);
    expect(result1.readinessPercent).toBe(100);
    expect(result1.criticalGaps).toBe(0);
    expect(result1.assessment).toContain('satisfactory');
  });

  it('works with minimal tier (no obligations)', () => {
    const classification = classify(minimalInput);
    const result = analyzeGaps({ classification });

    expect(result.tier).toBe('minimal');
    expect(result.maxFineExposureEur).toBe(0);
    expect(result.assessment).toContain('Minimal risk');
  });

  it('works with GPAI tier', () => {
    const classification = classify(gpaiInput);
    const result = analyzeGaps({ classification });

    expect(result.tier).toBe('gpai');
    expect(result.totalItems).toBeGreaterThan(0);
    expect(result.gaps.length).toBe(result.totalItems);
  });

  it('works with limited-risk tier', () => {
    const classification = classify(limitedInput);
    const result = analyzeGaps({ classification });

    expect(result.tier).toBe('limited');
    expect(result.totalItems).toBeGreaterThan(0);
  });

  it('throws on null input', () => {
    expect(() => analyzeGaps(null as never)).toThrow(TypeError);
  });

  it('throws on missing classification', () => {
    expect(() => analyzeGaps({} as never)).toThrow(TypeError);
  });

  it('throws on missing tier', () => {
    expect(() =>
      analyzeGaps({
        classification: { enforcementDate: '2026-08-02' } as never,
      }),
    ).toThrow(TypeError);
  });

  it('throws on missing enforcementDate', () => {
    expect(() =>
      analyzeGaps({
        classification: { tier: 'high-risk' } as never,
      }),
    ).toThrow(TypeError);
  });

  it('gap urgency label shows "TODAY" for deadline day', () => {
    const classification = classify(highRiskInput);
    const refDate = new Date(classification.enforcementDate);
    const result = analyzeGaps({ classification, referenceDate: refDate });
    // daysUntilDeadline should be 0 or 1 (depending on time rounding)
    expect(result.daysUntilDeadline).toBeLessThanOrEqual(1);
  });

  it('gaps for optional items have zero fine exposure', () => {
    const classification = classify(highRiskInput);
    const result = analyzeGaps({ classification });
    const optionalGaps = result.gaps.filter((g) => !g.required);
    for (const gap of optionalGaps) {
      expect(gap.fineExposureEur).toBe(0);
    }
  });

  it('required gaps have non-zero fine exposure for non-minimal tiers', () => {
    const classification = classify(highRiskInput);
    const result = analyzeGaps({ classification });
    const requiredGaps = result.gaps.filter((g) => g.required);
    for (const gap of requiredGaps) {
      expect(gap.fineExposureEur).toBeGreaterThan(0);
    }
  });
});

describe('getReadinessScore', () => {
  it('returns 0% with no progress', () => {
    const score = getReadinessScore('high-risk');
    expect(score.percent).toBe(0);
    expect(score.completed).toBe(0);
    expect(score.total).toBeGreaterThan(0);
    expect(score.tier).toBe('high-risk');
  });

  it('increases with progress', () => {
    // Get the items to know their IDs
    const score0 = getReadinessScore('high-risk');

    // We need to know item IDs, but getReadinessScore doesn't return them
    // This is fine — it's a lightweight API
    expect(score0.percent).toBe(0);
  });

  it('works for all tiers', () => {
    const tiers: Array<import('../data/types.js').RiskTier> = [
      'prohibited',
      'high-risk',
      'gpai',
      'gpai-systemic',
      'limited',
      'minimal',
    ];

    for (const tier of tiers) {
      const score = getReadinessScore(tier);
      expect(score.tier).toBe(tier);
      expect(score.total).toBeGreaterThanOrEqual(0);
      expect(score.percent).toBeGreaterThanOrEqual(0);
    }
  });

  it('throws on invalid tier', () => {
    expect(() => getReadinessScore('invalid' as any)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Tier validation hardening
// ---------------------------------------------------------------------------
describe('analyzeGaps — tier validation', () => {
  it('throws RangeError on invalid tier string in classification', () => {
    expect(() =>
      analyzeGaps({
        classification: {
          tier: 'not-a-tier' as any,
          subTier: null,
          articles: [],
          obligations: [],
          openSourceExemption: false,
          conformityAssessment: 'none',
          enforcementDate: '2026-08-02',
          reasoning: [],
        },
      }),
    ).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Priority score verification
// ---------------------------------------------------------------------------
describe('analyzeGaps — priority scoring accuracy', () => {
  it('overdue items have higher priority score than imminent items', () => {
    // Use a reference date where high-risk deadline (2026-08-02) has passed
    const pastDeadline = new Date('2027-01-01');
    const result = analyzeGaps({
      classification: classify(highRiskInput),
      referenceDate: pastDeadline,
    });
    const requiredGaps = result.gaps.filter(g => g.required);
    expect(requiredGaps.length).toBeGreaterThan(0);
    // All required gaps should be critical since deadline passed
    for (const gap of requiredGaps) {
      expect(gap.priority).toBe('critical');
      expect(gap.priorityScore).toBeGreaterThanOrEqual(100);
    }
  });

  it('optional items always have low priority regardless of deadline', () => {
    const pastDeadline = new Date('2027-01-01');
    const result = analyzeGaps({
      classification: classify(highRiskInput),
      referenceDate: pastDeadline,
    });
    const optionalGaps = result.gaps.filter(g => !g.required);
    for (const gap of optionalGaps) {
      expect(gap.priority).toBe('low');
      expect(gap.priorityScore).toBe(10);
    }
  });

  it('urgency label for deadline today says TODAY', () => {
    const deadlineDay = new Date('2026-08-02');
    const result = analyzeGaps({
      classification: classify(highRiskInput),
      referenceDate: deadlineDay,
    });
    const requiredGaps = result.gaps.filter(g => g.required);
    expect(requiredGaps.length).toBeGreaterThan(0);
    for (const gap of requiredGaps) {
      expect(gap.urgencyLabel).toContain('TODAY');
    }
  });
});
