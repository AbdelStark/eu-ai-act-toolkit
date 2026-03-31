import type { RiskTier } from '../data/types.js';
import { RISK_TIERS } from '../data/types.js';
import { getStandardsData } from '../data/loader.js';

/**
 * A harmonised or relevant standard mapped to EU AI Act requirements.
 */
export interface Standard {
  /** Unique identifier. */
  id: string;

  /** Standard designation (e.g., "ISO/IEC 42001:2023"). */
  name: string;

  /** Full title. */
  title: string;

  /** Standards organization (ISO/IEC, CEN/CENELEC JTC 21, etc.). */
  organization: string;

  /** Publication status. */
  status: 'published' | 'in-development' | 'draft' | 'withdrawn';

  /** Publication date (ISO 8601), or null if not yet published. */
  publicationDate: string | null;

  /** Description of scope and relevance to EU AI Act compliance. */
  description: string;

  /** EU AI Act articles this standard maps to. */
  applicableArticles: number[];

  /** Risk tiers this standard is relevant to. */
  applicableTiers: RiskTier[];

  /** Obligation categories this standard covers. */
  applicableCategories: string[];

  /** URL to the standard's page, or null. */
  url: string | null;
}

/**
 * Mapping of a checklist obligation category to relevant standards.
 */
export interface StandardsMapping {
  /** The obligation category. */
  category: string;

  /** Standards that address this category. */
  standards: Standard[];

  /** Number of published standards available. */
  publishedCount: number;

  /** Number of standards in development. */
  inDevelopmentCount: number;
}

/**
 * Get all harmonised and relevant standards.
 *
 * Returns all standards in the mapping, sorted by organization
 * and name. Includes both published standards and those under
 * development by CEN/CENELEC JTC 21.
 *
 * @returns Array of all standards.
 */
export function getStandards(): Standard[] {
  return getStandardsData()
    .map((raw): Standard => ({
      id: raw.id,
      name: raw.name,
      title: raw.title,
      organization: raw.organization,
      status: raw.status,
      publicationDate: raw.publicationDate,
      description: raw.description,
      applicableArticles: raw.applicableArticles,
      applicableTiers: raw.applicableTiers,
      applicableCategories: raw.applicableCategories,
      url: raw.url,
    }))
    .sort((a, b) => a.organization.localeCompare(b.organization) || a.name.localeCompare(b.name));
}

/**
 * Get a specific standard by its ID.
 *
 * @param id - Standard identifier (e.g., "iso-42001")
 * @returns The standard, or null if not found.
 * @throws {TypeError} If id is not a non-empty string
 */
export function getStandard(id: string): Standard | null {
  if (typeof id !== 'string' || id.length === 0) {
    throw new TypeError(
      `getStandard() requires a non-empty string ID, got ${String(id)}`,
    );
  }
  return getStandards().find((s) => s.id === id) ?? null;
}

/**
 * Get all standards applicable to a specific risk tier.
 *
 * @param tier - Risk tier to filter by.
 * @returns Standards relevant to the given tier.
 * @throws {RangeError} If tier is not a valid RiskTier
 */
export function getStandardsByTier(tier: RiskTier): Standard[] {
  if (typeof tier !== 'string' || !RISK_TIERS.includes(tier as RiskTier)) {
    throw new RangeError(
      `Invalid risk tier: '${String(tier)}'. Must be one of: ${RISK_TIERS.join(', ')}`,
    );
  }
  return getStandards().filter((s) => s.applicableTiers.includes(tier));
}

/**
 * Get all standards that map to a specific EU AI Act article.
 *
 * @param articleNumber - Article number to look up.
 * @returns Standards that address the given article.
 * @throws {TypeError} If articleNumber is not a positive integer
 */
export function getStandardsByArticle(articleNumber: number): Standard[] {
  if (typeof articleNumber !== 'number' || !Number.isInteger(articleNumber) || articleNumber < 1) {
    throw new TypeError(
      `getStandardsByArticle() requires a positive integer article number, got ${String(articleNumber)}`,
    );
  }
  return getStandards().filter((s) => s.applicableArticles.includes(articleNumber));
}

/**
 * Get all standards that cover a specific obligation category.
 *
 * @param category - Obligation category (e.g., "risk-management").
 * @returns Standards addressing the given category.
 * @throws {TypeError} If category is not a non-empty string
 */
export function getStandardsByCategory(category: string): Standard[] {
  if (typeof category !== 'string' || category.length === 0) {
    throw new TypeError(
      `getStandardsByCategory() requires a non-empty string category, got ${String(category)}`,
    );
  }
  return getStandards().filter((s) => s.applicableCategories.includes(category));
}

/**
 * Get a complete mapping of obligation categories to applicable standards.
 *
 * Useful for generating a compliance matrix showing which standards
 * support each regulatory obligation area. Categories with no
 * mapped standards are omitted.
 *
 * @param tier - Optional risk tier to filter the mapping.
 * @returns Array of category-to-standards mappings, sorted by category.
 */
export function getStandardsMapping(tier?: RiskTier): StandardsMapping[] {
  const allStandards = tier ? getStandardsByTier(tier) : getStandards();

  // Group by category
  const categoryMap = new Map<string, Standard[]>();
  for (const std of allStandards) {
    for (const cat of std.applicableCategories) {
      const existing = categoryMap.get(cat) ?? [];
      // Avoid duplicates
      if (!existing.some((s) => s.id === std.id)) {
        existing.push(std);
      }
      categoryMap.set(cat, existing);
    }
  }

  return Array.from(categoryMap.entries())
    .map(([category, standards]): StandardsMapping => ({
      category,
      standards,
      publishedCount: standards.filter((s) => s.status === 'published').length,
      inDevelopmentCount: standards.filter((s) => s.status === 'in-development').length,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Get only published standards (excluding in-development/draft).
 *
 * @returns Array of published standards.
 */
export function getPublishedStandards(): Standard[] {
  return getStandards().filter((s) => s.status === 'published');
}

/**
 * Get standards currently under development.
 *
 * @returns Array of in-development standards.
 */
export function getInDevelopmentStandards(): Standard[] {
  return getStandards().filter((s) => s.status === 'in-development');
}
