import { describe, it, expect } from 'vitest';
import { getArticles, getArticle, getArticlesByTier } from '../articles/lookup.js';

describe('getArticles', () => {
  it('returns a non-empty array', () => {
    const articles = getArticles();
    expect(articles.length).toBeGreaterThan(0);
  });

  it('articles are sorted by number', () => {
    const articles = getArticles();
    for (let i = 1; i < articles.length; i++) {
      expect(articles[i]!.number).toBeGreaterThanOrEqual(articles[i - 1]!.number);
    }
  });

  it('every article has required fields', () => {
    for (const art of getArticles()) {
      expect(typeof art.number).toBe('number');
      expect(art.number).toBeGreaterThan(0);
      expect(typeof art.title).toBe('string');
      expect(art.title.length).toBeGreaterThan(0);
      expect(typeof art.summary).toBe('string');
      expect(art.summary.length).toBeGreaterThan(0);
      expect(Array.isArray(art.applicableTiers)).toBe(true);
      expect(art.applicableTiers.length).toBeGreaterThan(0);
    }
  });
});

describe('getArticle', () => {
  it('returns a known article', () => {
    const art5 = getArticle(5);
    expect(art5).not.toBeNull();
    expect(art5!.number).toBe(5);
    expect(art5!.title.toLowerCase()).toContain('prohibit');
  });

  it('returns null for unknown article number', () => {
    expect(getArticle(999)).toBeNull();
  });

  it('throws TypeError for non-integer', () => {
    expect(() => getArticle(5.5)).toThrow(TypeError);
  });

  it('throws TypeError for zero', () => {
    expect(() => getArticle(0)).toThrow(TypeError);
  });

  it('throws TypeError for negative', () => {
    expect(() => getArticle(-1)).toThrow(TypeError);
  });

  it('throws TypeError for NaN', () => {
    expect(() => getArticle(NaN)).toThrow(TypeError);
  });

  it('throws TypeError for non-number', () => {
    expect(() => getArticle('5' as unknown as number)).toThrow(TypeError);
  });

  it('returns article with url field', () => {
    const art = getArticle(5);
    // url can be string or null, but should be defined in our data
    expect(art).not.toBeNull();
    expect(art!.url === null || typeof art!.url === 'string').toBe(true);
  });
});

describe('getArticlesByTier', () => {
  it('returns articles for high-risk tier', () => {
    const articles = getArticlesByTier('high-risk');
    expect(articles.length).toBeGreaterThan(0);
    // Article 9 (risk management) should be in high-risk
    expect(articles.some((a) => a.number === 9)).toBe(true);
  });

  it('returns articles for prohibited tier', () => {
    const articles = getArticlesByTier('prohibited');
    expect(articles.some((a) => a.number === 5)).toBe(true);
  });

  it('returns articles for gpai tier', () => {
    const articles = getArticlesByTier('gpai');
    expect(articles.some((a) => a.number === 51 || a.number === 52 || a.number === 53)).toBe(true);
  });

  it('includes articles with "all" tiers for every tier', () => {
    const allTiers = ['prohibited', 'high-risk', 'gpai', 'gpai-systemic', 'limited', 'minimal'] as const;
    // Article 4 (AI literacy) applies to all tiers
    for (const tier of allTiers) {
      const articles = getArticlesByTier(tier);
      expect(articles.some((a) => a.number === 4)).toBe(true);
    }
  });

  it('throws RangeError on invalid tier', () => {
    expect(() => getArticlesByTier('invalid' as any)).toThrow(RangeError);
  });

  it('results are sorted by article number', () => {
    const articles = getArticlesByTier('high-risk');
    for (let i = 1; i < articles.length; i++) {
      expect(articles[i]!.number).toBeGreaterThanOrEqual(articles[i - 1]!.number);
    }
  });
});
