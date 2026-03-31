import { describe, it, expect } from 'vitest';
import { buildReasoning, formatTierSummary } from '../classifier/reasoning.js';
import type { ClassificationResult } from '../data/types.js';

function makeResult(overrides: Partial<ClassificationResult> = {}): ClassificationResult {
  return {
    tier: 'minimal',
    subTier: null,
    articles: [],
    obligations: [],
    openSourceExemption: false,
    conformityAssessment: 'none',
    enforcementDate: '2026-08-02',
    reasoning: ['Step 1', 'Step 2'],
    ...overrides,
  };
}

describe('buildReasoning', () => {
  it('formats reasoning steps with numbered lines', () => {
    const result = buildReasoning(makeResult({ reasoning: ['A', 'B', 'C'] }));
    expect(result).toContain('Classification Reasoning:');
    expect(result).toContain('1. A');
    expect(result).toContain('2. B');
    expect(result).toContain('3. C');
  });

  it('handles empty reasoning', () => {
    const result = buildReasoning(makeResult({ reasoning: [] }));
    expect(result).toContain('Classification Reasoning:');
  });
});

describe('formatTierSummary', () => {
  it('returns plain label for minimal', () => {
    expect(formatTierSummary(makeResult())).toBe('Minimal Risk');
  });

  it('returns plain label for prohibited', () => {
    expect(formatTierSummary(makeResult({ tier: 'prohibited' }))).toBe('Prohibited');
  });

  it('returns GPAI with qualifier for open source', () => {
    const result = formatTierSummary(makeResult({
      tier: 'gpai',
      subTier: 'gpai-open-source',
    }));
    expect(result).toBe('GPAI (Open Source — reduced obligations)');
  });

  it('returns High-Risk with Annex III qualifier', () => {
    const result = formatTierSummary(makeResult({
      tier: 'high-risk',
      subTier: 'high-risk-annex-iii-employment',
    }));
    expect(result).toBe('High-Risk (Annex III — Employment)');
  });

  it('returns High-Risk with Annex I qualifier', () => {
    const result = formatTierSummary(makeResult({
      tier: 'high-risk',
      subTier: 'high-risk-annex-i',
    }));
    expect(result).toBe('High-Risk (Annex I — Safety Component)');
  });

  it('returns label without parenthetical for unknown subTier', () => {
    const result = formatTierSummary(makeResult({
      tier: 'high-risk',
      subTier: 'some-unknown-sub-tier',
    }));
    expect(result).toBe('High-Risk');
  });

  it('returns GPAI with Systemic Risk label', () => {
    expect(formatTierSummary(makeResult({ tier: 'gpai-systemic' }))).toBe('GPAI with Systemic Risk');
  });

  it('returns Limited Risk label', () => {
    expect(formatTierSummary(makeResult({ tier: 'limited' }))).toBe('Limited Risk');
  });
});
