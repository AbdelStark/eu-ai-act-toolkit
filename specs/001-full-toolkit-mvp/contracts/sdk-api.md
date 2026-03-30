# SDK API Contract: @eu-ai-act/sdk

**Version**: 1.0.0
**Date**: 2026-03-30

## Public API Surface

The SDK exports exactly these functions and types from its entry point
(`index.ts`). No other exports are part of the public API.

### Functions

#### `classify(input: ClassificationInput): ClassificationResult`

Synchronous, pure function. No side effects, no I/O.

**Input**: A complete `ClassificationInput` object (all required
fields present). Invalid input throws `TypeError` with a descriptive
message.

**Output**: A `ClassificationResult` with tier, articles, reasoning.

**Determinism guarantee**: The same input always produces the same
output. No randomness, no date-dependent logic in the classification
itself. (Enforcement dates are part of the result but are static data,
not computed from the current date.)

**Classification precedence**:
1. Check prohibited practices (Article 5) — any `true` → `prohibited`
2. Check GPAI — if `isGPAI`, check systemic risk threshold
3. Check high-risk Pathway A (Annex I safety component)
4. Check high-risk Pathway B (Annex III categories)
5. Check limited risk (transparency triggers)
6. Default: `minimal`

First match wins. Higher tiers take precedence.

**Edge case — dual Annex I + III**: If both `annexIProduct` and
`annexIIICategory` are set, result is `high-risk` with `subTier`
indicating both pathways. Conformity assessment uses the stricter
requirement (third-party if either pathway requires it).

#### `getChecklist(tier: RiskTier): Checklist`

Synchronous. Returns all checklist items for the given tier.

**Input**: A valid `RiskTier` value.

**Output**: A `Checklist` with `items` array and `completionRate: 0`
(no tracking state — tracking is the consumer's responsibility).

**Throws**: `RangeError` if tier is not a valid `RiskTier`.

#### `getTimeline(referenceDate?: Date): TimelineEvent[]`

Synchronous. Returns all enforcement milestones with computed status.

**Input**: Optional reference date (defaults to `new Date()`).

**Output**: Array of `TimelineEvent` sorted chronologically. Each
event's `status` and `daysUntil` are computed relative to
`referenceDate`.

#### `generateTemplate(name: TemplateName, input: TemplateInput): string`

Synchronous. Returns a Markdown string.

**Input**: Template name and system details. Input is validated
against the template's schema. Invalid input throws `TypeError`.

**Output**: Markdown string with all provided fields interpolated.
Unfilled optional fields are rendered as `[TODO: field_name]`
placeholders.

#### `getQuestions(): QuestionStep[]`

Synchronous. Returns the classification question tree for use in
interactive UIs (CLI wizard, web wizard).

**Output**: Array of `QuestionStep` objects, each containing an
array of `Question` objects with `id`, `text`, `article` reference,
`help` text, and branching logic.

#### `getExamples(): WorkedExample[]`

Synchronous. Returns all worked examples.

### Types (all exported)

```typescript
// Enums / unions
type RiskTier
type AnnexIIICategory
type TemplateName
type ObligationCategory

// Input/output
interface ClassificationInput
interface ClassificationResult
interface Obligation

// Checklists
interface Checklist
interface ChecklistItem

// Timeline
interface TimelineEvent

// Templates
interface TemplateInput

// Questions (interactive)
interface QuestionStep
interface Question

// Examples
interface WorkedExample

// State (for consumers implementing persistence)
interface StateFile
interface ChecklistProgress
```

### Error Contract

| Error Type  | When                                      |
|-------------|-------------------------------------------|
| TypeError   | Invalid ClassificationInput or TemplateInput |
| RangeError  | Invalid RiskTier or TemplateName value     |

No other error types are thrown. Functions never reject, never
return promises, never access the network or file system.

### Module Format

- **ESM**: `dist/index.mjs` (primary)
- **CJS**: `dist/index.cjs` (Node.js compatibility)
- **Types**: `dist/index.d.ts`

Package.json `exports` field maps all three. `types` field points
to declaration file.

### Versioning

The SDK follows semver:
- **MAJOR**: Removing/renaming a public function or type, changing
  return shape in a breaking way
- **MINOR**: Adding a new function or type, adding optional fields
- **PATCH**: Bug fixes in classification logic, data corrections

Data updates (new articles, corrected checklists) that don't change
the API shape are PATCH releases.
