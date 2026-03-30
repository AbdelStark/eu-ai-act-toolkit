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
