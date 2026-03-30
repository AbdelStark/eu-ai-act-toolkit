# SDK Usage Guide

## Installation

```bash
npm install @eu-ai-act/sdk
```

The SDK is a pure TypeScript library with zero runtime dependencies. It ships as dual ESM + CJS.

## Core Functions

### `classify(answers)`

Classifies an AI system based on answers to the classification questionnaire.

```typescript
import { classify } from '@eu-ai-act/sdk';

const result = classify({
  q1: false,   // Not exempt
  q2: false,   // Not unacceptable risk
  q3a: true,   // Is in Annex III category
  // ... remaining answers
});

console.log(result.tier);       // e.g., 'high'
console.log(result.reasoning);  // explanation of classification
```

### `getChecklist(tier)`

Returns the compliance checklist for a given risk tier.

```typescript
import { getChecklist } from '@eu-ai-act/sdk';

const checklist = getChecklist('high');
checklist.items.forEach(item => {
  console.log(`[${item.article}] ${item.text} (required: ${item.required})`);
});
```

### `getTimeline()`

Returns the enforcement timeline with all milestones.

```typescript
import { getTimeline } from '@eu-ai-act/sdk';

const events = getTimeline();
events.forEach(event => {
  console.log(`${event.date}: ${event.title}`);
});
```

### `generateTemplate(templateName, context)`

Generates a compliance document template populated with context data.

```typescript
import { generateTemplate } from '@eu-ai-act/sdk';

const doc = generateTemplate('conformity-assessment', {
  tier: 'high',
  systemName: 'My AI System',
});
```

### `getQuestions()`

Returns all 26 classification questions.

```typescript
import { getQuestions } from '@eu-ai-act/sdk';

const questions = getQuestions();
questions.forEach(q => {
  console.log(`[Step ${q.step}] ${q.text} (Art. ${q.article})`);
});
```

## Utility Functions

### `buildReasoning(answers, tier)`

Constructs a human-readable explanation of why a system was classified into a given tier.

### `formatTierSummary(tier)`

Returns a formatted summary of what a risk tier means and its key obligations.

### `calculateScore(checklist, completed)`

Calculates a compliance score (0–100) based on completed checklist items.

### `countProgress(checklist, completed)`

Returns progress counts: total items, completed items, required remaining, and optional remaining.

## Types

All types are exported from the package:

```typescript
import type {
  RiskTier,
  ClassificationResult,
  Question,
  ChecklistItem,
  Checklist,
  TimelineEvent,
  Article,
  AnnexCategory,
  Template,
  ComplianceScore,
  ProgressCount,
} from '@eu-ai-act/sdk';
```

## Constants

```typescript
import {
  RISK_TIERS,              // Array of all 6 risk tier identifiers
  ANNEX_III_CATEGORIES,    // Annex III high-risk domain categories
  TEMPLATE_NAMES,          // Available template identifiers
  OBLIGATION_CATEGORIES,   // Checklist obligation categories
} from '@eu-ai-act/sdk';
```

## Error Handling

The SDK throws typed errors for invalid inputs:

```typescript
import { classify } from '@eu-ai-act/sdk';

try {
  const result = classify(answers);
} catch (error) {
  if (error instanceof Error) {
    console.error('Classification failed:', error.message);
  }
}
```

Common error scenarios:
- Missing required answers in `classify()`
- Invalid tier passed to `getChecklist()`
- Unknown template name in `generateTemplate()`

## Integration Examples

### CI/CD Classification Check

```typescript
import { classify } from '@eu-ai-act/sdk';

const result = classify(answers);
if (result.tier === 'unacceptable') {
  console.error('AI system is classified as unacceptable risk — cannot deploy.');
  process.exit(1);
}
if (result.tier === 'high') {
  console.warn('High-risk system detected — ensure all compliance obligations are met.');
}
```

### Compliance Dashboard

```typescript
import { classify, getChecklist, calculateScore, countProgress } from '@eu-ai-act/sdk';

const result = classify(answers);
const checklist = getChecklist(result.tier);
const completed = ['item-1', 'item-2']; // IDs of completed items

const score = calculateScore(checklist, completed);
const progress = countProgress(checklist, completed);

console.log(`Compliance score: ${score}%`);
console.log(`Progress: ${progress.completed}/${progress.total}`);
```

### Automated Reporting

```typescript
import { classify, getChecklist, generateTemplate, buildReasoning } from '@eu-ai-act/sdk';

const result = classify(answers);
const reasoning = buildReasoning(answers, result.tier);
const checklist = getChecklist(result.tier);
const report = generateTemplate('compliance-report', {
  tier: result.tier,
  reasoning,
  checklist,
});
```

## Further Reading

Refer to `packages/sdk/README.md` for the full API reference, including detailed parameter types and return values.
