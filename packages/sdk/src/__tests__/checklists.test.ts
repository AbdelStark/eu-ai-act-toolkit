import { describe, it, expect } from 'vitest';
import { getChecklist } from '../checklists/generator.js';
import { calculateScore, countProgress } from '../checklists/scoring.js';
import type { RiskTier, ChecklistItem, ChecklistProgress } from '../data/types.js';
import { RISK_TIERS } from '../data/types.js';

// ---------------------------------------------------------------------------
// getChecklist
// ---------------------------------------------------------------------------
describe('getChecklist', () => {
  it('throws TypeError on null input', () => {
    expect(() => getChecklist(null as unknown as RiskTier)).toThrow(TypeError);
  });

  it('throws TypeError on undefined input', () => {
    expect(() => getChecklist(undefined as unknown as RiskTier)).toThrow(TypeError);
  });

  it('throws RangeError on invalid tier string', () => {
    expect(() => getChecklist('invalid' as RiskTier)).toThrow(RangeError);
    expect(() => getChecklist('invalid' as RiskTier)).toThrow(/Invalid risk tier/);
  });

  for (const tier of RISK_TIERS) {
    it(`returns a valid checklist for tier '${tier}'`, () => {
      const checklist = getChecklist(tier);
      expect(checklist.tier).toBe(tier);
      expect(checklist.completionRate).toBe(0);
      expect(Array.isArray(checklist.items)).toBe(true);
    });
  }

  it('high-risk checklist has substantial items', () => {
    const checklist = getChecklist('high-risk');
    expect(checklist.items.length).toBeGreaterThan(20);
  });

  it('every checklist item has required structure', () => {
    const checklist = getChecklist('high-risk');
    for (const item of checklist.items) {
      expect(item.id).toBeTruthy();
      expect(typeof item.id).toBe('string');
      expect(typeof item.article).toBe('number');
      expect(item.article).toBeGreaterThan(0);
      expect(typeof item.text).toBe('string');
      expect(item.text.length).toBeGreaterThan(0);
      expect(typeof item.description).toBe('string');
      expect(typeof item.required).toBe('boolean');
      expect(typeof item.category).toBe('string');
      expect(item.checked).toBe(false);
    }
  });

  it('checklist item IDs are unique within a tier', () => {
    for (const tier of RISK_TIERS) {
      const checklist = getChecklist(tier);
      const ids = checklist.items.map(i => i.id);
      const unique = new Set(ids);
      expect(ids.length).toBe(unique.size);
    }
  });

  it('prohibited tier has minimal items', () => {
    const checklist = getChecklist('prohibited');
    expect(checklist.items.length).toBeLessThan(10);
  });

  it('every non-minimal item cites a specific article', () => {
    for (const tier of RISK_TIERS) {
      if (tier === 'minimal') continue; // minimal items may have null articles (voluntary)
      const checklist = getChecklist(tier);
      for (const item of checklist.items) {
        expect(item.article).toBeGreaterThan(0);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// calculateScore
// ---------------------------------------------------------------------------
describe('calculateScore', () => {
  const items: ChecklistItem[] = [
    { id: 'a', article: 9, paragraph: null, text: 'A', description: '', required: true, category: 'risk-management', checked: false },
    { id: 'b', article: 10, paragraph: null, text: 'B', description: '', required: true, category: 'data-governance', checked: false },
    { id: 'c', article: 11, paragraph: null, text: 'C', description: '', required: false, category: 'documentation', checked: false },
    { id: 'd', article: 12, paragraph: null, text: 'D', description: '', required: true, category: 'record-keeping', checked: false },
  ];

  it('returns 0 for empty items', () => {
    expect(calculateScore([], {})).toBe(0);
  });

  it('returns 0 when nothing is checked', () => {
    expect(calculateScore(items, {})).toBe(0);
  });

  it('returns correct score for partial completion', () => {
    const progress: Record<string, ChecklistProgress> = {
      a: { checked: true, evidence: null, checkedAt: '2025-01-01T00:00:00Z' },
      b: { checked: true, evidence: null, checkedAt: '2025-01-01T00:00:00Z' },
    };
    expect(calculateScore(items, progress)).toBe(0.5);
  });

  it('returns 1 when all items are checked', () => {
    const progress: Record<string, ChecklistProgress> = {
      a: { checked: true, evidence: null, checkedAt: null },
      b: { checked: true, evidence: null, checkedAt: null },
      c: { checked: true, evidence: null, checkedAt: null },
      d: { checked: true, evidence: null, checkedAt: null },
    };
    expect(calculateScore(items, progress)).toBe(1);
  });

  it('ignores progress entries for unknown item IDs', () => {
    const progress: Record<string, ChecklistProgress> = {
      unknown: { checked: true, evidence: null, checkedAt: null },
    };
    expect(calculateScore(items, progress)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// countProgress
// ---------------------------------------------------------------------------
describe('countProgress', () => {
  const items: ChecklistItem[] = [
    { id: 'x', article: 9, paragraph: null, text: 'X', description: '', required: true, category: 'risk-management', checked: false },
    { id: 'y', article: 10, paragraph: null, text: 'Y', description: '', required: true, category: 'data-governance', checked: false },
    { id: 'z', article: 11, paragraph: null, text: 'Z', description: '', required: false, category: 'documentation', checked: false },
  ];

  it('returns zeros for empty items', () => {
    const result = countProgress([], {});
    expect(result).toEqual({ completed: 0, total: 0, percent: 0 });
  });

  it('returns correct counts for partial completion', () => {
    const progress: Record<string, ChecklistProgress> = {
      x: { checked: true, evidence: null, checkedAt: null },
    };
    const result = countProgress(items, progress);
    expect(result.completed).toBe(1);
    expect(result.total).toBe(3);
    expect(result.percent).toBe(33);
  });

  it('returns 100% when all complete', () => {
    const progress: Record<string, ChecklistProgress> = {
      x: { checked: true, evidence: null, checkedAt: null },
      y: { checked: true, evidence: null, checkedAt: null },
      z: { checked: true, evidence: null, checkedAt: null },
    };
    const result = countProgress(items, progress);
    expect(result.percent).toBe(100);
  });
});
