# CLAUDE.md — EU AI Act Compliance Toolkit

## What is this?

Open-source compliance toolkit for the EU AI Act (Regulation 2024/1689). Monorepo with three packages that share data from a single source of truth (`data/*.json`):

- **`packages/sdk/`** — Pure TypeScript library. Zero runtime deps. Classification engine, checklists, templates, timeline.
- **`packages/cli/`** — Interactive CLI (`eu-ai-act`). Commander.js + Inquirer. Depends on SDK.
- **`packages/web/`** — Next.js 14 static site. 14 languages via next-intl. No backend.

## Quick Commands

```bash
npm install                          # Install all workspace deps
npx turbo build                      # Build SDK → CLI → Web (order matters)
npx turbo test                       # Run vitest across SDK
npx turbo dev                        # Dev mode (web on localhost:3000)
node scripts/validate-data.js        # Validate data/*.json against schemas — MUST pass
```

## Architecture

```
data/                    ← Single source of truth (JSON + JSON Schema)
├── schema/              ← JSON Schema definitions (draft-07)
├── questions.json       ← 5-step classification tree
├── checklists.json      ← Per-tier obligation checklists
├── articles.json        ← Article references
├── annexes.json         ← Annex III categories
├── examples.json        ← Worked classification examples
└── timeline.json        ← Enforcement milestones

packages/sdk/src/        ← Pure functions, all exports in index.ts
├── classifier/engine.ts ← classify() — deterministic risk classification
├── classifier/reasoning.ts ← buildReasoning(), formatTierSummary()
├── classifier/questions.ts ← getQuestions() — question tree for wizards
├── checklists/generator.ts ← getChecklist(tier)
├── checklists/scoring.ts   ← calculateScore(), countProgress()
├── templates/renderer.ts   ← generateTemplate(name, input) → Markdown
├── templates/schemas.ts    ← Input validation for templates
├── timeline/events.ts      ← getTimeline(refDate?) → events with status
├── data/types.ts           ← All TypeScript types and constants
├── data/loader.ts          ← JSON data loading (bundled by tsup)
└── __tests__/              ← Vitest test suite (120+ tests)
```

**Data flow:** `data/*.json` → SDK (tsup bundles at build time via `@data` alias) → CLI/Web consume SDK exports.

## Key SDK Functions

| Function | Signature | Pure? |
|---|---|---|
| `classify(input)` | `ClassificationInput → ClassificationResult` | Yes |
| `getChecklist(tier)` | `RiskTier → Checklist` | Yes |
| `getTimeline(refDate?)` | `Date? → TimelineEvent[]` | Yes |
| `generateTemplate(name, input)` | `(TemplateName, TemplateInput) → string` | Yes |
| `getQuestions()` | `() → QuestionStep[]` | Yes |
| `calculateScore(items, progress)` | `(ChecklistItem[], Progress) → number` | Yes |
| `countProgress(items, progress)` | `(ChecklistItem[], Progress) → {completed, total, percent}` | Yes |
| `buildReasoning(result)` | `ClassificationResult → string` | Yes |
| `formatTierSummary(result)` | `ClassificationResult → string` | Yes |

## Risk Tiers

Six tiers: `prohibited`, `high-risk`, `gpai`, `gpai-systemic`, `limited`, `minimal`.

Classification precedence (strict): prohibited → GPAI → high-risk → limited → minimal.

## Critical Constraints

1. **Every compliance item MUST cite a specific EU AI Act Article.** Exception: `minimal` tier voluntary items.
2. **Classification is deterministic.** Same input → same output. No randomness, no LLM calls.
3. **SDK has zero runtime dependencies.** Only devDependencies in packages/sdk/package.json.
4. **Data changes require validation.** Run `node scripts/validate-data.js` after any data/ edit.
5. **Web app is fully static.** No API routes, no server-side rendering. All state in localStorage.
6. **TypeScript strict mode.** `tsconfig.base.json` has `strict: true`, `noUncheckedIndexedAccess: true`.
7. **Templates use `[TODO]` placeholders** — literal strings the user fills in.
8. **Legal disclaimer required.** Always include "does not constitute legal advice" where results are shown.

## Testing

```bash
cd packages/sdk && npx vitest run    # Run SDK tests only
npx turbo test                       # Run all tests via turborepo
```

Tests live in `packages/sdk/src/__tests__/`. Vitest config in `packages/sdk/vitest.config.ts` maps the `@data` alias.

## Common Gotchas

- SDK imports JSON data via `@data/*` alias resolved by tsup at build time. The `@ts-expect-error` comments in `loader.ts` are intentional.
- `tsconfig.base.json` sets `noUnusedLocals` and `noUnusedParameters` — clean up unused imports.
- CLI resolves SDK from source in dev mode (see `packages/cli/tsup.config.ts` aliases).
- The `categories` field in `timeline.json` events can contain `'all'` — the SDK expands this to all six concrete tiers.
- Web app i18n uses cookie `NEXT_LOCALE` — different from CLI which reads from `locales/en/`.
- `checklists.json` keys are tier names, values are arrays of items (not `{ items: [...] }`).
