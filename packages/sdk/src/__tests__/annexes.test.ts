import { describe, it, expect } from 'vitest';
import { getAnnexes, getAnnex } from '../annexes/lookup.js';

describe('getAnnexes', () => {
  it('returns all 8 Annex III categories', () => {
    const annexes = getAnnexes();
    expect(annexes).toHaveLength(8);
  });

  it('categories are sorted by number', () => {
    const annexes = getAnnexes();
    for (let i = 1; i < annexes.length; i++) {
      expect(annexes[i]!.categoryNumber).toBeGreaterThan(annexes[i - 1]!.categoryNumber);
    }
  });

  it('every category has required fields', () => {
    for (const annex of getAnnexes()) {
      expect(typeof annex.categoryNumber).toBe('number');
      expect(annex.categoryNumber).toBeGreaterThanOrEqual(1);
      expect(annex.categoryNumber).toBeLessThanOrEqual(8);
      expect(typeof annex.category).toBe('string');
      expect(annex.category.length).toBeGreaterThan(0);
      expect(typeof annex.title).toBe('string');
      expect(annex.title.length).toBeGreaterThan(0);
      expect(Array.isArray(annex.items)).toBe(true);
      expect(annex.items.length).toBeGreaterThan(0);
    }
  });

  it('contains expected categories', () => {
    const categories = getAnnexes().map((a) => a.category);
    expect(categories).toContain('biometrics');
    expect(categories).toContain('critical-infrastructure');
    expect(categories).toContain('education');
    expect(categories).toContain('employment');
    expect(categories).toContain('essential-services');
    expect(categories).toContain('law-enforcement');
    expect(categories).toContain('migration');
    expect(categories).toContain('justice-democracy');
  });
});

describe('getAnnex', () => {
  it('returns a known category', () => {
    const employment = getAnnex('employment');
    expect(employment).not.toBeNull();
    expect(employment!.category).toBe('employment');
    expect(employment!.categoryNumber).toBe(4);
    expect(employment!.title.toLowerCase()).toContain('employment');
  });

  it('biometrics is category 1', () => {
    const bio = getAnnex('biometrics');
    expect(bio).not.toBeNull();
    expect(bio!.categoryNumber).toBe(1);
  });

  it('each category has specific items', () => {
    const education = getAnnex('education');
    expect(education).not.toBeNull();
    expect(education!.items.length).toBeGreaterThan(0);
    // Education items should mention things like admission, learning, etc.
    expect(education!.items.some((i) => i.toLowerCase().includes('education') || i.toLowerCase().includes('learning'))).toBe(true);
  });

  it('throws RangeError on invalid category', () => {
    expect(() => getAnnex('invalid' as any)).toThrow(RangeError);
  });

  it('throws RangeError on empty string', () => {
    expect(() => getAnnex('' as any)).toThrow(RangeError);
  });

  it('throws RangeError on non-string', () => {
    expect(() => getAnnex(123 as any)).toThrow(RangeError);
  });
});
