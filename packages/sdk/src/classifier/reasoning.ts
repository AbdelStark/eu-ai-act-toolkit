import type { ClassificationResult } from '../data/types.js';

/**
 * Build a human-readable reasoning summary from a classification result.
 *
 * Generates a formatted explanation suitable for display in the CLI or
 * web app result card. Each step shows whether it triggered (✓) or
 * was skipped (✗).
 *
 * @param result - The classification result containing the reasoning steps
 * @returns Formatted reasoning as a single string with newlines
 *
 * @example
 * ```typescript
 * const formatted = buildReasoning(result);
 * // "Classification Reasoning:\n  1. ✗ Not prohibited...\n  2. ✓ Annex III..."
 * ```
 */
export function buildReasoning(result: ClassificationResult): string {
  const lines = result.reasoning.map((step, i) => `  ${i + 1}. ${step}`);
  return `Classification Reasoning:\n${lines.join('\n')}`;
}

/**
 * Format a classification result as a concise summary string.
 *
 * @param result - The classification result
 * @returns A one-line summary (e.g., "High-Risk (Annex III — Employment)")
 */
export function formatTierSummary(result: ClassificationResult): string {
  const tierLabels: Record<string, string> = {
    prohibited: 'Prohibited',
    'high-risk': 'High-Risk',
    gpai: 'GPAI',
    'gpai-systemic': 'GPAI with Systemic Risk',
    limited: 'Limited Risk',
    minimal: 'Minimal Risk',
  };

  const label = tierLabels[result.tier] ?? result.tier;

  if (!result.subTier) return label;

  // Extract human-readable qualifier from subTier
  const qualifiers: Record<string, string> = {
    'gpai-open-source': 'Open Source — reduced obligations',
    'gpai-systemic-open-source': 'Systemic Risk, Open Source',
    'high-risk-annex-i': 'Annex I — Safety Component',
    'high-risk-annex-i-third-party': 'Annex I — Third-Party Assessment',
    'high-risk-annex-iii-biometrics': 'Annex III — Biometrics',
    'high-risk-annex-iii-critical-infrastructure': 'Annex III — Critical Infrastructure',
    'high-risk-annex-iii-education': 'Annex III — Education',
    'high-risk-annex-iii-employment': 'Annex III — Employment',
    'high-risk-annex-iii-essential-services': 'Annex III — Essential Services',
    'high-risk-annex-iii-law-enforcement': 'Annex III — Law Enforcement',
    'high-risk-annex-iii-migration': 'Annex III — Migration',
    'high-risk-annex-iii-justice-democracy': 'Annex III — Justice & Democracy',
  };

  const qualifier = qualifiers[result.subTier];
  return qualifier ? `${label} (${qualifier})` : label;
}
