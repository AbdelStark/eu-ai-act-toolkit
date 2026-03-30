# Implementation Plan: Full Toolkit MVP

**Branch**: `001-full-toolkit-mvp` | **Date**: 2026-03-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-full-toolkit-mvp/spec.md`

## Summary

Build the complete EU AI Act compliance toolkit as a TypeScript monorepo
with three components: an SDK library (`@eu-ai-act/sdk`) with zero runtime
dependencies, a CLI tool (`eu-ai-act`), and a static Next.js web app. All
compliance data (articles, checklists, timeline, classification questions)
lives in structured JSON under `data/` and flows through the SDK to both
consumers. The SDK implements risk classification, checklist retrieval,
timeline computation, and template generation. The CLI wraps the SDK with
interactive prompts and local state persistence. The web app provides a
visual wizard, interactive checklists, timeline, and documentation generator
— all running entirely client-side with no backend.

## Technical Context

**Language/Version**: TypeScript 5.4+ (strict mode)
**Primary Dependencies**:
  - SDK: None (zero runtime dependencies; data embedded at build time via tsup)
  - CLI: `@eu-ai-act/sdk` (workspace), `commander` (arg parsing), `@inquirer/prompts` (interactive), `chalk` (colors), `cli-table3` (tables)
  - Web: `@eu-ai-act/sdk` (workspace), `next` 14+ (App Router), `react` 18+, `tailwindcss`, `@radix-ui/react-*` (accessible primitives), `next-intl` (i18n)
**Storage**: JSON files in `data/` (source of truth), `localStorage` (web state), `.eu-ai-act.json` (CLI state)
**Testing**: Vitest (SDK + CLI unit/integration), Playwright (web E2E), `@axe-core/playwright` (accessibility)
**Target Platform**: Node.js 18+ (SDK + CLI), modern browsers last 2 versions (web)
**Project Type**: Monorepo — library + CLI + web-app (Turborepo workspaces)
**Performance Goals**: <2s landing page load (LCP), <50ms `classify()` execution, <100ms CLI command startup
**Constraints**: Zero SDK runtime deps, static-only web export, no backend/API routes, WCAG 2.1 AA, all strings externalized
**Scale/Scope**: Single-user local tool, 7 web pages, 6 CLI commands, ~100 checklist items across 6 tiers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Legal Accuracy (NON-NEGOTIABLE) | PASS | FR-002: every data entry has `article` field. Data sourced from official Regulation 2024/1689 text. JSON schema enforces article references. |
| II | Zero-Backend Privacy | PASS | FR-018: client-side only. No API routes, no server components fetching external data. Static export via `next export`. |
| III | Accessibility-First | PASS | FR-025: WCAG 2.1 AA. Radix UI primitives are accessible by default. axe-core in CI. SC-004 measures 100% pass rate. |
| IV | Single Source of Truth | PASS | FR-001: all data in `data/` JSON. SDK reads at build time. CLI and web consume via SDK API only. SC-009: one JSON file change = full propagation. |
| V | Developer Experience | PASS | FR-008: zero SDK deps. FR-016: `--json` on all CLI commands. SC-006: <10 lines to classify. POSIX conventions, meaningful exit codes. |
| VI | Internationalization | PASS | FR-028/029: all strings externalized. `next-intl` for web, locale JSON files for CLI/SDK. `Intl` APIs for formatting. |
| VII | No Legal Advice | PASS | FR-024/030: disclaimer on every compliance output surface. SDK JSDoc, CLI `--help`, web footer/banner. |
| VIII | Credibility through Transparency | PASS | FR-002: article references on all data. Open source. CHANGELOG required. Data accuracy issue template. |
| — | Architecture Constraints | PASS | Monorepo: `data/` → SDK → CLI, SDK → Web. No cross-imports between CLI and web. SDK has no dependency on consumers. |

**Gate result: ALL PASS.** No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-full-toolkit-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── sdk-api.md
│   └── cli-commands.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
eu-ai-act-toolkit/
├── packages/
│   ├── sdk/                        # @eu-ai-act/sdk
│   │   ├── src/
│   │   │   ├── classifier/
│   │   │   │   ├── engine.ts       # Classification logic (pure, deterministic)
│   │   │   │   ├── questions.ts    # Question tree for interactive mode
│   │   │   │   └── reasoning.ts    # Human-readable reasoning chain
│   │   │   ├── checklists/
│   │   │   │   ├── generator.ts    # Generate checklist from tier
│   │   │   │   └── scoring.ts      # Compliance score calculation
│   │   │   ├── templates/
│   │   │   │   ├── renderer.ts     # Render template with inputs
│   │   │   │   └── schemas.ts      # Input validation per template
│   │   │   ├── timeline/
│   │   │   │   └── events.ts       # Timeline event computation
│   │   │   ├── data/
│   │   │   │   ├── loader.ts       # Load embedded JSON data
│   │   │   │   └── types.ts        # All TypeScript types/interfaces
│   │   │   └── index.ts            # Public API exports
│   │   ├── tsup.config.ts          # Build config (embeds data/)
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── cli/                        # eu-ai-act CLI
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── classify.ts
│   │   │   │   ├── checklist.ts
│   │   │   │   ├── timeline.ts
│   │   │   │   ├── generate.ts
│   │   │   │   ├── status.ts
│   │   │   │   └── report.ts
│   │   │   ├── state.ts            # .eu-ai-act.json read/write
│   │   │   ├── i18n.ts             # CLI string loading
│   │   │   └── index.ts            # CLI entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                        # Next.js web app
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx                    # Landing page
│       │   │   ├── classify/page.tsx           # Risk classifier wizard
│       │   │   ├── checklist/[tier]/page.tsx   # Interactive checklists
│       │   │   ├── timeline/page.tsx           # Visual timeline
│       │   │   ├── templates/page.tsx          # Documentation generator
│       │   │   └── examples/[slug]/page.tsx    # Worked examples
│       │   ├── components/
│       │   │   ├── classifier/
│       │   │   │   ├── ClassifierWizard.tsx
│       │   │   │   ├── QuestionCard.tsx
│       │   │   │   ├── ResultCard.tsx
│       │   │   │   └── ProgressBar.tsx
│       │   │   ├── checklist/
│       │   │   │   ├── ChecklistView.tsx
│       │   │   │   ├── ChecklistItem.tsx
│       │   │   │   └── ComplianceScore.tsx
│       │   │   ├── timeline/
│       │   │   │   ├── Timeline.tsx
│       │   │   │   ├── TimelineEvent.tsx
│       │   │   │   └── CountdownBanner.tsx
│       │   │   ├── templates/
│       │   │   │   ├── TemplateSelector.tsx
│       │   │   │   ├── TemplateEditor.tsx
│       │   │   │   └── ExportButton.tsx
│       │   │   └── shared/
│       │   │       ├── ArticleReference.tsx
│       │   │       ├── RiskBadge.tsx
│       │   │       ├── Disclaimer.tsx
│       │   │       └── Layout.tsx
│       │   └── lib/
│       │       ├── storage.ts      # localStorage wrapper
│       │       └── url-state.ts    # Shareable URL encode/decode
│       ├── messages/               # next-intl locale files
│       │   └── en.json
│       ├── public/
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── package.json
│       └── tsconfig.json
├── data/
│   ├── schema/                     # JSON Schema definitions
│   │   ├── questions.schema.json
│   │   ├── checklists.schema.json
│   │   ├── timeline.schema.json
│   │   ├── articles.schema.json
│   │   └── examples.schema.json
│   ├── articles.json
│   ├── annexes.json
│   ├── timeline.json
│   ├── questions.json
│   ├── checklists.json
│   └── examples.json
├── locales/                        # Shared i18n strings (CLI + SDK)
│   └── en/
│       ├── common.json
│       ├── classifier.json
│       ├── checklists.json
│       └── cli.json
├── turbo.json
├── package.json                    # Root workspace
├── tsconfig.base.json
└── vitest.workspace.ts
```

**Structure Decision**: Turborepo monorepo with three packages under
`packages/`. The `data/` directory sits at root level (not inside SDK)
because it is the canonical source and must be editable independently.
The SDK embeds data at build time via tsup so the published npm package
is self-contained. Locale files are split: `locales/` at root for
shared CLI/SDK strings, `messages/` inside web for next-intl.

## Complexity Tracking

No constitution violations to justify. Table intentionally left empty.
