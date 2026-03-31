import { describe, it, expect } from 'vitest';
import {
  getStandards,
  getStandard,
  getStandardsByTier,
  getStandardsByArticle,
  getStandardsByCategory,
  getStandardsMapping,
  getPublishedStandards,
  getInDevelopmentStandards,
} from '../standards/lookup.js';
import { RISK_TIERS } from '../data/types.js';

describe('getStandards', () => {
  it('returns all standards', () => {
    const standards = getStandards();
    expect(standards.length).toBeGreaterThanOrEqual(10);
  });

  it('every standard has required fields', () => {
    for (const std of getStandards()) {
      expect(std.id).toBeTruthy();
      expect(std.name).toBeTruthy();
      expect(std.title).toBeTruthy();
      expect(std.organization).toBeTruthy();
      expect(['published', 'in-development', 'draft', 'withdrawn']).toContain(std.status);
      expect(std.description.length).toBeGreaterThan(0);
      expect(std.applicableArticles.length).toBeGreaterThan(0);
      expect(std.applicableTiers.length).toBeGreaterThan(0);
      expect(std.applicableCategories.length).toBeGreaterThan(0);
    }
  });

  it('standards are sorted by organization then name', () => {
    const standards = getStandards();
    for (let i = 1; i < standards.length; i++) {
      const prev = standards[i - 1]!;
      const curr = standards[i]!;
      const orgCmp = prev.organization.localeCompare(curr.organization);
      if (orgCmp === 0) {
        expect(prev.name.localeCompare(curr.name)).toBeLessThanOrEqual(0);
      }
    }
  });

  it('all applicable tiers reference valid risk tiers', () => {
    for (const std of getStandards()) {
      for (const tier of std.applicableTiers) {
        expect(RISK_TIERS).toContain(tier);
      }
    }
  });

  it('all applicable articles are positive integers', () => {
    for (const std of getStandards()) {
      for (const art of std.applicableArticles) {
        expect(art).toBeGreaterThan(0);
        expect(Number.isInteger(art)).toBe(true);
      }
    }
  });
});

describe('getStandard', () => {
  it('returns ISO 42001 by ID', () => {
    const std = getStandard('iso-42001');
    expect(std).not.toBeNull();
    expect(std!.name).toContain('42001');
    expect(std!.organization).toBe('ISO/IEC');
    expect(std!.status).toBe('published');
  });

  it('returns null for unknown ID', () => {
    expect(getStandard('nonexistent')).toBeNull();
  });

  it('throws TypeError on empty string', () => {
    expect(() => getStandard('')).toThrow(TypeError);
  });

  it('throws TypeError on non-string input', () => {
    expect(() => getStandard(123 as unknown as string)).toThrow(TypeError);
  });
});

describe('getStandardsByTier', () => {
  it('returns standards for high-risk tier', () => {
    const standards = getStandardsByTier('high-risk');
    expect(standards.length).toBeGreaterThan(0);
    for (const std of standards) {
      expect(std.applicableTiers).toContain('high-risk');
    }
  });

  it('returns standards for gpai-systemic tier', () => {
    const standards = getStandardsByTier('gpai-systemic');
    expect(standards.length).toBeGreaterThan(0);
  });

  it('returns fewer or no standards for minimal tier', () => {
    const standards = getStandardsByTier('minimal');
    expect(standards.length).toBe(0);
  });

  it('throws RangeError on invalid tier', () => {
    expect(() => getStandardsByTier('invalid' as any)).toThrow(RangeError);
    expect(() => getStandardsByTier('invalid' as any)).toThrow(/Invalid risk tier/);
  });

  it('throws RangeError on non-string input', () => {
    expect(() => getStandardsByTier(42 as unknown as any)).toThrow(RangeError);
  });
});

describe('getStandardsByArticle', () => {
  it('returns standards mapping to Article 9 (risk management)', () => {
    const standards = getStandardsByArticle(9);
    expect(standards.length).toBeGreaterThan(0);
    for (const std of standards) {
      expect(std.applicableArticles).toContain(9);
    }
  });

  it('returns standards mapping to Article 15 (accuracy/robustness)', () => {
    const standards = getStandardsByArticle(15);
    expect(standards.length).toBeGreaterThan(0);
  });

  it('returns empty for article with no mapped standards', () => {
    const standards = getStandardsByArticle(999);
    expect(standards).toEqual([]);
  });

  it('throws TypeError on non-integer', () => {
    expect(() => getStandardsByArticle(9.5)).toThrow(TypeError);
  });

  it('throws TypeError on zero', () => {
    expect(() => getStandardsByArticle(0)).toThrow(TypeError);
  });

  it('throws TypeError on negative number', () => {
    expect(() => getStandardsByArticle(-1)).toThrow(TypeError);
  });
});

describe('getStandardsByCategory', () => {
  it('returns standards for risk-management category', () => {
    const standards = getStandardsByCategory('risk-management');
    expect(standards.length).toBeGreaterThan(0);
    for (const std of standards) {
      expect(std.applicableCategories).toContain('risk-management');
    }
  });

  it('returns standards for documentation category', () => {
    const standards = getStandardsByCategory('documentation');
    expect(standards.length).toBeGreaterThan(0);
  });

  it('returns empty for unknown category', () => {
    expect(getStandardsByCategory('nonexistent')).toEqual([]);
  });

  it('throws TypeError on empty string', () => {
    expect(() => getStandardsByCategory('')).toThrow(TypeError);
  });

  it('throws TypeError on non-string input', () => {
    expect(() => getStandardsByCategory(null as unknown as string)).toThrow(TypeError);
  });
});

describe('getStandardsMapping', () => {
  it('returns category-to-standards mapping', () => {
    const mapping = getStandardsMapping();
    expect(mapping.length).toBeGreaterThan(0);

    for (const entry of mapping) {
      expect(entry.category).toBeTruthy();
      expect(entry.standards.length).toBeGreaterThan(0);
      expect(entry.publishedCount + entry.inDevelopmentCount).toBeLessThanOrEqual(
        entry.standards.length,
      );
    }
  });

  it('returns filtered mapping for specific tier', () => {
    const allMapping = getStandardsMapping();
    const highRiskMapping = getStandardsMapping('high-risk');

    // High-risk should have categories but possibly fewer than all tiers combined
    expect(highRiskMapping.length).toBeGreaterThan(0);

    for (const entry of highRiskMapping) {
      for (const std of entry.standards) {
        expect(std.applicableTiers).toContain('high-risk');
      }
    }
  });

  it('has no duplicate standards within a category', () => {
    const mapping = getStandardsMapping();
    for (const entry of mapping) {
      const ids = entry.standards.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('mapping categories are sorted alphabetically', () => {
    const mapping = getStandardsMapping();
    for (let i = 1; i < mapping.length; i++) {
      expect(mapping[i - 1]!.category.localeCompare(mapping[i]!.category)).toBeLessThanOrEqual(0);
    }
  });
});

describe('getPublishedStandards', () => {
  it('returns only published standards', () => {
    const published = getPublishedStandards();
    expect(published.length).toBeGreaterThan(0);
    for (const std of published) {
      expect(std.status).toBe('published');
      expect(std.publicationDate).not.toBeNull();
    }
  });
});

describe('getInDevelopmentStandards', () => {
  it('returns only in-development standards', () => {
    const inDev = getInDevelopmentStandards();
    expect(inDev.length).toBeGreaterThan(0);
    for (const std of inDev) {
      expect(std.status).toBe('in-development');
    }
  });

  it('in-development standards are from CEN/CENELEC JTC 21', () => {
    for (const std of getInDevelopmentStandards()) {
      expect(std.organization).toContain('CEN');
    }
  });
});
