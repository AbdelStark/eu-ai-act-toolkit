# @eu-ai-act/sdk

TypeScript SDK for EU AI Act (Regulation 2024/1689) compliance — risk classification, checklists, enforcement timeline, and documentation templates.

> **Disclaimer**: This SDK does not constitute legal advice. Always consult qualified legal counsel for compliance decisions.

## Features

- **Risk Classification** — Deterministic, rule-based classifier covering all six tiers (prohibited, high-risk, GPAI, GPAI with systemic risk, limited, minimal)
- **Compliance Checklists** — Per-tier obligation checklists with article references
- **Enforcement Timeline** — All EU AI Act milestones with computed status and countdown
- **Documentation Templates** — 8 Markdown templates including technical docs, risk management, data governance, human oversight, monitoring, conformity declaration, GPAI model card, and fundamental rights impact assessment
- **Interactive Questions** — Question tree for building classification wizard UIs
- **Article & Annex Lookup** — Browse and search all EU AI Act articles and Annex III categories
- **Penalty Calculator** — Calculate fine exposure based on risk tier, organization type, and annual turnover
- **Gap Analysis** — Comprehensive compliance gap analysis with priority scoring and remediation recommendations
- **Standards Mapping** — Harmonised ISO/CEN/CENELEC standards mapped to EU AI Act obligations
- **Compliance Reports** — Generate comprehensive Markdown compliance reports
- **Worked Examples** — 10 pre-built classification scenarios covering all 6 risk tiers
- **Zero Dependencies** — All data is bundled at build time; no runtime dependencies
- **Dual Format** — Ships ESM + CJS with full TypeScript declarations

## Installation

```bash
npm install @eu-ai-act/sdk
```

```bash
yarn add @eu-ai-act/sdk
```

```bash
pnpm add @eu-ai-act/sdk
```

## Quick Start

```typescript
import {
  classify,
  getChecklist,
  getTimeline,
  generateTemplate,
} from '@eu-ai-act/sdk';

// 1. Classify an AI system
const result = classify({
  socialScoring: false,
  realtimeBiometrics: false,
  subliminalManipulation: false,
  exploitsVulnerabilities: false,
  untargetedFacialScraping: false,
  emotionInferenceWorkplace: false,
  biometricCategorization: false,
  predictivePolicing: false,
  isGPAI: false,
  annexIProduct: false,
  annexIIICategory: 'employment',
  interactsWithPersons: true,
  generatesSyntheticContent: false,
  emotionRecognition: false,
  biometricCategorizing: false,
});

console.log(result.tier);               // 'high-risk'
console.log(result.conformityAssessment); // 'self'
console.log(result.enforcementDate);     // '2026-08-02'

// 2. Get the compliance checklist
const checklist = getChecklist(result.tier);
console.log(`${checklist.items.length} obligations to track`);

// 3. Check the enforcement timeline
const timeline = getTimeline();
const upcoming = timeline.filter(e => e.status === 'upcoming');
console.log(`${upcoming.length} deadlines approaching`);

// 4. Generate documentation
const doc = generateTemplate('technical-documentation', {
  systemName: 'Resume Screener',
  provider: 'Acme Corp',
  intendedPurpose: 'Automated resume screening for job applications',
});
// doc is a Markdown string ready to fill in
```

## API Reference

### `classify(input: ClassificationInput): ClassificationResult`

Classify an AI system's risk tier under the EU AI Act.

Pure, synchronous, deterministic function. The same input always produces the same output. No side effects, no I/O.

Classification follows strict precedence:
1. Prohibited practices (Article 5)
2. GPAI assessment (Articles 51–55)
3. High-risk Pathway A — Annex I safety component
4. High-risk Pathway B — Annex III categories
5. Limited risk — transparency triggers
6. Minimal risk (default)

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `ClassificationInput` | Structured description of the AI system |

**Returns:** `ClassificationResult` — tier, articles, obligations, reasoning chain

**Throws:**
- `TypeError` — if required fields are missing, null, or wrong type
- `TypeError` — if `gpaiFlops` is not a non-negative finite number

```typescript
import { classify } from '@eu-ai-act/sdk';
import type { ClassificationInput, ClassificationResult } from '@eu-ai-act/sdk';

const input: ClassificationInput = {
  // Prohibited practices (Article 5) — all false means not prohibited
  socialScoring: false,
  realtimeBiometrics: false,
  subliminalManipulation: false,
  exploitsVulnerabilities: false,
  untargetedFacialScraping: false,
  emotionInferenceWorkplace: false,
  biometricCategorization: false,
  predictivePolicing: false,

  // GPAI assessment
  isGPAI: false,
  // gpaiFlops: 1e26,         // optional — triggers systemic risk if >= 10^25
  // isOpenSource: true,       // optional — reduced obligations for GPAI
  // designatedSystemicRisk: false, // optional

  // High-risk (Annex I / Annex III)
  annexIProduct: false,
  // annexIRequiresThirdParty: false, // optional
  annexIIICategory: 'employment', // or null if not applicable

  // Limited risk transparency triggers
  interactsWithPersons: true,
  generatesSyntheticContent: false,
  emotionRecognition: false,
  biometricCategorizing: false,
};

const result: ClassificationResult = classify(input);

console.log(result.tier);                // 'high-risk'
console.log(result.subTier);             // 'high-risk-annex-iii-employment'
console.log(result.articles);            // [6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 26, 27, 43, 49]
console.log(result.obligations.length);  // 9 obligations
console.log(result.conformityAssessment); // 'self'
console.log(result.enforcementDate);     // '2026-08-02'
console.log(result.reasoning);           // Step-by-step explanation array
```

---

### `getChecklist(tier: RiskTier): Checklist`

Get the compliance checklist for a given risk tier.

Returns all checklist items with article references, descriptions, and required/optional status. The `completionRate` starts at 0 — tracking state is the consumer's responsibility.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `tier` | `RiskTier` | One of: `'prohibited'`, `'high-risk'`, `'gpai'`, `'gpai-systemic'`, `'limited'`, `'minimal'` |

**Returns:** `Checklist` — `{ tier, items, completionRate }`

**Throws:** `RangeError` — if tier is not a valid `RiskTier`

```typescript
import { getChecklist } from '@eu-ai-act/sdk';
import type { Checklist, ChecklistItem } from '@eu-ai-act/sdk';

const checklist: Checklist = getChecklist('high-risk');

console.log(checklist.tier);           // 'high-risk'
console.log(checklist.completionRate); // 0
console.log(checklist.items.length);   // number of obligations

// Each item has full article references
const item: ChecklistItem = checklist.items[0];
console.log(item.id);          // e.g. 'art9-risk-system'
console.log(item.article);     // 9
console.log(item.text);        // Short obligation text
console.log(item.description); // Detailed explanation
console.log(item.required);    // true or false
console.log(item.category);    // e.g. 'risk-management'
```

---

### `getTimeline(referenceDate?: Date): TimelineEvent[]`

Get enforcement timeline with computed status and countdown.

Returns all EU AI Act enforcement milestones sorted chronologically. Each event's `status` and `daysUntil` are computed relative to the reference date (defaults to `new Date()`).

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `referenceDate` | `Date` (optional) | Date to compute status against. Defaults to now. |

**Returns:** `TimelineEvent[]` — sorted by date, with computed status fields

**Throws:**
- `TypeError` — if `referenceDate` is not a `Date` instance
- `RangeError` — if `referenceDate` is an invalid `Date`

```typescript
import { getTimeline } from '@eu-ai-act/sdk';
import type { TimelineEvent } from '@eu-ai-act/sdk';

// Using current date
const timeline: TimelineEvent[] = getTimeline();

for (const event of timeline) {
  console.log(`${event.date} — ${event.title}`);
  console.log(`  Status: ${event.status}`);     // 'past' | 'upcoming' | 'future'
  console.log(`  Days until: ${event.daysUntil}`); // negative = already passed
  console.log(`  Articles: ${event.articles}`);
}

// Filter to upcoming deadlines
const upcoming = timeline.filter(e => e.status === 'upcoming');

// Use a specific reference date
const futureTimeline = getTimeline(new Date('2027-01-01'));
```

---

### `generateTemplate(name: TemplateName, input: TemplateInput): string`

Generate a compliance documentation template as Markdown.

Produces a Markdown string with system details interpolated and `[TODO]` placeholders for fields the user must complete.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `TemplateName` | Template type (see below) |
| `input` | `TemplateInput` | System details to interpolate |

**Available templates:**
- `'technical-documentation'` — Annex IV technical documentation
- `'risk-management-system'` — Article 9 risk management
- `'data-governance'` — Article 10 data governance
- `'human-oversight-plan'` — Article 14 human oversight
- `'monitoring-plan'` — Articles 72–73 post-market monitoring
- `'declaration-of-conformity'` — Article 47 EU declaration
- `'gpai-model-card'` — Article 53 / Annex XI GPAI model card
- `'fundamental-rights-impact'` — Article 27 fundamental rights impact assessment

**Returns:** `string` — Markdown document

**Throws:**
- `TypeError` — if required input fields (`systemName`, `provider`, `intendedPurpose`) are missing or empty
- `RangeError` — if template name is invalid

```typescript
import { generateTemplate } from '@eu-ai-act/sdk';
import type { TemplateName, TemplateInput } from '@eu-ai-act/sdk';

const input: TemplateInput = {
  systemName: 'Credit Scoring Engine',
  provider: 'FinTech Solutions Ltd',
  intendedPurpose: 'Automated creditworthiness assessment for loan applications',
  version: '2.1.0',            // optional
  date: '2025-06-15',          // optional, defaults to today
};

// Generate technical documentation template
const doc: string = generateTemplate('technical-documentation', input);

// Generate all templates for a high-risk system
import { TEMPLATE_NAMES } from '@eu-ai-act/sdk';

for (const name of TEMPLATE_NAMES) {
  const md = generateTemplate(name, input);
  console.log(`Generated ${name}: ${md.length} chars`);
}
```

---

### `getQuestions(): QuestionStep[]`

Get the classification question tree for interactive wizards.

Returns question steps matching the classification precedence: prohibited → GPAI → high-risk → limited. Each question includes article references, help text, and optional branching logic.

**Returns:** `QuestionStep[]` — ordered question steps

```typescript
import { getQuestions } from '@eu-ai-act/sdk';
import type { QuestionStep, Question } from '@eu-ai-act/sdk';

const steps: QuestionStep[] = getQuestions();

for (const step of steps) {
  console.log(`\n--- ${step.title} ---`);
  console.log(step.description);

  for (const q of step.questions) {
    console.log(`  [Article ${q.article}] ${q.text}`);
    console.log(`    Help: ${q.help}`);

    if (q.ifYes) {
      console.log(`    If YES → ${q.ifYes.result}: ${q.ifYes.reason}`);
    }
  }
}
```

---

### Utility Functions

#### `buildReasoning(result: ClassificationResult): string`

Build a human-readable, formatted reasoning summary from a classification result.

```typescript
import { classify, buildReasoning } from '@eu-ai-act/sdk';

const result = classify({ /* ... */ });
console.log(buildReasoning(result));
// "Classification Reasoning:
//   1. ✗ Not prohibited (Article 5) — no prohibited practices detected
//   2. ✗ Not a general-purpose AI model
//   3. ✓ Annex III Category 4: Employment..."
```

#### `formatTierSummary(result: ClassificationResult): string`

Format a classification result as a concise one-line summary.

```typescript
import { classify, formatTierSummary } from '@eu-ai-act/sdk';

const result = classify({ /* ... */ });
console.log(formatTierSummary(result));
// "High-Risk (Annex III — Employment)"
```

#### `calculateScore(items, progress): number`

Calculate compliance completion score (0 to 1).

```typescript
import { getChecklist, calculateScore } from '@eu-ai-act/sdk';

const checklist = getChecklist('high-risk');
const progress = { 'art9-risk-system': { checked: true, evidence: null, checkedAt: null } };
const score = calculateScore(checklist.items, progress);
console.log(`${Math.round(score * 100)}% complete`);
```

#### `countProgress(items, progress): { completed, total, percent }`

Count completed vs total items for display.

```typescript
import { getChecklist, countProgress } from '@eu-ai-act/sdk';

const checklist = getChecklist('high-risk');
const { completed, total, percent } = countProgress(checklist.items, {});
console.log(`${completed}/${total} (${percent}%)`);
```

---

### `getArticles(): ArticleReference[]`

Get all EU AI Act article references, sorted by article number.

```typescript
import { getArticles, getArticle, getArticlesByTier } from '@eu-ai-act/sdk';

const articles = getArticles();          // All articles
const art9 = getArticle(9);              // Specific article (or null)
const hrArticles = getArticlesByTier('high-risk'); // Articles for a tier
```

---

### `getAnnexes(): AnnexIIIDetail[]`

Get all Annex III high-risk use case categories.

```typescript
import { getAnnexes, getAnnex } from '@eu-ai-act/sdk';

const categories = getAnnexes();          // All Annex III categories
const employment = getAnnex('employment'); // Specific category (or null)
```

---

### `getExamples(): WorkedExample[]`

Get all worked classification examples with inputs, expected tiers, and walkthroughs.

```typescript
import { getExamples, getExampleBySlug, validateExamples } from '@eu-ai-act/sdk';

const examples = getExamples();
const hiring = getExampleBySlug('hiring-tool');
const validation = validateExamples(); // Validate all against classify()
```

---

### `calculatePenaltyExposure(input: PenaltyInput): PenaltyExposure`

Calculate penalty exposure for an AI system based on risk tier and organization.

```typescript
import { calculatePenaltyExposure, formatFineAmount } from '@eu-ai-act/sdk';

const exposure = calculatePenaltyExposure({
  tier: 'high-risk',
  annualTurnoverEur: 100_000_000,
  organizationType: 'large',
});

console.log(formatFineAmount(exposure.maxExposureEur)); // "EUR 15M"
console.log(exposure.summary);  // Human-readable assessment
```

---

### `analyzeGaps(input: GapAnalysisInput): GapAnalysisResult`

Perform comprehensive compliance gap analysis.

```typescript
import { classify, analyzeGaps } from '@eu-ai-act/sdk';

const classification = classify({ /* ... */ });
const result = analyzeGaps({
  classification,
  progress: {},  // checklist completion state
  annualTurnoverEur: 50_000_000,
});

console.log(result.readinessPercent);  // 0-100
console.log(result.criticalGaps);     // Number of critical gaps
console.log(result.recommendations);  // Prioritized action items
```

---

### `getStandards(): Standard[]`

Get all harmonised standards mapped to EU AI Act requirements.

```typescript
import {
  getStandards,
  getStandardsByTier,
  getStandardsMapping,
} from '@eu-ai-act/sdk';

const all = getStandards();
const hrStandards = getStandardsByTier('high-risk');
const mapping = getStandardsMapping(); // Category → standards matrix
```

---

### `generateReport(classification, checklist, options): string`

Generate a comprehensive compliance report as Markdown.

```typescript
import { classify, getChecklist, generateReport } from '@eu-ai-act/sdk';

const classification = classify({ /* ... */ });
const checklist = getChecklist(classification.tier);
const report = generateReport(classification, checklist, {
  systemName: 'Hiring Screener',
  provider: 'Acme Corp',
  intendedPurpose: 'Automated resume screening',
  includePenalties: true,
  includeGapAnalysis: true,
});
// report is a complete Markdown document
```

---

## Types

All types are exported for use in TypeScript projects:

```typescript
import type {
  // Classification
  ClassificationInput, ClassificationResult, RiskTier,
  Obligation, ObligationCategory, ConformityAssessment,

  // Checklists
  Checklist, ChecklistItem, ChecklistProgress,

  // Timeline
  TimelineEvent, TimelineStatus,

  // Templates
  TemplateName, TemplateInput,

  // Questions
  QuestionStep, Question,

  // Articles & Annexes
  ArticleReference, AnnexIIIDetail, AnnexIIICategory,

  // Penalties
  PenaltyInput, PenaltyExposure, PenaltyTier,
  PenaltySummary, OrganizationType,

  // Gap Analysis
  GapAnalysisInput, GapAnalysisResult,
  ComplianceGap, CategoryGapSummary, GapPriority,

  // Standards
  Standard, StandardsMapping,

  // Reports
  ReportOptions,

  // Examples & State
  WorkedExample, ExampleValidationResult, StateFile,
} from '@eu-ai-act/sdk';
```

### Constants

Runtime-accessible arrays for validation and UI population:

```typescript
import {
  RISK_TIERS,              // ['prohibited', 'high-risk', 'gpai', 'gpai-systemic', 'limited', 'minimal']
  ANNEX_III_CATEGORIES,    // ['biometrics', 'critical-infrastructure', ...]
  TEMPLATE_NAMES,          // ['technical-documentation', 'risk-management-system', ...]
  OBLIGATION_CATEGORIES,   // ['risk-management', 'data-governance', ...]
} from '@eu-ai-act/sdk';
```

## Error Handling

All public functions validate inputs and throw descriptive errors:

```typescript
import { classify, getChecklist, generateTemplate } from '@eu-ai-act/sdk';

// TypeError for null/undefined/wrong type
try {
  classify(null as any);
} catch (e) {
  // TypeError: classify() requires a ClassificationInput object, but received null
}

// TypeError for missing required fields
try {
  classify({} as any);
} catch (e) {
  // TypeError: ClassificationInput is missing required boolean field(s): socialScoring, ...
}

// RangeError for invalid enum values
try {
  getChecklist('invalid' as any);
} catch (e) {
  // RangeError: Invalid risk tier: 'invalid'. Must be one of: prohibited, high-risk, ...
}

// TypeError for empty strings
try {
  generateTemplate('technical-documentation', {
    systemName: '',
    provider: 'Acme',
    intendedPurpose: 'Testing',
  });
} catch (e) {
  // TypeError: TemplateInput.systemName is required and must be a non-empty string
}
```

## License

MIT
