import { describe, it, expect } from 'vitest';
import {
  getPenalties,
  getPenaltiesByTier,
  calculatePenaltyExposure,
  formatFineAmount,
} from '../penalties/calculator.js';
import type { RiskTier } from '../data/types.js';

describe('getPenalties', () => {
  it('returns all penalty tiers sorted by severity', () => {
    const penalties = getPenalties();
    expect(penalties.length).toBeGreaterThanOrEqual(3);
    // Should be sorted by maxFineEur descending
    for (let i = 1; i < penalties.length; i++) {
      expect(penalties[i - 1]!.maxFineEur).toBeGreaterThanOrEqual(penalties[i]!.maxFineEur);
    }
  });

  it('includes the prohibited practices penalty (EUR 35M / 7%)', () => {
    const penalties = getPenalties();
    const prohibited = penalties.find((p) => p.id === 'prohibited-practices');
    expect(prohibited).toBeDefined();
    expect(prohibited!.maxFineEur).toBe(35_000_000);
    expect(prohibited!.maxFineTurnoverPercent).toBe(7);
    expect(prohibited!.applicableTiers).toContain('prohibited');
  });

  it('includes the high-risk non-compliance penalty (EUR 15M / 3%)', () => {
    const penalties = getPenalties();
    const highRisk = penalties.find((p) => p.id === 'high-risk-non-compliance');
    expect(highRisk).toBeDefined();
    expect(highRisk!.maxFineEur).toBe(15_000_000);
    expect(highRisk!.maxFineTurnoverPercent).toBe(3);
  });

  it('includes the incorrect-information penalty (EUR 7.5M / 1%)', () => {
    const penalties = getPenalties();
    const incorrect = penalties.find((p) => p.id === 'incorrect-information');
    expect(incorrect).toBeDefined();
    expect(incorrect!.maxFineEur).toBe(7_500_000);
    expect(incorrect!.maxFineTurnoverPercent).toBe(1);
  });

  it('every penalty references Article 99', () => {
    const penalties = getPenalties();
    for (const p of penalties) {
      expect(p.article).toBe(99);
    }
  });
});

describe('getPenaltiesByTier', () => {
  it('returns prohibited-practices penalty for prohibited tier', () => {
    const penalties = getPenaltiesByTier('prohibited');
    expect(penalties.length).toBeGreaterThanOrEqual(1);
    expect(penalties.some((p) => p.id === 'prohibited-practices')).toBe(true);
  });

  it('returns high-risk and incorrect-info penalties for high-risk tier', () => {
    const penalties = getPenaltiesByTier('high-risk');
    expect(penalties.some((p) => p.id === 'high-risk-non-compliance')).toBe(true);
    expect(penalties.some((p) => p.id === 'incorrect-information')).toBe(true);
  });

  it('returns GPAI penalties for gpai tier', () => {
    const penalties = getPenaltiesByTier('gpai');
    expect(penalties.some((p) => p.id === 'gpai-non-compliance')).toBe(true);
  });

  it('returns limited-risk penalties for limited tier', () => {
    const penalties = getPenaltiesByTier('limited');
    expect(penalties.some((p) => p.id === 'limited-risk-non-compliance')).toBe(true);
  });

  it('returns empty for minimal tier (no penalties)', () => {
    const penalties = getPenaltiesByTier('minimal');
    expect(penalties).toEqual([]);
  });
});

describe('calculatePenaltyExposure', () => {
  it('calculates exposure for a large organization — prohibited tier', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'prohibited',
      annualTurnoverEur: 1_000_000_000,
      organizationType: 'large',
    });
    expect(exposure.tier).toBe('prohibited');
    expect(exposure.organizationType).toBe('large');
    // 7% of 1B = 70M > 35M, so effective max = 70M
    expect(exposure.maxExposureEur).toBe(70_000_000);
    expect(exposure.smeReductionApplied).toBe(false);
    expect(exposure.euInstitutionCapApplied).toBe(false);
  });

  it('uses statutory fixed amount when turnover-based is lower', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'prohibited',
      annualTurnoverEur: 100_000_000, // 7% = 7M < 35M
      organizationType: 'large',
    });
    expect(exposure.maxExposureEur).toBe(35_000_000);
  });

  it('applies SME reduction (lower of two amounts)', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'prohibited',
      annualTurnoverEur: 1_000_000_000, // 7% = 70M > 35M
      organizationType: 'sme',
    });
    // SME gets the lower: min(35M, 70M) = 35M
    expect(exposure.maxExposureEur).toBe(35_000_000);
    expect(exposure.smeReductionApplied).toBe(true);
  });

  it('applies startup reduction same as SME', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'high-risk',
      annualTurnoverEur: 10_000_000, // 3% = 300K < 15M
      organizationType: 'startup',
    });
    // Startup gets lower: min(15M, 300K) = 300K
    expect(exposure.maxExposureEur).toBe(300_000);
    expect(exposure.smeReductionApplied).toBe(true);
  });

  it('applies EU institution cap at EUR 1.5M', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'high-risk',
      organizationType: 'eu-institution',
    });
    expect(exposure.maxExposureEur).toBe(1_500_000);
    expect(exposure.euInstitutionCapApplied).toBe(true);
  });

  it('defaults to large organization when type not specified', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'high-risk',
    });
    expect(exposure.organizationType).toBe('large');
    expect(exposure.maxExposureEur).toBe(15_000_000);
  });

  it('works without turnover (uses fixed amount)', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'high-risk',
      organizationType: 'large',
    });
    expect(exposure.maxExposureEur).toBe(15_000_000);
  });

  it('returns zero exposure for minimal tier', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'minimal',
    });
    expect(exposure.maxExposureEur).toBe(0);
    expect(exposure.penalties).toEqual([]);
  });

  it('includes violation examples in penalty details', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'high-risk',
    });
    for (const penalty of exposure.penalties) {
      expect(penalty.violationExamples.length).toBeGreaterThan(0);
    }
  });

  it('provides a human-readable summary', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'high-risk',
      annualTurnoverEur: 500_000_000,
      organizationType: 'large',
    });
    expect(exposure.summary).toContain('high-risk');
    expect(exposure.summary.length).toBeGreaterThan(0);
  });

  it('throws on null input', () => {
    expect(() => calculatePenaltyExposure(null as never)).toThrow(TypeError);
  });

  it('throws on negative turnover', () => {
    expect(() =>
      calculatePenaltyExposure({ tier: 'high-risk', annualTurnoverEur: -1 }),
    ).toThrow(TypeError);
  });

  it('handles gpai-systemic tier with multiple penalty categories', () => {
    const exposure = calculatePenaltyExposure({
      tier: 'gpai-systemic',
      annualTurnoverEur: 200_000_000,
    });
    expect(exposure.penalties.length).toBeGreaterThanOrEqual(2);
  });
});

describe('formatFineAmount', () => {
  it('formats millions correctly', () => {
    expect(formatFineAmount(35_000_000)).toBe('EUR 35M');
    expect(formatFineAmount(15_000_000)).toBe('EUR 15M');
    expect(formatFineAmount(7_500_000)).toBe('EUR 7.5M');
    expect(formatFineAmount(1_500_000)).toBe('EUR 1.5M');
  });

  it('formats sub-million amounts', () => {
    expect(formatFineAmount(500_000)).toBe('EUR 500,000');
    expect(formatFineAmount(300_000)).toBe('EUR 300,000');
  });

  it('formats zero', () => {
    expect(formatFineAmount(0)).toBe('EUR 0');
  });
});
