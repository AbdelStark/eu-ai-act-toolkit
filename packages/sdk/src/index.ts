/**
 * @eu-ai-act/sdk — EU AI Act Compliance Toolkit SDK
 *
 * TypeScript library for programmatic risk classification, checklist
 * retrieval, enforcement timeline, and compliance documentation
 * generation under Regulation (EU) 2024/1689.
 *
 * **DISCLAIMER**: This SDK does not constitute legal advice. Consult
 * qualified legal counsel for compliance decisions.
 *
 * @example
 * ```typescript
 * import { classify, getChecklist, getTimeline } from '@eu-ai-act/sdk';
 *
 * const result = classify({ ...mySystemInputs });
 * const checklist = getChecklist(result.tier);
 * const timeline = getTimeline();
 * ```
 *
 * @packageDocumentation
 */

// -- Public API Functions --

/**
 * Classify an AI system's risk tier under the EU AI Act.
 *
 * Pure, synchronous, deterministic function. The same input always
 * produces the same output. Classification follows strict precedence:
 * prohibited > GPAI > high-risk > limited > minimal.
 *
 * @see {@link ClassificationInput} for input shape
 * @see {@link ClassificationResult} for output shape
 */
export { classify } from './classifier/engine.js';

/**
 * Get the interactive classification question tree.
 *
 * Returns question steps matching the classification precedence order,
 * suitable for building wizard-style UIs.
 *
 * @see {@link QuestionStep} for the returned data shape
 */
export { getQuestions } from './classifier/questions.js';

/**
 * Build a human-readable reasoning summary from a classification result.
 *
 * Generates a formatted multi-line string showing each classification
 * step and whether it triggered or was skipped.
 */
export { buildReasoning } from './classifier/reasoning.js';

/**
 * Format a classification result as a concise one-line summary.
 *
 * @example
 * ```typescript
 * formatTierSummary(result); // "High-Risk (Annex III — Employment)"
 * ```
 */
export { formatTierSummary } from './classifier/reasoning.js';

/**
 * Get the compliance checklist for a given risk tier.
 *
 * Returns all checklist items with article references, descriptions,
 * and required/optional status. Completion tracking is the consumer's
 * responsibility.
 *
 * @see {@link Checklist} for the returned data shape
 */
export { getChecklist } from './checklists/generator.js';

/**
 * Calculate a compliance completion score (0 to 1) from checklist items
 * and user progress state.
 */
export { calculateScore } from './checklists/scoring.js';

/**
 * Count completed vs total checklist items for display.
 *
 * @returns `{ completed, total, percent }` object
 */
export { countProgress } from './checklists/scoring.js';

/**
 * Get the EU AI Act enforcement timeline with computed status.
 *
 * Each event includes `status` ('past' | 'upcoming' | 'future') and
 * `daysUntil` computed relative to the reference date (defaults to now).
 *
 * @see {@link TimelineEvent} for the returned data shape
 */
export { getTimeline } from './timeline/events.js';

/**
 * Generate a compliance documentation template as Markdown.
 *
 * Produces a Markdown string with system details interpolated and
 * `[TODO]` placeholders for fields the user must complete.
 *
 * @see {@link TemplateName} for available template types
 * @see {@link TemplateInput} for required input fields
 */
export { generateTemplate } from './templates/renderer.js';

/**
 * Get all EU AI Act article references, sorted by article number.
 */
export { getArticles } from './articles/lookup.js';

/**
 * Get a specific article by its number.
 * Returns null if the article is not in the index.
 */
export { getArticle } from './articles/lookup.js';

/**
 * Get all articles applicable to a given risk tier.
 */
export { getArticlesByTier } from './articles/lookup.js';

/**
 * Get all Annex III high-risk use case categories.
 */
export { getAnnexes } from './annexes/lookup.js';

/**
 * Get a specific Annex III category by its identifier.
 * Returns null if the category is not found.
 */
export { getAnnex } from './annexes/lookup.js';

/**
 * Get all worked classification examples.
 * Pre-configured AI system scenarios with inputs, expected tiers, and walkthroughs.
 */
export { getExamples } from './examples/loader.js';

/**
 * Get a specific worked example by its URL-safe slug.
 * Returns null if not found.
 */
export { getExampleBySlug } from './examples/loader.js';

/**
 * Validate all worked examples against the classification engine.
 * Useful for regression testing and data integrity checks.
 */
export { validateExamples } from './examples/loader.js';

/**
 * Generate a comprehensive compliance report as Markdown.
 *
 * Combines classification results, checklist status, applicable articles,
 * and enforcement timeline into a single document.
 */
export { generateReport } from './reports/generator.js';

/**
 * Get all penalty tiers defined in the EU AI Act (Article 99).
 */
export { getPenalties } from './penalties/calculator.js';

/**
 * Get penalty tiers applicable to a specific risk tier.
 */
export { getPenaltiesByTier } from './penalties/calculator.js';

/**
 * Calculate penalty exposure for an AI system based on risk tier
 * and organization characteristics.
 */
export { calculatePenaltyExposure } from './penalties/calculator.js';

/**
 * Format a penalty amount for human display (e.g., "EUR 15M").
 */
export { formatFineAmount } from './penalties/calculator.js';

/**
 * Perform a comprehensive compliance gap analysis.
 *
 * Analyzes checklist completion against obligations for a risk tier,
 * computing priority scoring, deadline urgency, fine exposure,
 * and remediation recommendations.
 */
export { analyzeGaps } from './gap-analysis/analyzer.js';

/**
 * Get a quick compliance readiness score without full gap analysis.
 */
export { getReadinessScore } from './gap-analysis/analyzer.js';

/**
 * Get all harmonised and relevant standards mapped to EU AI Act requirements.
 */
export { getStandards } from './standards/lookup.js';

/**
 * Get a specific standard by its ID.
 */
export { getStandard } from './standards/lookup.js';

/**
 * Get standards applicable to a specific risk tier.
 */
export { getStandardsByTier } from './standards/lookup.js';

/**
 * Get standards that map to a specific EU AI Act article.
 */
export { getStandardsByArticle } from './standards/lookup.js';

/**
 * Get standards that cover a specific obligation category.
 */
export { getStandardsByCategory } from './standards/lookup.js';

/**
 * Get a complete mapping of obligation categories to applicable standards.
 */
export { getStandardsMapping } from './standards/lookup.js';

/**
 * Get only published standards (excluding in-development/draft).
 */
export { getPublishedStandards } from './standards/lookup.js';

/**
 * Get standards currently under development by CEN/CENELEC JTC 21.
 */
export { getInDevelopmentStandards } from './standards/lookup.js';

// -- Public Types --
export type {
  RiskTier,
  AnnexIIICategory,
  ObligationCategory,
  TemplateName,
  ConformityAssessment,
  TimelineStatus,
  ClassificationInput,
  ClassificationResult,
  Obligation,
  Checklist,
  ChecklistItem,
  ChecklistProgress,
  TimelineEvent,
  TemplateInput,
  QuestionStep,
  Question,
  WorkedExample,
  StateFile,
} from './data/types.js';

export type { ArticleReference } from './articles/lookup.js';
export type { AnnexIIIDetail } from './annexes/lookup.js';
export type { ExampleValidationResult } from './examples/loader.js';
export type { ReportOptions } from './reports/generator.js';
export type {
  OrganizationType,
  PenaltyInput,
  PenaltyTier,
  PenaltyExposure,
  PenaltySummary,
} from './penalties/calculator.js';
export type {
  GapPriority,
  ComplianceGap,
  CategoryGapSummary,
  GapAnalysisInput,
  GapAnalysisResult,
} from './gap-analysis/analyzer.js';
export type {
  Standard,
  StandardsMapping,
} from './standards/lookup.js';

// -- Constants --

/**
 * All valid risk tier values: `['prohibited', 'high-risk', 'gpai', 'gpai-systemic', 'limited', 'minimal']`.
 * Use for runtime validation of user input.
 */
export { RISK_TIERS } from './data/types.js';

/**
 * All valid Annex III category values.
 * Use for runtime validation and populating category dropdowns.
 */
export { ANNEX_III_CATEGORIES } from './data/types.js';

/**
 * All valid template name values.
 * Use for runtime validation and populating template selection UIs.
 */
export { TEMPLATE_NAMES } from './data/types.js';

/**
 * All valid obligation category values.
 * Use for grouping/filtering obligations and checklist items.
 */
export { OBLIGATION_CATEGORIES } from './data/types.js';
