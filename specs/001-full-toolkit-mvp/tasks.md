# Tasks: Full Toolkit MVP

**Input**: Design documents from `/specs/001-full-toolkit-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Test tasks omitted. Testing infrastructure is set up in Phase 1 for future use.

**Organization**: Tasks grouped by user story. US3 (SDK DX) is reordered to Phase 7 because it requires all SDK functions from US1, US2, US4, US5 to exist before packaging.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Exact file paths included in every task description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Monorepo structure, configs, tooling

- [x] T001 Create root package.json with npm workspaces config in package.json
- [x] T002 [P] Create shared TypeScript config in tsconfig.base.json (strict mode, ES2022, resolveJsonModule)
- [x] T003 [P] Create Turborepo config in turbo.json (build, dev, test, lint tasks with dependsOn)
- [x] T004 [P] Create SDK package scaffold: packages/sdk/package.json (name: @eu-ai-act/sdk, zero dependencies) and packages/sdk/tsconfig.json
- [x] T005 [P] Create CLI package scaffold: packages/cli/package.json (dependencies: @eu-ai-act/sdk, commander, @inquirer/prompts, chalk, cli-table3) and packages/cli/tsconfig.json
- [x] T006 [P] Create web package scaffold: packages/web/package.json (dependencies: @eu-ai-act/sdk, next, react, tailwindcss, @radix-ui/react-*, next-intl) and packages/web/tsconfig.json
- [x] T007 [P] Create Vitest workspace config in vitest.workspace.ts (SDK + CLI projects)
- [x] T008 [P] Create web build configs: packages/web/next.config.ts (output: 'export', static) and packages/web/tailwind.config.ts

**Checkpoint**: `npm install` succeeds, `npm run build` runs (empty builds pass), monorepo structure verified.

---

## Phase 2: Foundational (Data Layer + SDK Core + i18n + Web Shell)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create JSON Schema definitions in data/schema/questions.schema.json, data/schema/checklists.schema.json, data/schema/timeline.schema.json, data/schema/articles.schema.json, data/schema/examples.schema.json
- [x] T010 [P] Create data/questions.json — classification questionnaire tree with all Article 5 prohibited practices, GPAI assessment, Annex I, Annex III categories, and limited risk questions. Each question has id, text, article, paragraph, help, and branching logic
- [x] T011 [P] Create data/checklists.json — checklist items for all 6 tiers (prohibited, high-risk, gpai, gpai-systemic, limited, minimal) sourced from existing markdown checklists. Each item has id, article, paragraph, text, description, required, category
- [x] T012 [P] Create data/timeline.json — 6 enforcement milestones from existing README (2024-08-01 through 2028-08-02) with date, title, description, articles, categories
- [x] T013 [P] Create data/articles.json — structured article references for Articles 4-55 with number, title, summary, applicable tiers, and EUR-Lex links
- [x] T014 [P] Create data/annexes.json — Annex III categories (8 areas with sub-items) sourced from existing reference/annex-iii-high-risk-areas.md
- [x] T015 Create all SDK TypeScript types and interfaces in packages/sdk/src/data/types.ts (RiskTier, AnnexIIICategory, ClassificationInput, ClassificationResult, Obligation, ChecklistItem, Checklist, ChecklistProgress, TimelineEvent, TemplateName, TemplateInput, StateFile, QuestionStep, Question, WorkedExample) per data-model.md
- [x] T016 Create SDK data loader in packages/sdk/src/data/loader.ts — imports JSON files from data/ via resolveJsonModule, exports typed accessors (getQuestionsData, getChecklistsData, getTimelineData, getArticlesData)
- [x] T017 [P] Create i18n locale files: locales/en/common.json (shared terms, disclaimer text), locales/en/classifier.json (wizard strings), locales/en/checklists.json (checklist UI strings), locales/en/cli.json (CLI output strings)
- [x] T018 [P] Create web shared components: packages/web/src/components/shared/Layout.tsx (nav, footer with disclaimer), packages/web/src/components/shared/Disclaimer.tsx, packages/web/src/components/shared/ArticleReference.tsx (links to EUR-Lex), packages/web/src/components/shared/RiskBadge.tsx (color-coded tier badge)
- [x] T019 [P] Create web app layout in packages/web/src/app/layout.tsx (next-intl provider, Tailwind, Inter font) and packages/web/messages/en.json (next-intl locale file)
- [x] T020 [P] Create CLI i18n loader in packages/cli/src/i18n.ts — loads strings from locales/en/*.json, exports t() function for string lookup

**Checkpoint**: Foundation ready. `npm run build` compiles SDK types and data loader. JSON files validate against schemas. Web app renders empty layout. CLI i18n loads strings.

---

## Phase 3: User Story 1 — Classify an AI System's Risk Tier (Priority: P1)

**Goal**: Users can classify their AI system via SDK, CLI, or web wizard and receive a definitive risk tier with article references and reasoning chain.

**Independent Test**: Run `eu-ai-act classify --annex-iii employment --interacts-persons` and verify output shows "High-Risk" with Articles 6, 9-15. Open `/classify` in browser, answer questions, see result. Call `classify()` from SDK with structured input.

### Implementation for User Story 1

- [x] T021 [US1] Implement SDK classification engine in packages/sdk/src/classifier/engine.ts — pure function classify(input: ClassificationInput): ClassificationResult with precedence: prohibited → GPAI → high-risk Pathway A → Pathway B → limited → minimal. Handle dual Annex I+III edge case per sdk-api.md contract
- [x] T022 [US1] Implement SDK reasoning chain in packages/sdk/src/classifier/reasoning.ts — generates string[] explaining each classification step (e.g., "Not prohibited (Article 5)", "Annex III Category 4: Employment")
- [x] T023 [US1] Implement SDK question tree accessor in packages/sdk/src/classifier/questions.ts — getQuestions(): QuestionStep[] returning typed question tree from data/questions.json with branching logic
- [x] T024 [US1] Implement CLI state file read/write in packages/cli/src/state.ts — findStateFile() walks up directories, readState(), writeState() for .eu-ai-act.json with version validation per research.md decision #11
- [x] T025 [US1] Implement CLI classify command (non-interactive mode) in packages/cli/src/commands/classify.ts — all 19 flags per cli-commands.md, maps flags to ClassificationInput, calls SDK classify(), formats human-readable output with chalk colors, saves to state file. Exit codes 0/1/2
- [x] T026 [US1] Implement CLI classify command (interactive wizard) in packages/cli/src/commands/classify.ts — uses @inquirer/prompts to walk through SDK getQuestions(), supports TTY detection, falls back to non-interactive in non-TTY environments
- [x] T027 [P] [US1] Create web ClassifierWizard component in packages/web/src/components/classifier/ClassifierWizard.tsx — multi-step form, manages wizard state, calls SDK classify() on completion, implements branching logic from question tree
- [x] T028 [P] [US1] Create web QuestionCard component in packages/web/src/components/classifier/QuestionCard.tsx — renders single question with yes/no toggle, info tooltip showing Article text via ArticleReference, keyboard navigable
- [x] T029 [P] [US1] Create web ProgressBar component in packages/web/src/components/classifier/ProgressBar.tsx — shows current step / total steps, accessible progress indicator
- [x] T030 [US1] Create web ResultCard component in packages/web/src/components/classifier/ResultCard.tsx — displays tier badge, applicable articles, enforcement date, reasoning chain, link to checklist page, shareable URL button
- [x] T031 [US1] Implement web URL state encode/decode in packages/web/src/lib/url-state.ts — encodeClassificationInput() to base64url JSON in ?q= param, decodeClassificationInput() to parse shared URLs per research.md decision #12
- [x] T032 [US1] Create web classify page in packages/web/src/app/classify/page.tsx — integrates ClassifierWizard, handles ?q= param for shared URLs (decode → re-classify → show result), includes Disclaimer component

**Checkpoint**: Classification works end-to-end across all 3 components. All 6 risk tiers classifiable. Reasoning chain explains each step. CLI saves state. Web wizard is keyboard navigable. Shared URLs work.

---

## Phase 4: User Story 2 — Track Compliance Checklist Progress (Priority: P2)

**Goal**: Users can view the checklist for their risk tier, check off items with evidence notes, track progress, and persist state across sessions.

**Independent Test**: Run `eu-ai-act checklist high-risk --track`, check off items, quit, re-run and verify items remain checked. Open `/checklist/high-risk` in browser, check items, refresh, verify persistence. Export state file from web and import into CLI.

### Implementation for User Story 2

- [x] T033 [US2] Implement SDK checklist generator in packages/sdk/src/checklists/generator.ts — getChecklist(tier: RiskTier): Checklist returns all items for the tier from data/checklists.json. Throws RangeError for invalid tier
- [x] T034 [US2] Implement SDK compliance scoring in packages/sdk/src/checklists/scoring.ts — calculateScore(items: ChecklistItem[], progress: Record<string, ChecklistProgress>): number returns 0-1 completion rate
- [x] T035 [US2] Implement CLI checklist command in packages/cli/src/commands/checklist.ts — displays checklist with status from state file, --track flag for interactive mode (arrow keys, space toggle, 'e' for evidence, 'q' quit), --filter by article/status, saves on each toggle
- [x] T036 [US2] Implement CLI status command in packages/cli/src/commands/status.ts — reads state file, displays system name, tier, compliance progress bar, next deadline countdown. Exit code 1 if no state file
- [x] T037 [P] [US2] Create web ChecklistItem component in packages/web/src/components/checklist/ChecklistItem.tsx — Radix checkbox, expandable description, evidence text input, article reference link, keyboard accessible
- [x] T038 [P] [US2] Create web ComplianceScore component in packages/web/src/components/checklist/ComplianceScore.tsx — progress bar showing X/Y complete (Z%), accessible ARIA attributes
- [x] T039 [US2] Create web ChecklistView component in packages/web/src/components/checklist/ChecklistView.tsx — renders all items via ChecklistItem, filter controls (by article, by status), ComplianceScore at top
- [x] T040 [US2] Implement web localStorage wrapper in packages/web/src/lib/storage.ts — getState(), setState(), clearState() for StateFile schema in localStorage, export as .eu-ai-act.json file download, import from .eu-ai-act.json file upload (FR-021a)
- [x] T041 [US2] Create web checklist page in packages/web/src/app/checklist/[tier]/page.tsx — loads checklist via SDK, reads/writes progress via storage.ts, includes Disclaimer, export/import buttons
- [x] T042 [US2] Implement web data export/import UI in packages/web/src/lib/storage.ts and packages/web/src/app/checklist/[tier]/page.tsx — download button generates .eu-ai-act.json, upload button parses and restores state with version validation

**Checkpoint**: Checklist tracking works across CLI and web. Progress persists. Export from web → import to CLI works. Status command shows summary.

---

## Phase 5: User Story 4 — View Enforcement Timeline (Priority: P4)

**Goal**: Users can view the phased enforcement schedule with dates, countdowns, and color-coded status.

**Independent Test**: Run `eu-ai-act timeline` and see table with past/upcoming/future events. Open `/timeline` and see visual timeline with "You are here" marker.

### Implementation for User Story 4

- [x] T043 [US4] Implement SDK timeline events in packages/sdk/src/timeline/events.ts — getTimeline(referenceDate?: Date): TimelineEvent[] computes status and daysUntil for each event from data/timeline.json relative to reference date
- [x] T044 [US4] Implement CLI timeline command in packages/cli/src/commands/timeline.ts — cli-table3 table with color-coded rows (chalk: green past, yellow ≤90 days, red ≤30 days, dim future), countdown column, --json support
- [x] T045 [P] [US4] Create web Timeline component in packages/web/src/components/timeline/Timeline.tsx — horizontal scrollable timeline, "You are here" marker at today, responsive vertical on mobile
- [x] T046 [P] [US4] Create web TimelineEvent component in packages/web/src/components/timeline/TimelineEvent.tsx — expandable event card with date, title, description, articles, affected tiers, color-coded by category
- [x] T047 [P] [US4] Create web CountdownBanner component in packages/web/src/components/timeline/CountdownBanner.tsx — shows next upcoming milestone with days countdown, used on landing page and timeline page
- [x] T048 [US4] Create web timeline page in packages/web/src/app/timeline/page.tsx — integrates Timeline, CountdownBanner, Disclaimer

**Checkpoint**: Timeline displays correctly with past/upcoming/future status. Countdowns compute accurately. Responsive on mobile.

---

## Phase 6: User Story 5 — Generate Compliance Documentation (Priority: P5)

**Goal**: Users can generate pre-structured documentation templates (technical documentation, risk management, data governance, human oversight, monitoring plan) with their system details filled in.

**Independent Test**: Run `eu-ai-act generate technical-documentation --system "X" --provider "Y" --purpose "Z"` and get a complete Markdown template. Open `/templates`, select template, fill form, see live preview.

### Implementation for User Story 5

- [x] T049 [US5] Implement SDK template schemas in packages/sdk/src/templates/schemas.ts — per-template input validation (required/optional fields) for all 6 template types, throws TypeError on invalid input
- [x] T050 [US5] Implement SDK template renderer in packages/sdk/src/templates/renderer.ts — generateTemplate(name, input): string renders Markdown with interpolated fields, [TODO: field] for unfilled optional fields. Templates sourced from existing templates/ markdown files in repo
- [x] T051 [US5] Implement CLI generate command in packages/cli/src/commands/generate.ts — accepts template name + flags (--system, --provider, --purpose, --output, --tier), outputs Markdown to stdout or file. --tier generates all templates for a tier
- [x] T052 [US5] Implement CLI report command in packages/cli/src/commands/report.ts — reads state file, generates compliance report (classification + checklist progress + evidence), supports --format md/json, --output
- [x] T053 [P] [US5] Create web TemplateSelector component in packages/web/src/components/templates/TemplateSelector.tsx — card grid of 6 template types with descriptions
- [x] T054 [US5] Create web TemplateEditor component in packages/web/src/components/templates/TemplateEditor.tsx — input form for system details, live Markdown preview of generated template using SDK generateTemplate()
- [x] T055 [US5] Create web ExportButton and templates page: packages/web/src/components/templates/ExportButton.tsx (download as .md file) and packages/web/src/app/templates/page.tsx (integrates selector, editor, export, Disclaimer)

**Checkpoint**: All 6 template types generate correctly. CLI outputs to stdout and file. Web shows live preview. Annex IV sections present in technical documentation template.

---

## Phase 7: User Story 3 — SDK Developer Experience (Priority: P3)

**Goal**: The SDK is publishable to npm with zero dependencies, full TypeScript types, JSDoc on all public APIs, and a clear entry point. A developer can install it and be productive in under 10 lines of code.

**Independent Test**: Build the SDK, verify dist/ contains index.mjs, index.cjs, index.d.ts. Import in a fresh TypeScript project, call classify(), getChecklist(), getTimeline(), generateTemplate() — all with full autocomplete and type safety.

**Note**: Reordered from P3 to Phase 7 because it requires all SDK functions (from US1, US2, US4, US5) to exist before the public API surface can be finalized.

### Implementation for User Story 3

- [x] T056 [US3] Create SDK public API barrel export in packages/sdk/src/index.ts — re-exports classify, getChecklist, getTimeline, generateTemplate, getQuestions, getExamples and all public types per sdk-api.md contract
- [x] T057 [US3] Configure SDK build in packages/sdk/tsup.config.ts — ESM + CJS dual output, dts generation, data/ JSON inlined at build time, tree-shakeable
- [x] T058 [US3] Finalize SDK package.json — exports field (import/require/types), main, module, types, files, keywords, description, license, repository. Verify zero dependencies
- [x] T059 [US3] Add JSDoc documentation to all public functions and types in packages/sdk/src/ — every exported function has @param, @returns, @throws, @example per sdk-api.md contract
- [x] T060 [US3] Create CLI entry point in packages/cli/src/index.ts — Commander program with all 6 commands registered, bin field in package.json, --help with disclaimer, --version, --json global option

**Checkpoint**: `npm run build` in packages/sdk produces dist/ with ESM + CJS + types. `npm pack` produces publishable tarball with zero dependencies. TypeScript autocomplete works for all public APIs.

---

## Phase 8: User Story 6 — Browse Worked Examples (Priority: P6)

**Goal**: Users can browse step-by-step classification walkthroughs for common AI systems (chatbot, hiring tool, autonomous vehicle) and pre-fill the classifier wizard.

**Independent Test**: Open `/examples/chatbot`, see classification walkthrough with article references. Click "Classify a system like this" and verify classifier wizard opens with chatbot inputs pre-filled.

### Implementation for User Story 6

- [x] T061 [US6] Create data/examples.json — 3 worked examples (chatbot → limited, hiring-tool → high-risk, autonomous-vehicle → high-risk) with slug, title, description, classificationInput, expectedTier, walkthrough narrative sourced from existing examples/ markdown files
- [x] T062 [US6] Implement SDK getExamples() in packages/sdk/src/data/loader.ts — returns typed WorkedExample[] from data/examples.json
- [x] T063 [US6] Create web examples page in packages/web/src/app/examples/[slug]/page.tsx — renders walkthrough steps with article references, shows expected classification result, "Classify a system like this" button links to /classify?q= with pre-filled inputs
- [x] T064 [US6] Add examples index to web landing page or navigation — link to /examples/chatbot, /examples/hiring-tool, /examples/autonomous-vehicle from nav or landing page cards

**Checkpoint**: All 3 examples render with step-by-step walkthrough. Pre-fill button creates correct shared URL. Classification of pre-filled inputs matches expectedTier.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Landing page, CI validation, configuration, final quality pass

- [x] T065 [P] Create web landing page in packages/web/src/app/page.tsx — hero with CTA to /classify, CountdownBanner for next milestone, 3 feature cards (Classify, Checklist, Timeline), brief Act explanation, no signup
- [x] T066 [P] Create JSON Schema CI validation script — Node.js script using Ajv to validate all data/*.json against data/schema/*.schema.json, runnable via `npm run validate:data`
- [x] T067 [P] Configure ESLint + Prettier for monorepo — root .eslintrc.js, .prettierrc, lint scripts in turbo.json, warnings-as-errors in CI
- [x] T068 Verify static export: run `next build` with output: 'export' in packages/web, confirm out/ directory contains all 7 pages as static HTML with no server dependencies
- [x] T069 Run accessibility audit on all web pages using axe-core (manual or via Playwright script), fix any WCAG 2.1 AA violations
- [x] T070 Validate quickstart.md end-to-end: follow every SDK, CLI, and web app example, confirm outputs match documented expectations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Classification (Phase 3)**: Depends on Phase 2
- **US2 Checklists (Phase 4)**: Depends on Phase 2. Can run parallel to US1 at SDK level, but CLI state.ts (T024) from US1 is reused
- **US4 Timeline (Phase 5)**: Depends on Phase 2. Can run parallel to US1/US2
- **US5 Templates (Phase 6)**: Depends on Phase 2. Can run parallel to US1/US2/US4
- **US3 SDK DX (Phase 7)**: Depends on US1 + US2 + US4 + US5 (all SDK functions must exist)
- **US6 Examples (Phase 8)**: Depends on US1 (classification must work for pre-fill). Depends on US3 (getExamples export)
- **Polish (Phase 9)**: Depends on all user stories complete

### Within Each User Story

- SDK functions before CLI commands
- SDK functions before web components
- Web components before web pages
- CLI state (T024) is a dependency for US2 CLI tasks

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run in parallel (T002-T008)
- All Phase 2 data tasks (T010-T014) can run in parallel
- Phase 2 locale/web/CLI infra (T017-T020) can run in parallel
- Within US1: web components T027-T029 can run in parallel
- Within US2: web components T037-T038 can run in parallel
- Within US4: web components T045-T047 can run in parallel
- US4 (Phase 5) and US5 (Phase 6) can run in parallel after Phase 2
- All Phase 9 tasks T065-T067 can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (data + SDK types + i18n)
3. Complete Phase 3: User Story 1 — Classification
4. **STOP and VALIDATE**: Classify all 6 risk tiers via SDK, CLI, and web
5. Deploy web app to verify static export works

### Incremental Delivery

1. Setup + Foundation → Monorepo builds, data validates
2. Add US1 (Classification) → Core value proposition works → Deploy
3. Add US2 (Checklists) → Compliance tracking works → Deploy
4. Add US4 (Timeline) → Enforcement awareness → Deploy
5. Add US5 (Templates) → Documentation generation → Deploy
6. Add US3 (SDK DX) → SDK publishable to npm
7. Add US6 (Examples) → Educational content → Deploy
8. Polish → Production-ready

### Parallel Team Strategy

With multiple developers after Phase 2 completes:

- Developer A: US1 (Classification) → US3 (SDK DX)
- Developer B: US2 (Checklists) → US6 (Examples)
- Developer C: US4 (Timeline) + US5 (Templates)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- US3 reordered to Phase 7 (from P3) due to dependency on all SDK functions
- Each user story independently testable at its checkpoint
- Commit after each task or logical group
- Data tasks (T010-T014) should reference existing markdown files in the repo as source material
- All web components must be keyboard navigable and pass axe-core checks
- All CLI commands must support --json flag per contract
- All user-facing strings must use i18n keys, not hardcoded text
