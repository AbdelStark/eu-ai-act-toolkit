import type { QuestionStep } from '../data/types.js';
import { getQuestionsData } from '../data/loader.js';

/**
 * Get the classification question tree for interactive wizards.
 *
 * Returns the complete question tree used by the CLI and web app
 * classification wizards. Questions are organized into steps matching
 * the classification precedence: prohibited → GPAI → high-risk → limited.
 *
 * Each question includes article references, help text, and optional
 * branching logic for short-circuiting the classification when a
 * definitive answer is reached.
 *
 * @returns Array of question steps in classification order
 *
 * @example
 * ```typescript
 * const steps = getQuestions();
 * for (const step of steps) {
 *   console.log(step.title); // "Prohibited Practices", "GPAI Assessment", etc.
 *   for (const q of step.questions) {
 *     console.log(q.text); // The question to ask the user
 *   }
 * }
 * ```
 */
export function getQuestions(): QuestionStep[] {
  return getQuestionsData();
}
