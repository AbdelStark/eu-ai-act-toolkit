import type { RiskTier } from '../data/types.js';
import { RISK_TIERS, assertValidTier } from '../data/types.js';
import { getArticlesData } from '../data/loader.js';
import type { Article } from '../data/loader.js';

/**
 * Normalized article reference with consistent field names.
 *
 * Transforms the raw JSON shape (`tiers`, `eurLexUrl`) into
 * the canonical SDK shape used by consumers.
 */
export interface ArticleReference {
  /** Article number in Regulation (EU) 2024/1689. */
  number: number;

  /** Official title of the article. */
  title: string;

  /** Summary text of the article's requirements. */
  summary: string;

  /** Risk tiers this article applies to. */
  applicableTiers: RiskTier[];

  /** EUR-Lex URL for the full article text, if available. */
  url: string | null;
}

/**
 * Normalize a raw Article from the data layer into an ArticleReference.
 *
 * The raw JSON uses `tiers` (which may contain `'all'`) and `eurLexUrl`,
 * while the SDK exposes `applicableTiers` (concrete tiers) and `url`.
 */
function normalize(raw: Article): ArticleReference {
  const rawWithTiers = raw as unknown as {
    number: number;
    title: string;
    summary: string;
    tiers?: (RiskTier | 'all')[];
    applicableTiers?: RiskTier[];
    eurLexUrl?: string;
    url?: string;
    crossReferences?: number[];
  };

  // Handle both possible shapes: `tiers` from JSON or `applicableTiers` from typed loader
  const rawTiers = rawWithTiers.tiers ?? rawWithTiers.applicableTiers ?? [];
  const applicableTiers: RiskTier[] = rawTiers.includes('all' as RiskTier | 'all')
    ? [...RISK_TIERS]
    : rawTiers.filter((t): t is RiskTier => t !== 'all');

  return {
    number: raw.number,
    title: raw.title,
    summary: raw.summary,
    applicableTiers,
    url: rawWithTiers.eurLexUrl ?? rawWithTiers.url ?? null,
  };
}

/**
 * Get all article references from the EU AI Act.
 *
 * Returns normalized article data sorted by article number.
 *
 * @returns Array of article references
 *
 * @example
 * ```typescript
 * const articles = getArticles();
 * console.log(articles.length); // number of indexed articles
 * ```
 */
export function getArticles(): ArticleReference[] {
  return getArticlesData().map(normalize).sort((a, b) => a.number - b.number);
}

/**
 * Get a specific article by its number.
 *
 * @param articleNumber - Article number in Regulation 2024/1689
 * @returns The article reference, or null if not found
 * @throws {TypeError} If articleNumber is not a positive integer
 *
 * @example
 * ```typescript
 * const art9 = getArticle(9);
 * // { number: 9, title: 'Risk management system', ... }
 * ```
 */
export function getArticle(articleNumber: number): ArticleReference | null {
  if (typeof articleNumber !== 'number' || !Number.isInteger(articleNumber) || articleNumber < 1) {
    throw new TypeError(
      `getArticle() requires a positive integer article number, got ${String(articleNumber)}`,
    );
  }

  const articles = getArticlesData();
  const raw = articles.find((a) => a.number === articleNumber);
  return raw ? normalize(raw) : null;
}

/**
 * Get all articles applicable to a given risk tier.
 *
 * Returns articles whose `tiers` field includes the given tier or `'all'`.
 *
 * @param tier - Risk tier to filter by
 * @returns Articles applicable to the tier, sorted by article number
 * @throws {RangeError} If tier is not a valid RiskTier
 *
 * @example
 * ```typescript
 * const highRiskArticles = getArticlesByTier('high-risk');
 * console.log(highRiskArticles.map(a => a.number)); // [6, 9, 10, 11, ...]
 * ```
 */
export function getArticlesByTier(tier: RiskTier): ArticleReference[] {
  assertValidTier(tier, 'getArticlesByTier() tier');

  return getArticles().filter((a) => a.applicableTiers.includes(tier));
}
