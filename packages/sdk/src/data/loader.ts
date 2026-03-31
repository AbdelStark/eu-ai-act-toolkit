/**
 * @module loader
 *
 * Data loader for the EU AI Act compliance toolkit SDK.
 *
 * Imports structured JSON data files and provides typed accessor functions.
 * Since the SDK uses tsup for bundling, these imports are resolved and
 * inlined at build time, making the published package self-contained
 * with zero runtime dependencies.
 *
 * The JSON files live in the repository root `data/` directory and may
 * be created by separate agents. The loader is written against the
 * expected structure defined in the data model specification.
 *
 * DISCLAIMER: This data does not constitute legal advice.
 */

import type {
  RiskTier,
  AnnexIIICategory,
  ObligationCategory,
  ClassificationInput,
  QuestionStep,
  Question,
} from './types.js';

// ---------------------------------------------------------------------------
// Raw Data Types (JSON shapes before SDK computation)
// ---------------------------------------------------------------------------

/**
 * A timeline event as stored in `data/timeline.json`.
 *
 * Does not include computed fields (`status`, `daysUntil`) which are
 * calculated at runtime by the SDK's timeline module relative to a
 * reference date.
 */
export interface RawTimelineEvent {
  /** ISO 8601 date of the enforcement milestone. */
  date: string;

  /** Human-readable title of the milestone event. */
  title: string;

  /** Description of what becomes enforceable at this date. */
  description: string;

  /** Article numbers that become enforceable or relevant at this milestone. */
  articles: number[];

  /**
   * Which risk tiers are affected by this milestone.
   * May include the special value `'all'` to indicate all tiers are affected.
   */
  categories: (RiskTier | 'all')[];
}

/**
 * A checklist item as stored in `data/checklists.json`.
 *
 * This is the raw stored shape before the SDK adds runtime tracking
 * fields (`checked`, `evidence`, `notes`). The SDK's checklist generator
 * transforms these into full `ChecklistItem` objects.
 */
export interface RawChecklistItem {
  /** Unique identifier for this checklist item (e.g., `'art9-risk-system'`). */
  id: string;

  /** Source article number in Regulation 2024/1689. */
  article: number;

  /** Source paragraph number within the article, or null/undefined if spanning the full article. */
  paragraph?: number | null;

  /** Short obligation text summarizing what must be done. */
  text: string;

  /** Detailed explanation of the requirement and how to comply. */
  description: string;

  /** Whether this item is mandatory for the tier. */
  required: boolean;

  /** Thematic category grouping this item with related obligations. */
  category: ObligationCategory;
}

/**
 * An article entry as stored in `data/articles.json`.
 *
 * Represents a single article from Regulation (EU) 2024/1689 with
 * structured metadata for tooltip display, cross-referencing, and
 * filtering by applicable risk tier.
 */
export interface Article {
  /** Article number in the Regulation. */
  number: number;

  /** Official title of the article. */
  title: string;

  /**
   * Summary or full text of the article for reference display.
   * May be truncated with a link to the full text on
   * artificialintelligenceact.eu.
   */
  summary: string;

  /** Which risk tiers this article applies to. */
  applicableTiers: RiskTier[];

  /** Cross-references to other article numbers in the Regulation. */
  crossReferences: number[];

  /** Optional URL to the full article text on the official reference site. */
  url?: string;
}

/**
 * An Annex III entry as stored in `data/annexes.json`.
 *
 * Represents one of the eight high-risk use case areas defined in
 * Annex III of the EU AI Act, with its category identifier, description,
 * and the specific AI system types listed under it.
 */
export interface AnnexIIIEntry {
  /** Numeric category number (1-8) as listed in Annex III. */
  categoryNumber: number;

  /** Machine-readable category identifier matching `AnnexIIICategory`. */
  category: AnnexIIICategory;

  /** Human-readable category title (e.g., "Biometrics"). */
  title: string;

  /** Description of the high-risk use case area. */
  description: string;

  /** Specific AI system types listed under this category in Annex III. */
  subItems: AnnexIIISubItem[];
}

/**
 * A specific AI system type listed under an Annex III category.
 */
export interface AnnexIIISubItem {
  /** Sub-item identifier within the category (e.g., `'a'`, `'b'`). */
  id: string;

  /** Description of the specific AI system type that is considered high-risk. */
  text: string;
}

// ---------------------------------------------------------------------------
// Raw JSON structure types (top-level shapes of each JSON file)
// ---------------------------------------------------------------------------

/** Top-level shape of `data/questions.json`. */
interface QuestionsFile {
  steps: RawQuestionStep[];
}

/**
 * A question step as stored in JSON. Mirrors `QuestionStep` but uses
 * the raw `RawQuestion` type for questions.
 */
interface RawQuestionStep {
  id: string;
  title: string;
  description: string;
  questions: RawQuestion[];
}

/**
 * A question as stored in JSON. Same shape as `Question` from types.ts.
 */
interface RawQuestion {
  id: string;
  text: string;
  article: number;
  paragraph?: number;
  subparagraph?: string;
  help: string;
  ifYes?: {
    result: string;
    reason: string;
  };
}

/** Top-level shape of `data/checklists.json`. */
type ChecklistsFile = Record<string, RawChecklistItem[]>;

/** Top-level shape of `data/timeline.json`. */
interface TimelineFile {
  events: RawTimelineEvent[];
}

/** Top-level shape of `data/articles.json`. */
interface ArticlesFile {
  articles: Article[];
}

/** Top-level shape of `data/annexes.json`. Key is `annexIII` in the JSON. */
interface AnnexesFile {
  annexIII: AnnexIIIEntry[];
}

/**
 * A penalty tier as stored in `data/penalties.json`.
 */
export interface RawPenalty {
  /** Unique identifier for this penalty tier. */
  id: string;
  /** Source article number. */
  article: number;
  /** Source paragraph number. */
  paragraph: number;
  /** Description of the infringement. */
  description: string;
  /** Maximum fine in EUR for large organizations. */
  maxFineEur: number;
  /** Maximum fine as percentage of global annual turnover. */
  maxFineTurnoverPercent: number;
  /** Risk tiers this penalty applies to. */
  applicableTiers: RiskTier[];
  /** Example violations that trigger this penalty. */
  violationExamples: string[];
}

/** SME reduction rules from Art. 99(6). */
export interface RawSmeReduction {
  article: number;
  paragraph: number;
  description: string;
  applicableTo: string[];
  note: string;
}

/** EU institution fine cap from Art. 99(7). */
export interface RawEuInstitutionCap {
  article: number;
  paragraph: number;
  description: string;
  maxFineEur: number;
}

/** Top-level shape of `data/penalties.json`. */
interface PenaltiesFile {
  penalties: RawPenalty[];
  smeReductions: RawSmeReduction;
  euInstitutionCap: RawEuInstitutionCap;
}

/**
 * A harmonised standard entry as stored in `data/standards.json`.
 */
export interface RawStandard {
  /** Unique identifier. */
  id: string;
  /** Standard designation (e.g., "ISO/IEC 42001:2023"). */
  name: string;
  /** Full title of the standard. */
  title: string;
  /** Standards organization. */
  organization: string;
  /** Publication status. */
  status: 'published' | 'in-development' | 'draft' | 'withdrawn';
  /** Publication date (ISO 8601), or null if not yet published. */
  publicationDate: string | null;
  /** Description of the standard's scope and relevance. */
  description: string;
  /** EU AI Act articles this standard maps to. */
  applicableArticles: number[];
  /** Risk tiers this standard is relevant to. */
  applicableTiers: RiskTier[];
  /** Obligation categories this standard covers. */
  applicableCategories: string[];
  /** URL to the standard's page, or null if not available. */
  url: string | null;
}

/** Top-level shape of `data/standards.json`. */
interface StandardsFile {
  standards: RawStandard[];
}

/** A raw example as stored in `data/examples.json`. */
export interface RawExample {
  slug: string;
  title: string;
  description: string;
  classificationInput: ClassificationInput;
  expectedTier: string;
  walkthrough: string[];
}

/** Top-level shape of `data/examples.json`. */
interface ExamplesFile {
  examples: RawExample[];
}

// ---------------------------------------------------------------------------
// JSON Imports
//
// These imports are resolved by tsup at build time. The JSON files are
// inlined into the bundle, so the published package has no external
// data dependencies. The files may not exist yet during development --
// they are created by separate agents working on the data layer.
// ---------------------------------------------------------------------------

import questionsData from '@data/questions.json';
import checklistsData from '@data/checklists.json';
import timelineData from '@data/timeline.json';
import articlesData from '@data/articles.json';
import annexesData from '@data/annexes.json';
import examplesData from '@data/examples.json';
import penaltiesData from '@data/penalties.json';
import standardsData from '@data/standards.json';

// ---------------------------------------------------------------------------
// Typed Accessors
// ---------------------------------------------------------------------------

/**
 * Returns the classification question tree for interactive UIs.
 *
 * Each step contains a group of yes/no questions corresponding to
 * a phase of the classification logic (prohibited, GPAI, high-risk,
 * limited risk). Questions include branching logic for short-circuiting
 * when a definitive classification is reached.
 *
 * @returns Array of question steps ordered by classification precedence.
 */
export function getQuestionsData(): QuestionStep[] {
  const file = questionsData as QuestionsFile;
  return file.steps.map((step): QuestionStep => ({
    id: step.id,
    title: step.title,
    description: step.description,
    questions: step.questions.map((q): Question => ({
      id: q.id,
      text: q.text,
      article: q.article,
      paragraph: q.paragraph,
      subparagraph: q.subparagraph,
      help: q.help,
      ifYes: q.ifYes
        ? {
            result: q.ifYes.result as RiskTier,
            reason: q.ifYes.reason,
          }
        : undefined,
    })),
  }));
}

/**
 * Returns raw checklist data keyed by risk tier.
 *
 * Each tier maps to an object containing its checklist items in the
 * raw stored format (without runtime tracking fields like `checked`).
 * The SDK's checklist generator module transforms these into full
 * `ChecklistItem` objects with default tracking state.
 *
 * @returns Record mapping risk tier strings to their raw checklist items.
 */
export function getChecklistsData(): Record<string, { items: RawChecklistItem[] }> {
  const raw = checklistsData as ChecklistsFile;
  const result: Record<string, { items: RawChecklistItem[] }> = {};
  for (const [tier, items] of Object.entries(raw)) {
    result[tier] = { items: Array.isArray(items) ? items : [] };
  }
  return result;
}

/**
 * Returns raw timeline events without computed status fields.
 *
 * The returned events contain static data only (date, title, articles,
 * categories). The SDK's timeline module computes `status` and `daysUntil`
 * relative to a reference date to produce full `TimelineEvent` objects.
 *
 * @returns Array of raw timeline events in chronological order.
 */
export function getTimelineData(): RawTimelineEvent[] {
  const file = timelineData as TimelineFile;
  return file.events;
}

/**
 * Returns structured article data from the EU AI Act.
 *
 * Each article includes its number, title, summary text, applicable
 * risk tiers, and cross-references to related articles. Used for
 * tooltip display, reference linking, and article-based filtering.
 *
 * @returns Array of article entries.
 */
export function getArticlesData(): Article[] {
  const file = articlesData as unknown as ArticlesFile;
  return file.articles;
}

/**
 * Returns Annex III high-risk use case area entries.
 *
 * Each entry represents one of the eight categories in Annex III,
 * including the specific AI system types listed as high-risk under
 * that category.
 *
 * @returns Array of Annex III category entries.
 */
export function getAnnexesData(): AnnexIIIEntry[] {
  const file = annexesData as unknown as AnnexesFile;
  return file.annexIII;
}

/**
 * Returns worked classification examples.
 *
 * Each example includes pre-filled classification inputs, the expected
 * tier, and a step-by-step walkthrough. Used for demos, docs, and
 * regression testing of the classification engine.
 *
 * @returns Array of raw example entries.
 */
export function getExamplesData(): RawExample[] {
  const file = examplesData as ExamplesFile;
  return file.examples;
}

/**
 * Returns penalty data from the EU AI Act (Articles 99-101).
 *
 * Includes penalty tiers with maximum fines, SME reduction rules,
 * and EU institution caps.
 *
 * @returns Penalties file structure with all penalty tiers and rules.
 */
export function getPenaltiesData(): PenaltiesFile {
  return penaltiesData as PenaltiesFile;
}

/**
 * Returns harmonised standards mapping data.
 *
 * Each standard includes its designation, status, applicable articles,
 * risk tiers, and obligation categories it covers.
 *
 * @returns Array of standard entries.
 */
export function getStandardsData(): RawStandard[] {
  const file = standardsData as StandardsFile;
  return file.standards;
}
