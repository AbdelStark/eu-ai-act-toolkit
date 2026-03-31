/**
 * @module types
 *
 * Complete type system for the EU AI Act compliance toolkit SDK.
 * All types correspond to entities defined in Regulation (EU) 2024/1689.
 *
 * DISCLAIMER: This type system does not constitute legal advice.
 * Consult qualified legal counsel for compliance decisions.
 */

// ---------------------------------------------------------------------------
// Enums / Union Types
// ---------------------------------------------------------------------------

/**
 * Risk classification tiers under the EU AI Act.
 *
 * The Act establishes a tiered regulatory framework where obligations
 * scale with the level of risk an AI system poses. Classification
 * follows a strict precedence: prohibited > high-risk > gpai > limited > minimal.
 */
export type RiskTier =
  | 'prohibited'
  | 'high-risk'
  | 'gpai'
  | 'gpai-systemic'
  | 'limited'
  | 'minimal';

/**
 * Annex III high-risk use case categories.
 *
 * These eight areas are listed in Annex III of the EU AI Act as domains
 * where AI systems are considered high-risk when used for specified purposes.
 */
export type AnnexIIICategory =
  | 'biometrics'
  | 'critical-infrastructure'
  | 'education'
  | 'employment'
  | 'essential-services'
  | 'law-enforcement'
  | 'migration'
  | 'justice-democracy';

/**
 * Obligation categories grouping regulatory requirements by theme.
 *
 * Each obligation derived from the Act falls into one of these categories,
 * enabling structured compliance tracking and checklist organization.
 */
export type ObligationCategory =
  | 'risk-management'
  | 'data-governance'
  | 'documentation'
  | 'record-keeping'
  | 'transparency'
  | 'human-oversight'
  | 'accuracy-robustness'
  | 'monitoring'
  | 'incident-reporting'
  | 'copyright'
  | 'training-data-summary';

/**
 * Template types available for compliance documentation generation.
 *
 * Each template corresponds to a specific documentation requirement
 * under the EU AI Act, primarily for high-risk AI systems.
 */
export type TemplateName =
  | 'technical-documentation'
  | 'risk-management-system'
  | 'data-governance'
  | 'human-oversight-plan'
  | 'monitoring-plan'
  | 'declaration-of-conformity'
  | 'gpai-model-card'
  | 'fundamental-rights-impact';

/**
 * Type of conformity assessment required for an AI system.
 *
 * - `'self'`: Provider can self-assess conformity
 * - `'third-party'`: Must use a notified body for assessment
 * - `'none'`: No conformity assessment required for this tier
 */
export type ConformityAssessment = 'self' | 'third-party' | 'none';

/**
 * Computed temporal status of a timeline event relative to a reference date.
 *
 * - `'past'`: The event's date has already passed
 * - `'upcoming'`: The event is within the near future (typically <= 90 days)
 * - `'future'`: The event is more than 90 days away
 */
export type TimelineStatus = 'past' | 'upcoming' | 'future';

// ---------------------------------------------------------------------------
// Constant Arrays (for runtime validation)
// ---------------------------------------------------------------------------

/** All valid risk tier values. Use for runtime validation of user input. */
export const RISK_TIERS: readonly RiskTier[] = [
  'prohibited',
  'high-risk',
  'gpai',
  'gpai-systemic',
  'limited',
  'minimal',
] as const;

/** All valid Annex III category values. Use for runtime validation. */
export const ANNEX_III_CATEGORIES: readonly AnnexIIICategory[] = [
  'biometrics',
  'critical-infrastructure',
  'education',
  'employment',
  'essential-services',
  'law-enforcement',
  'migration',
  'justice-democracy',
] as const;

/** All valid template name values. Use for runtime validation. */
export const TEMPLATE_NAMES: readonly TemplateName[] = [
  'technical-documentation',
  'risk-management-system',
  'data-governance',
  'human-oversight-plan',
  'monitoring-plan',
  'declaration-of-conformity',
  'gpai-model-card',
  'fundamental-rights-impact',
] as const;

/** All valid obligation category values. Use for runtime validation. */
export const OBLIGATION_CATEGORIES: readonly ObligationCategory[] = [
  'risk-management',
  'data-governance',
  'documentation',
  'record-keeping',
  'transparency',
  'human-oversight',
  'accuracy-robustness',
  'monitoring',
  'incident-reporting',
  'copyright',
  'training-data-summary',
] as const;

/**
 * Asserts that a value is a valid RiskTier.
 * @throws {RangeError} if the value is not a known tier.
 */
export function assertValidTier(tier: unknown, context: string): asserts tier is RiskTier {
  if (typeof tier !== 'string' || !RISK_TIERS.includes(tier as RiskTier)) {
    throw new RangeError(
      `Invalid risk tier: '${String(tier)}'. ${context} must be one of: ${RISK_TIERS.join(', ')}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

/**
 * Input for AI system risk classification.
 *
 * Describes an AI system's characteristics across the four classification
 * steps defined in the EU AI Act: prohibited practices (Article 5),
 * GPAI assessment, high-risk determination (Annex I/III), and limited
 * risk transparency triggers. All required boolean fields must be
 * explicitly set; omitting them will cause a TypeError.
 */
export interface ClassificationInput {
  // -- Step 1: Prohibited practices (Article 5) --

  /** Article 5(1)(c) -- Social scoring by public authorities leading to detrimental treatment. */
  socialScoring: boolean;

  /** Article 5(1)(h) -- Real-time remote biometric identification in publicly accessible spaces. */
  realtimeBiometrics: boolean;

  /** Article 5(1)(a) -- Deploying subliminal or purposefully manipulative techniques. */
  subliminalManipulation: boolean;

  /** Article 5(1)(b) -- Exploiting vulnerabilities due to age, disability, or social/economic situation. */
  exploitsVulnerabilities: boolean;

  /** Article 5(1)(e) -- Untargeted scraping of facial images from the internet or CCTV footage. */
  untargetedFacialScraping: boolean;

  /** Article 5(1)(f) -- Inferring emotions in the workplace or education institutions. */
  emotionInferenceWorkplace: boolean;

  /** Article 5(1)(g) -- Biometric categorization to deduce sensitive attributes (race, politics, etc.). */
  biometricCategorization: boolean;

  /** Article 5(1)(d) -- Individual predictive policing based solely on profiling. */
  predictivePolicing: boolean;

  // -- Step 2: General-Purpose AI (GPAI) --

  /** Whether this is a general-purpose AI model (Articles 51-55). */
  isGPAI: boolean;

  /** Training compute in floating-point operations (FLOPs). Used to determine systemic risk threshold (10^25). */
  gpaiFlops?: number;

  /** Whether the GPAI model is released under an open-source licence. May qualify for reduced obligations. */
  isOpenSource?: boolean;

  /** Whether the AI Office has designated this GPAI model as posing systemic risk. */
  designatedSystemicRisk?: boolean;

  // -- Step 3: High-risk (Annex I and Annex III) --

  /** Whether the system is a safety component of a product covered by EU harmonisation legislation listed in Annex I. */
  annexIProduct: boolean;

  /** Whether the Annex I product requires a third-party conformity assessment under its sectoral legislation. */
  annexIRequiresThirdParty?: boolean;

  /**
   * The Annex III high-risk use case category, or null if the system
   * does not fall under any Annex III category.
   */
  annexIIICategory: AnnexIIICategory | null;

  // -- Step 4: Limited risk (transparency obligations) --

  /** Whether the system interacts directly with natural persons (chatbots, virtual assistants, etc.). */
  interactsWithPersons: boolean;

  /** Whether the system generates or manipulates synthetic content (deepfakes, AI-generated media). */
  generatesSyntheticContent: boolean;

  /** Whether the system performs emotion recognition (non-prohibited context). */
  emotionRecognition: boolean;

  /** Whether the system performs biometric categorization (non-prohibited context). */
  biometricCategorizing: boolean;
}

/**
 * Output of the classification engine.
 *
 * Deterministic for a given `ClassificationInput` -- the same input always
 * produces the same result. Contains the risk tier, applicable articles,
 * specific obligations, and a human-readable reasoning chain explaining
 * the classification logic step by step.
 */
export interface ClassificationResult {
  /** The primary risk classification tier. */
  tier: RiskTier;

  /**
   * Refinement of the primary tier providing additional context.
   * Examples: `'gpai-open-source'`, `'high-risk-annex-iii-employment'`,
   * `'high-risk-third-party'`. Null when no refinement applies.
   */
  subTier: string | null;

  /** Article numbers from Regulation 2024/1689 that apply to this system. */
  articles: number[];

  /** Specific regulatory obligations derived from the classification. */
  obligations: Obligation[];

  /** Whether the GPAI open-source reduced obligations exemption applies. */
  openSourceExemption: boolean;

  /** The type of conformity assessment required before market placement. */
  conformityAssessment: ConformityAssessment;

  /** ISO 8601 date when obligations for this tier become enforceable. */
  enforcementDate: string;

  /**
   * Step-by-step explanation of the classification logic.
   * Each string is one reasoning step (e.g., "Not prohibited (Article 5)",
   * "Annex III Category 4: Employment -- recruitment decisions").
   */
  reasoning: string[];
}

/**
 * A single regulatory obligation derived from classification.
 *
 * Represents a specific requirement from the EU AI Act that applies
 * to the classified AI system, grouped by obligation category.
 */
export interface Obligation {
  /** Article number in Regulation 2024/1689 where this obligation is defined. */
  article: number;

  /** Short human-readable title of the obligation. */
  title: string;

  /** Detailed description of what the obligation requires. */
  description: string;

  /** Thematic category grouping this obligation with related requirements. */
  category: ObligationCategory;
}

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------

/**
 * A tier's complete compliance checklist with tracking state.
 *
 * Generated by the SDK for a given risk tier. The `completionRate`
 * starts at 0 and is computed by consumers based on their tracking state.
 */
export interface Checklist {
  /** Which risk tier this checklist covers. */
  tier: RiskTier;

  /** All compliance checklist items for this tier. */
  items: ChecklistItem[];

  /**
   * Fraction of items completed, from 0 to 1.
   * Computed from checked items; starts at 0 when returned by `getChecklist()`.
   */
  completionRate: number;
}

/**
 * A single compliance obligation to be tracked.
 *
 * Each item corresponds to a specific requirement from the EU AI Act,
 * identified by article and paragraph number. Items can be marked as
 * required (mandatory for the tier) or optional (best practice).
 */
export interface ChecklistItem {
  /** Unique identifier for this checklist item (e.g., `'art9-risk-identification'`). */
  id: string;

  /** Source article number in Regulation 2024/1689. */
  article: number;

  /** Source paragraph number within the article, or null if the item spans the full article. */
  paragraph: number | null;

  /** Short obligation text summarizing what must be done. */
  text: string;

  /** Detailed explanation of the requirement and how to comply. */
  description: string;

  /** Whether this item is mandatory for the tier (true) or a recommended best practice (false). */
  required: boolean;

  /** Thematic category grouping this item with related obligations. */
  category: ObligationCategory;

  /** Whether the user has marked this item as complete. Set by consumers, not the SDK. */
  checked: boolean;

  /** User-provided compliance evidence note. Set by consumers, not the SDK. */
  evidence?: string;

  /** User-provided additional notes. Set by consumers, not the SDK. */
  notes?: string;
}

/**
 * User's tracking state for a single checklist item.
 *
 * Persisted in `.eu-ai-act.json` (CLI) or `localStorage` (web).
 * Maps from a `ChecklistItem.id` to completion state.
 */
export interface ChecklistProgress {
  /** Whether the user has marked this item as complete. */
  checked: boolean;

  /** User-provided compliance evidence note, or null if none provided. */
  evidence: string | null;

  /** ISO 8601 date when the item was checked, or null if not yet checked. */
  checkedAt: string | null;
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

/**
 * An enforcement milestone in the EU AI Act rollout.
 *
 * Contains both static data (date, title, articles) and computed fields
 * (`status`, `daysUntil`) that are calculated at runtime relative to a
 * reference date. The computed fields are not stored in `data/timeline.json`.
 */
export interface TimelineEvent {
  /** ISO 8601 date of the enforcement milestone. */
  date: string;

  /** Human-readable title of the milestone event. */
  title: string;

  /** Description of what becomes enforceable at this date. */
  description: string;

  /** Article numbers that become enforceable or relevant at this milestone. */
  articles: number[];

  /** Which risk tiers are affected by this milestone. */
  categories: RiskTier[];

  /**
   * Computed temporal status relative to the reference date.
   * - `'past'`: The milestone date has already passed.
   * - `'upcoming'`: The milestone is within the near future.
   * - `'future'`: The milestone is more than 90 days away.
   */
  status: TimelineStatus;

  /**
   * Number of days until the milestone. Negative values indicate
   * the milestone has already passed. Computed at runtime.
   */
  daysUntil: number;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/**
 * Input for compliance documentation template generation.
 *
 * Contains the core fields required by all templates plus an index
 * signature for template-specific additional fields. Additional fields
 * are validated by per-template schemas in `sdk/src/templates/schemas.ts`.
 */
export interface TemplateInput {
  /** Name of the AI system being documented. */
  systemName: string;

  /** Organization providing or deploying the AI system. */
  provider: string;

  /** Description of the AI system's intended purpose and use context. */
  intendedPurpose: string;

  /** Version identifier for the AI system (defaults to `'1.0.0'` if omitted). */
  version?: string;

  /** Document date in ISO 8601 format (defaults to today if omitted). */
  date?: string;

  /** Additional template-specific fields. Validated per template type. */
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// Questions (Interactive Classification)
// ---------------------------------------------------------------------------

/**
 * A step in the classification questionnaire.
 *
 * The classification wizard presents questions grouped into steps.
 * Each step corresponds to a phase in the risk classification logic
 * (prohibited practices, GPAI, high-risk, limited risk).
 */
export interface QuestionStep {
  /** Unique identifier for this step (e.g., `'prohibited'`, `'gpai'`, `'high-risk'`). */
  id: string;

  /** Human-readable title displayed as the step header. */
  title: string;

  /** Explanatory text describing what this step evaluates. */
  description: string;

  /** The questions presented in this step. */
  questions: Question[];
}

/**
 * A single classification question within a step.
 *
 * Each question maps to a specific field in `ClassificationInput` and
 * references the relevant Article/paragraph of the EU AI Act. Questions
 * include optional branching logic (`ifYes`) that can short-circuit
 * the classification when a definitive answer is reached.
 */
export interface Question {
  /** Unique identifier for this question (e.g., `'social-scoring'`). Maps to a `ClassificationInput` field. */
  id: string;

  /** The question text presented to the user. */
  text: string;

  /** Article number in Regulation 2024/1689 that this question relates to. */
  article: number;

  /** Paragraph number within the article. */
  paragraph?: number;

  /** Subparagraph letter within the paragraph (e.g., `'c'` for Article 5(1)(c)). */
  subparagraph?: string;

  /** Help text explaining the question in plain language, shown as a tooltip or expandable section. */
  help: string;

  /**
   * Branching logic triggered when the user answers "yes".
   * If present, a "yes" answer short-circuits classification to the
   * specified result tier with an explanation.
   */
  ifYes?: {
    /** The risk tier to assign if this question is answered "yes". */
    result: RiskTier;
    /** Human-readable explanation of why this answer leads to this classification. */
    reason: string;
  };
}

// ---------------------------------------------------------------------------
// Worked Examples
// ---------------------------------------------------------------------------

/**
 * A pre-configured AI system scenario with a classification walkthrough.
 *
 * Worked examples demonstrate the classification process for common
 * AI system types (chatbot, hiring tool, autonomous vehicle, etc.).
 * Each example includes pre-filled inputs and a step-by-step narrative
 * explaining the reasoning.
 */
export interface WorkedExample {
  /** URL-safe identifier for this example (e.g., `'chatbot'`, `'hiring-tool'`). */
  slug: string;

  /** Human-readable display name for the example. */
  title: string;

  /** Brief description of the AI system scenario. */
  description: string;

  /** Pre-filled classification inputs for the example system. */
  classificationInput: ClassificationInput;

  /** The expected classification result tier for validation. */
  expectedTier: RiskTier;

  /** Step-by-step reasoning narrative explaining the classification. */
  walkthrough: string[];
}

// ---------------------------------------------------------------------------
// State File
// ---------------------------------------------------------------------------

/**
 * The `.eu-ai-act.json` persistence schema.
 *
 * Shared between the CLI (file system) and web app (localStorage export/import).
 * Stores the user's classification result and checklist tracking state
 * for a single AI system.
 */
export interface StateFile {
  /** Schema version following semver (e.g., `'1.0.0'`). Used for migration. */
  version: string;

  /** Metadata about the AI system being tracked. */
  system: {
    /** Name of the AI system. */
    name: string;
    /** Organization providing the AI system. */
    provider: string;
    /** ISO 8601 timestamp when the system was classified. */
    classifiedAt: string;
  };

  /** Stored classification result (subset of full ClassificationResult). */
  classification: {
    /** The primary risk tier. */
    tier: RiskTier;
    /** Refinement of the primary tier, or null. */
    subTier: string | null;
    /** Required conformity assessment type. */
    conformityAssessment: ConformityAssessment;
  };

  /**
   * Checklist tracking state. Maps `ChecklistItem.id` to the user's
   * progress on that item. Items not present have not been interacted with.
   */
  checklist: Record<string, ChecklistProgress>;
}
