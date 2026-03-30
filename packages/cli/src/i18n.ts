import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Resolves the path to the monorepo locales directory.
 * From packages/cli/src/ we go up three levels to reach the repo root.
 */
const LOCALES_DIR = resolve(__dirname, '..', '..', '..', 'locales', 'en');

/** Cached locale data, loaded lazily on first access. */
let localeData: Record<string, unknown> | null = null;

/**
 * Load all locale JSON files from locales/en/ and merge them
 * into a single nested object keyed by filename (without extension).
 *
 * Result shape:
 * {
 *   common: { disclaimer: "...", tiers: { ... }, ... },
 *   classifier: { title: "...", steps: { ... }, ... },
 *   checklists: { title: "...", filters: { ... }, ... },
 *   cli: { program: { ... }, commands: { ... }, ... },
 * }
 */
function loadLocales(): Record<string, unknown> {
  if (localeData) return localeData;

  const files = ['common', 'classifier', 'checklists', 'cli'] as const;
  const merged: Record<string, unknown> = {};

  for (const file of files) {
    const filePath = resolve(LOCALES_DIR, `${file}.json`);
    try {
      const content = readFileSync(filePath, 'utf-8');
      merged[file] = JSON.parse(content);
    } catch {
      // If a locale file is missing, use an empty object
      merged[file] = {};
    }
  }

  localeData = merged;
  return merged;
}

/**
 * Look up a translation string by dotted key path.
 *
 * @param key - Dotted path like "common.disclaimer" or "common.tiers.high-risk"
 * @param params - Optional interpolation params, e.g. { days: 42 }
 * @returns The resolved string, or the key itself if not found
 *
 * @example
 * ```ts
 * t('common.disclaimer')
 * // => "This tool does not constitute legal advice..."
 *
 * t('common.tiers.high-risk')
 * // => "High-Risk"
 *
 * t('common.enforcement.daysUntil', { days: 42 })
 * // => "42 days remaining"
 * ```
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const data = loadLocales();
  const parts = key.split('.');

  let current: unknown = data;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return key;
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current !== 'string') {
    return key;
  }

  // Interpolate {param} placeholders
  if (params) {
    let result = current;
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(
        new RegExp(`\\{${paramKey}\\}`, 'g'),
        String(paramValue),
      );
    }
    return result;
  }

  return current;
}

/**
 * Get a nested section of the locale data.
 *
 * @param prefix - Dotted path to a section, e.g. "cli.commands"
 * @returns The nested object, or undefined if not found
 *
 * @example
 * ```ts
 * const commands = getSection('cli.commands');
 * // => { classify: { description: "...", ... }, ... }
 * ```
 */
export function getSection(
  prefix: string,
): Record<string, unknown> | undefined {
  const data = loadLocales();
  const parts = prefix.split('.');

  let current: unknown = data;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (current != null && typeof current === 'object') {
    return current as Record<string, unknown>;
  }

  return undefined;
}

/**
 * Reset the cached locale data. Useful for testing.
 */
export function resetLocaleCache(): void {
  localeData = null;
}
