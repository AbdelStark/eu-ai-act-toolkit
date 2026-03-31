# AGENTS.md — EU AI Act Toolkit

Guide for AI coding agents working on this codebase. Be precise with legal references. Test everything.

## Project Overview

Turborepo monorepo with 3 packages helping organizations comply with the EU AI Act (Regulation 2024/1689):

- **packages/sdk/** — Pure TypeScript library. Zero runtime deps. Classification engine, checklists, templates, timeline.
- **packages/cli/** — Interactive CLI tool. Depends on SDK. Commander.js + Inquirer.
- **packages/web/** — Next.js 14 App Router + next-intl. Static export (no server). 14 languages.

## Quick Commands

```bash
npm install              # Install all deps from repo root
npx turbo build          # Build all packages (SDK → CLI → Web)
npx turbo test           # Run Vitest across all packages
npx turbo dev            # Dev mode (web on localhost:3000)
node scripts/validate-data.mjs   # Validate all data/ JSON against schemas (MUST pass before commit)
```

Build order matters: SDK must build before CLI and Web (configured in turbo.json).

## Architecture

```
data/                    ← Single source of truth (JSON + JSON Schema)
├── schema/              ← JSON Schema definitions (draft-07)
├── questions.json       ← 5-step classification tree (26 questions)
├── checklists.json      ← Per-tier obligation checklists
├── articles.json        ← Article references with EUR-Lex URLs
├── annexes.json         ← Annex III high-risk category definitions
├── examples.json        ← Worked classification examples
└── timeline.json        ← Enforcement milestones

packages/sdk/            ← Consumes data/ via tsup aliases, exports pure functions
packages/cli/            ← Depends on SDK, interactive terminal tool
packages/web/            ← Next.js 14, static export, next-intl for i18n

locales/en/              ← CLI-only i18n strings (English only for now)
  ├── cli.json
  ├── common.json
  ├── classifier.json
  └── checklists.json

packages/web/messages/   ← Web app translations (14 languages)
  ├── en.json, de.json, fr.json, es.json, it.json, nl.json,
  ├── pl.json, pt.json, ro.json, el.json, ar.json, bn.json,
  ├── hi.json, zh.json
```

### Data Flow

```
data/*.json → SDK (tsup bundles at build time) → CLI / Web consume SDK exports
```

- SDK imports data via path aliases in tsup.config.ts, not at runtime
- Web app is fully static — `next export` produces HTML/CSS/JS, no API routes
- CLI persists state to ~/.eu-ai-act.json via packages/cli/src/state.ts

## SDK Exports

Key functions from `@eu-ai-act/sdk`:

| Function | Purpose |
|---|---|
| `classify(answers)` | Deterministic risk classification from user answers |
| `getQuestions()` | Returns the 5-step question tree |
| `getChecklist(tier)` | Returns obligation checklist for a risk tier |
| `getTimeline()` | Returns enforcement milestones |
| `generateTemplate(type, context)` | Renders compliance document template |
| `buildReasoning(answers)` | Generates human-readable classification reasoning |
| `formatTierSummary(tier)` | Summary text for a risk tier |
| `calculateScore(checklist, progress)` | Compliance score from checked items |
| `countProgress(checklist, progress)` | Count completed vs total items |

All functions are pure: same input → same output, no side effects, no network calls.

## CLI Commands

| Command | Description |
|---|---|
| `classify` | Interactive classification wizard |
| `checklist` | Show/manage obligation checklist for a tier |
| `timeline` | Display enforcement timeline |
| `status` | Show current classification and compliance progress |
| `generate` | Generate compliance document from template |
| `report` | Export full compliance report |

## Risk Tiers

Six tiers defined by the EU AI Act:

| Tier | Key Articles | Color |
|---|---|---|
| `prohibited` | Art. 5 | Red |
| `high-risk` | Art. 6, Annex III | Orange |
| `gpai` | Art. 51-52 | Yellow |
| `gpai-systemic` | Art. 51-52, 55 | Yellow |
| `limited` | Art. 50 | Blue |
| `minimal` | Art. 69 | Green |

Classification is deterministic: the SDK's `classify()` function maps answers to exactly one tier through a fixed decision tree.

## Data Model

### questions.json
5 steps, 26 questions. Each question has:
- `id`: unique string identifier
- `text`: question text
- `article`: EU AI Act article number (integer, required)
- `paragraph`, `point`: optional sub-references
- `type`: `boolean`, `select`, or `number`
- `help`: explanatory text

### checklists.json
Per-tier arrays of obligation items. Each item has:
- `id`, `text`, `article` (required)
- `category`: grouping label
- Items MUST cite a specific article

### articles.json
Article metadata with EUR-Lex deep links.

### annexes.json
Annex III high-risk use case categories.

### examples.json
Pre-worked classification scenarios (hiring tool, chatbot, autonomous vehicle).

### timeline.json
Enforcement dates and milestones.

### Schema Validation
Every data file has a matching schema in `data/schema/`. Run:
```bash
node scripts/validate-data.mjs
```
This MUST pass. CI will reject invalid data.

## Key Conventions

1. **Every compliance item MUST cite a specific EU AI Act Article.** No generic advice. Questions, checklist items, and templates all reference articles.

2. **Classification is deterministic.** Same answers → same tier. No randomness, no LLM calls, no external APIs. Pure function.

3. **SDK has zero runtime dependencies.** Check packages/sdk/package.json — only devDependencies allowed.

4. **All data changes require schema validation.** Edit data/*.json → run `node scripts/validate-data.mjs` → fix errors before committing.

5. **Web app is fully static.** No backend, no API routes, no server-side rendering at request time. All user state lives in localStorage.

6. **Templates use `[TODO]` placeholders** for sections the user must fill in. These are literal `[TODO]` strings in template content.

7. **TypeScript strict mode.** `tsconfig.base.json` has strict: true. No `any` types, no ts-ignore.

8. **Bundling:** tsup for SDK and CLI (dual ESM + CJS output). Next.js handles web bundling.

## Design Principles

- **Legal accuracy is non-negotiable.** Every claim traces to a specific Article. Paraphrasing must not change legal meaning. When in doubt, quote the regulation.
- **Zero-backend privacy.** No accounts, no telemetry, no cookies beyond essential. All data stays on the user's machine.
- **Accessibility-first.** WCAG 2.1 AA minimum. Keyboard navigable, screen reader tested, 4.5:1 contrast, visible focus indicators.
- **Single source of truth.** The `data/` directory is canonical. SDK reads from it at build time. Never duplicate regulatory data.
- **Credibility through transparency.** Show sources, link to EUR-Lex, display article text on hover. The tool earns trust by being verifiable.

## Common Tasks

### Adding a new checklist item

1. Edit `data/checklists.json` — add item to the appropriate tier's array
2. Required fields: `id` (unique), `text`, `article` (integer), `category`
3. Run `node scripts/validate-data.mjs`
4. Run `npx turbo build` (SDK must rebuild to pick up data change)
5. Run `npx turbo test`

### Adding a new classification question

1. Edit `data/questions.json` — add to the appropriate step's `questions` array
2. Required fields: `id`, `text`, `article` (integer), `type` (`boolean`/`select`/`number`)
3. Update `packages/sdk/src/classifier/engine.ts` to handle the new question's answer in classification logic
4. Run `node scripts/validate-data.mjs`
5. Add/update tests, run `npx turbo test`
6. Update `locales/en/classifier.json` if CLI displays question text from i18n
7. Update `packages/web/messages/*.json` (all 14 languages) if the web app displays it

### Adding a new language translation (web)

1. Create `packages/web/messages/{locale}.json` using `en.json` as the template
2. Add the locale to the i18n config in `packages/web/src/i18n.ts`
3. Add the locale to `packages/web/next.config.mjs` if needed
4. Translate all string values (keep keys identical to en.json)
5. Build and test: `npx turbo build`

### Updating enforcement dates

1. Edit `data/timeline.json` — update the relevant milestone's date
2. Run `node scripts/validate-data.mjs`
3. Run `npx turbo build && npx turbo test`
4. Check `packages/web/src/components/timeline/CountdownBanner.tsx` if display logic depends on specific dates

## File Structure (Key Files)

```
eu-ai-act-toolkit/
├── package.json                           # Root workspace config
├── turbo.json                             # Turborepo pipeline config
├── tsconfig.base.json                     # Shared TS config (strict)
├── vitest.workspace.ts                    # Vitest workspace config
├── scripts/validate-data.mjs               # Data schema validator
├── data/
│   ├── schema/*.schema.json               # JSON Schema definitions
│   ├── questions.json                     # Classification questions
│   ├── checklists.json                    # Obligation checklists
│   ├── articles.json                      # Article references
│   ├── annexes.json                       # Annex III categories
│   ├── examples.json                      # Worked examples
│   └── timeline.json                      # Enforcement timeline
├── locales/en/                            # CLI i18n (English only)
├── templates/                             # Compliance doc templates (Markdown)
├── packages/
│   ├── sdk/
│   │   ├── package.json
│   │   ├── tsup.config.ts                 # Build config with data/ aliases
│   │   └── src/
│   │       ├── index.ts                   # Public API exports
│   │       ├── data/types.ts              # TypeScript types
│   │       ├── data/loader.ts             # Data loading
│   │       ├── classifier/engine.ts       # Classification logic
│   │       ├── classifier/reasoning.ts    # Human-readable reasoning
│   │       ├── classifier/questions.ts    # Question tree access
│   │       ├── checklists/generator.ts    # Checklist generation
│   │       ├── checklists/scoring.ts      # Score calculation
│   │       ├── templates/renderer.ts      # Template rendering
│   │       └── timeline/events.ts         # Timeline access
│   ├── cli/
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts                   # CLI entry point
│   │       ├── state.ts                   # ~/.eu-ai-act.json persistence
│   │       ├── i18n.ts                    # CLI i18n loader
│   │       └── commands/                  # classify, checklist, timeline, status, generate, report
│   └── web/
│       ├── package.json
│       ├── next.config.mjs
│       ├── messages/*.json                # 14 language files
│       └── src/
│           ├── i18n.ts                    # next-intl config
│           ├── lib/storage.ts             # localStorage wrapper
│           ├── app/                       # Next.js App Router pages
│           └── components/                # React components
│               ├── classifier/            # Classification wizard UI
│               ├── checklist/             # Checklist UI
│               ├── timeline/              # Timeline UI
│               ├── templates/             # Template editor UI
│               └── shared/                # Layout, RiskBadge, ArticleReference, etc.
└── .github/workflows/deploy-pages.yml     # GitHub Pages deployment
```
