import type { AnnexIIICategory } from '../data/types.js';
import { ANNEX_III_CATEGORIES } from '../data/types.js';
import { getAnnexesData } from '../data/loader.js';

/**
 * Normalized Annex III category entry.
 *
 * Transforms the raw JSON shape (`category` as number, `id`, `items`)
 * into a consistent SDK shape with typed fields.
 */
export interface AnnexIIIDetail {
  /** Numeric category number (1-8) as listed in Annex III. */
  categoryNumber: number;

  /** Machine-readable category identifier. */
  category: AnnexIIICategory;

  /** Human-readable category title. */
  title: string;

  /** Specific AI system types listed as high-risk under this category. */
  items: string[];
}

/**
 * Normalize a raw annex entry from JSON into an AnnexIIIDetail.
 *
 * The JSON uses `category` (number), `id`, and `items` (string array),
 * while the loader type uses `categoryNumber`, `category`, `subItems`.
 * This handles both shapes.
 */
function normalize(raw: ReturnType<typeof getAnnexesData>[number]): AnnexIIIDetail {
  const rawAny = raw as unknown as {
    category?: number | string;
    categoryNumber?: number;
    id?: string;
    title: string;
    items?: string[];
    subItems?: { id: string; text: string }[];
    description?: string;
  };

  const categoryNumber = typeof rawAny.category === 'number'
    ? rawAny.category
    : rawAny.categoryNumber ?? 0;

  const categoryId = (typeof rawAny.id === 'string' ? rawAny.id : rawAny.category) as AnnexIIICategory;

  const items: string[] = rawAny.items
    ?? rawAny.subItems?.map((s) => s.text)
    ?? [];

  return {
    categoryNumber,
    category: categoryId,
    title: rawAny.title,
    items,
  };
}

/**
 * Get all Annex III high-risk use case categories.
 *
 * Returns the eight categories defined in Annex III of the EU AI Act,
 * each with its listed AI system types considered high-risk.
 *
 * @returns Array of Annex III categories sorted by category number
 *
 * @example
 * ```typescript
 * const annexes = getAnnexes();
 * console.log(annexes.map(a => a.title));
 * // ['Biometrics', 'Critical Infrastructure', ...]
 * ```
 */
export function getAnnexes(): AnnexIIIDetail[] {
  return getAnnexesData()
    .map(normalize)
    .sort((a, b) => a.categoryNumber - b.categoryNumber);
}

/**
 * Get a specific Annex III category by its identifier.
 *
 * @param category - Annex III category identifier
 * @returns The category detail, or null if not found
 * @throws {RangeError} If category is not a valid AnnexIIICategory
 *
 * @example
 * ```typescript
 * const employment = getAnnex('employment');
 * // { categoryNumber: 4, category: 'employment', title: 'Employment...', items: [...] }
 * ```
 */
export function getAnnex(category: AnnexIIICategory): AnnexIIIDetail | null {
  if (typeof category !== 'string' || !ANNEX_III_CATEGORIES.includes(category as AnnexIIICategory)) {
    throw new RangeError(
      `Invalid Annex III category: '${String(category)}'. Must be one of: ${ANNEX_III_CATEGORIES.join(', ')}`,
    );
  }

  const all = getAnnexes();
  return all.find((a) => a.category === category) ?? null;
}
