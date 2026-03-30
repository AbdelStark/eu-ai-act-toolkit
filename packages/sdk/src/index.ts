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
 * @packageDocumentation
 */

// -- Public API Functions --
export { classify } from './classifier/engine.js';
export { getQuestions } from './classifier/questions.js';
export { buildReasoning, formatTierSummary } from './classifier/reasoning.js';
export { getChecklist } from './checklists/generator.js';
export { calculateScore, countProgress } from './checklists/scoring.js';
export { getTimeline } from './timeline/events.js';
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
export {
  RISK_TIERS,
  ANNEX_III_CATEGORIES,
  TEMPLATE_NAMES,
  OBLIGATION_CATEGORIES,
} from './data/types.js';
