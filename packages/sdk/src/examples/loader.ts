import type { RiskTier, WorkedExample } from '../data/types.js';
import { classify } from '../classifier/engine.js';
import { getExamplesData } from '../data/loader.js';

/**
 * Get all worked classification examples.
 *
 * Returns pre-configured AI system scenarios with classification inputs,
 * expected tiers, and step-by-step walkthrough explanations. Useful for
 * demos, documentation, and validating the classification engine.
 *
 * @returns Array of worked examples
 *
 * @example
 * ```typescript
 * const examples = getExamples();
 * for (const ex of examples) {
 *   console.log(`${ex.title}: expected ${ex.expectedTier}`);
 * }
 * ```
 */
export function getExamples(): WorkedExample[] {
  return getExamplesData().map((raw): WorkedExample => ({
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    classificationInput: raw.classificationInput,
    expectedTier: raw.expectedTier as RiskTier,
    walkthrough: raw.walkthrough,
  }));
}

/**
 * Get a specific worked example by its slug.
 *
 * @param slug - URL-safe identifier of the example (e.g., 'chatbot', 'hiring-tool')
 * @returns The worked example, or null if not found
 * @throws {TypeError} If slug is not a non-empty string
 *
 * @example
 * ```typescript
 * const ex = getExampleBySlug('hiring-tool');
 * // { slug: 'hiring-tool', title: 'AI-Powered Hiring Screener', ... }
 * ```
 */
export function getExampleBySlug(slug: string): WorkedExample | null {
  if (typeof slug !== 'string' || slug.length === 0) {
    throw new TypeError(
      `getExampleBySlug() requires a non-empty string slug, got ${String(slug)}`,
    );
  }

  return getExamples().find((ex) => ex.slug === slug) ?? null;
}

/**
 * Validation result for a worked example.
 */
export interface ExampleValidationResult {
  /** The example slug. */
  slug: string;

  /** Whether the classifier produced the expected tier. */
  pass: boolean;

  /** The expected risk tier from the example data. */
  expectedTier: RiskTier;

  /** The actual risk tier produced by the classifier. */
  actualTier: RiskTier;

  /** Classification reasoning steps. */
  reasoning: string[];
}

/**
 * Validate all worked examples against the classification engine.
 *
 * Runs each example's `classificationInput` through `classify()` and
 * checks whether the result matches `expectedTier`. Useful for
 * regression testing and data integrity validation.
 *
 * @returns Array of validation results, one per example
 *
 * @example
 * ```typescript
 * const results = validateExamples();
 * const allPass = results.every(r => r.pass);
 * console.log(allPass ? 'All examples valid' : 'Some examples failed');
 * ```
 */
export function validateExamples(): ExampleValidationResult[] {
  return getExamples().map((ex): ExampleValidationResult => {
    const result = classify(ex.classificationInput);
    return {
      slug: ex.slug,
      pass: result.tier === ex.expectedTier,
      expectedTier: ex.expectedTier,
      actualTier: result.tier,
      reasoning: result.reasoning,
    };
  });
}
