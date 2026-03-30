# Feature Specification: Full Toolkit MVP

**Feature Branch**: `001-full-toolkit-mvp`
**Created**: 2026-03-30
**Status**: Draft
**Input**: User description: "building the whole product with all components"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Classify an AI System's Risk Tier (Priority: P1)

A compliance officer at a company deploying AI in the EU needs to
determine which risk tier their AI system falls under. They want a
clear, step-by-step process that tells them exactly which obligations
apply, when enforcement begins, and what they need to do next.

**Why this priority**: Risk classification is the entry point to all
compliance work. Every other feature (checklists, templates, timeline)
depends on knowing the risk tier first. Without this, the toolkit has
no value.

**Independent Test**: A user can run the classification wizard (via
CLI or web app), answer questions about their AI system, and receive
a definitive risk tier with article references. The SDK can classify
a system programmatically given structured input.

**Acceptance Scenarios**:

1. **Given** a user answers "yes" to social scoring, **When** the
   classification completes, **Then** the result is "Prohibited"
   citing Article 5(1)(c).
2. **Given** a user indicates a GPAI model trained with >10^25 FLOPs,
   **When** classification completes, **Then** the result is "GPAI
   with Systemic Risk" citing Articles 51 and 55.
3. **Given** a user indicates their system is used for recruitment
   decisions, **When** classification completes, **Then** the result
   is "High-Risk" under Annex III category 4 (employment).
4. **Given** a user's system only interacts with natural persons
   (chatbot), **When** classification completes, **Then** the result
   is "Limited Risk" with transparency obligations.
5. **Given** none of the above apply, **When** classification
   completes, **Then** the result is "Minimal Risk" with no legal
   obligations.
6. **Given** a classification result, **When** the user views it,
   **Then** the result includes: tier name, applicable articles,
   enforcement date, a human-readable reasoning chain explaining
   each decision step, and a link to the relevant checklist.

---

### User Story 2 - Track Compliance Checklist Progress (Priority: P2)

A compliance officer who knows their risk tier needs to work through
the specific obligations, checking off items as they address them,
adding evidence notes, and tracking overall progress toward compliance.

**Why this priority**: After classification, the checklist is the
primary working tool. It turns abstract regulation into an actionable
task list. Persistent progress tracking is essential because compliance
work spans weeks or months.

**Independent Test**: A user can open a checklist for their risk tier,
check off items, attach evidence notes, see a progress summary, and
return later to find their progress intact. This works in both the CLI
and web app.

**Acceptance Scenarios**:

1. **Given** a user selects the "High-Risk" checklist, **When** the
   checklist loads, **Then** all items from Articles 9-15 are
   displayed with article references and descriptions.
2. **Given** a user checks off "art9-risk-system" with evidence
   "See risk-mgmt-v2.pdf", **When** they close and reopen the
   checklist, **Then** the item remains checked with the evidence
   note intact.
3. **Given** a checklist with 47 items and 23 checked, **When** the
   user views the progress summary, **Then** it shows "23/47
   complete (49%)".
4. **Given** a completed checklist, **When** the user exports it,
   **Then** the export includes all items, their status, evidence
   notes, and a timestamp.

---

### User Story 3 - Use the SDK Programmatically (Priority: P3)

A developer building internal compliance tooling wants to integrate
EU AI Act classification, checklist retrieval, and template generation
into their own applications using a well-typed TypeScript library with
no runtime dependencies.

**Why this priority**: The SDK is the foundation that powers both the
CLI and web app. It also serves developers who need programmatic
access without the CLI or web app. A solid SDK makes the entire
ecosystem reliable.

**Independent Test**: A developer can install `@eu-ai-act/sdk` from
npm, call the classification function with structured input, retrieve
a checklist by tier, and generate a documentation template — all with
full TypeScript types and no additional dependencies to install.

**Acceptance Scenarios**:

1. **Given** a developer installs `@eu-ai-act/sdk`, **When** they
   check `node_modules`, **Then** no additional runtime dependencies
   have been installed (zero `dependencies` in package.json).
2. **Given** a developer calls `classify()` with input matching a
   high-risk employment system, **When** the function returns,
   **Then** the result includes `tier: 'high-risk'`, an array of
   applicable article numbers, and a reasoning chain.
3. **Given** a developer calls `getChecklist('high-risk')`, **When**
   the function returns, **Then** every item has an `id`, `article`
   number, `text`, `description`, and `required` boolean.
4. **Given** a developer calls `generateTemplate('technical-documentation',
   { systemName: 'X', provider: 'Y', intendedPurpose: 'Z' })`,
   **When** the function returns, **Then** the output is a Markdown
   string with all placeholders filled.
5. **Given** the SDK is imported in a TypeScript project, **When**
   the developer uses autocomplete, **Then** all public functions,
   types, and interfaces are fully typed with JSDoc documentation.

---

### User Story 4 - View Enforcement Timeline (Priority: P4)

A compliance officer or legal advisor needs to understand the phased
enforcement schedule of the EU AI Act to plan compliance work and
communicate deadlines to stakeholders.

**Why this priority**: Timeline awareness drives urgency and planning.
Without it, teams may miss that certain obligations are already in
effect or misjudge how much time remains. Less critical than
classification and checklists because it's informational rather than
actionable.

**Independent Test**: A user can view the timeline (via CLI or web
app), see all enforcement milestones with dates, understand which
milestones have passed and which are upcoming, and see how many days
remain until the next deadline.

**Acceptance Scenarios**:

1. **Given** today is 2026-03-30, **When** the user views the
   timeline, **Then** events dated before today are marked as
   "past" and events after today show a countdown in days.
2. **Given** the timeline is displayed, **When** the user views
   an event, **Then** it shows the date, title, description,
   applicable articles, and which risk tiers are affected.
3. **Given** the user views the timeline in the CLI, **When** they
   use `eu-ai-act timeline`, **Then** the output is a formatted
   table with color-coded status (past/upcoming/future).

---

### User Story 5 - Generate Compliance Documentation (Priority: P5)

A compliance officer needs to produce the required documentation for
their high-risk AI system (technical documentation, risk management
plan, data governance report, human oversight plan, monitoring plan)
in a format that satisfies the requirements of Annex IV.

**Why this priority**: Documentation generation is the final step
in the compliance workflow — classify, check off obligations, then
produce the paperwork. It builds on all prior features and is less
urgent than the classification and tracking that inform it.

**Independent Test**: A user can select a documentation template,
provide basic system information, and receive a pre-structured
document with all required sections per Annex IV, ready to fill in
with system-specific details.

**Acceptance Scenarios**:

1. **Given** a user selects "Technical Documentation" template and
   provides system name, provider, and intended purpose, **When**
   the document generates, **Then** it contains all sections
   required by Annex IV with placeholders for system-specific detail.
2. **Given** a generated document, **When** the user exports it,
   **Then** it is available as Markdown (at minimum).
3. **Given** a user specifies `--tier high-risk`, **When** they
   request all templates, **Then** all five required documentation
   templates are generated.

---

### User Story 6 - Browse Worked Examples (Priority: P6)

A newcomer to the EU AI Act wants to understand how classification
works in practice by seeing how common AI systems (chatbot, hiring
tool, autonomous vehicle) are classified step by step.

**Why this priority**: Examples accelerate understanding and build
trust in the tool's accuracy. Lower priority because they are
educational rather than operational — a user can still classify
their own system without examples.

**Independent Test**: A user can browse a worked example, see the
classification reasoning applied to a real-world scenario, and
optionally pre-fill the classifier wizard with that example's
characteristics.

**Acceptance Scenarios**:

1. **Given** a user navigates to the chatbot example, **When** the
   page loads, **Then** they see a step-by-step walkthrough of how
   a chatbot is classified as "Limited Risk" with article references.
2. **Given** a user views the hiring tool example, **When** they
   click "Classify a system like this," **Then** the classifier
   wizard opens with the hiring tool's characteristics pre-filled.

---

### Edge Cases

- What happens when a system matches multiple risk tiers (e.g., both
  Annex I and Annex III)? The highest applicable tier applies, and
  the result must explain the combined classification.
- What happens when the EU AI Act text is updated or corrected via
  corrigendum? Only the `data/` JSON files need updating. No code
  changes required.
- What happens when a user's browser localStorage is cleared?
  Checklist progress and classification results are lost. The UI
  must communicate that data is stored locally and offer export
  as a backup mechanism.
- How does the CLI handle absence of a `.eu-ai-act.json` state
  file? Commands that require state (e.g., `status`) must display
  a clear message instructing the user to run `classify` first.
- What happens when classification input is ambiguous (e.g., "I
  don't know" to a question)? The wizard must offer contextual
  help for each question and allow the user to revisit answers.

## Requirements *(mandatory)*

### Functional Requirements

**Data Layer**

- **FR-001**: The system MUST store all compliance data (articles,
  checklists, timeline events, classification questions, examples)
  in structured JSON files under a `data/` directory.
- **FR-002**: Every data entry MUST include an `article` field
  referencing the specific Article of Regulation 2024/1689.
- **FR-003**: The data schema MUST be validated in CI against a
  JSON Schema definition.

**SDK**

- **FR-004**: The SDK MUST expose a `classify()` function that
  accepts structured input describing an AI system and returns a
  risk tier, applicable articles, enforcement date, conformity
  assessment type, and reasoning chain.
- **FR-005**: The SDK MUST expose a `getChecklist()` function that
  returns all checklist items for a given risk tier, each with
  article reference, description, and required/optional status.
- **FR-006**: The SDK MUST expose a `getTimeline()` function that
  returns all enforcement milestones with computed status (past,
  upcoming, future) and countdown in days relative to the current
  date.
- **FR-007**: The SDK MUST expose a `generateTemplate()` function
  that accepts a template name and system details and returns a
  Markdown string with pre-filled content.
- **FR-008**: The SDK MUST have zero runtime dependencies
  (`dependencies` in package.json must be empty).
- **FR-009**: The SDK MUST export TypeScript type definitions for
  all public interfaces.

**CLI**

- **FR-010**: The CLI MUST provide an interactive classification
  wizard that walks the user through questions and displays the
  result with article references.
- **FR-011**: The CLI MUST support non-interactive classification
  via command-line flags (e.g., `--gpai --flops 1e24`).
- **FR-012**: The CLI MUST provide a `checklist` command that
  displays the checklist for a given risk tier with progress
  tracking.
- **FR-013**: The CLI MUST persist classification results and
  checklist progress in a local `.eu-ai-act.json` state file.
  Each state file tracks exactly one AI system. Users tracking
  multiple systems MUST use separate project directories.
- **FR-014**: The CLI MUST provide a `timeline` command displaying
  enforcement milestones with countdown.
- **FR-015**: The CLI MUST provide a `generate` command for
  producing documentation templates.
- **FR-016**: The CLI MUST support JSON output for all commands
  via a `--json` flag.
- **FR-017**: The CLI MUST provide a `status` command summarizing
  classification and checklist progress.

**Web App**

- **FR-018**: The web app MUST run entirely client-side with no
  backend, no server-side data storage, and no network requests
  that transmit user data.
- **FR-019**: The web app MUST provide an interactive risk
  classification wizard with branching logic, progress indicator,
  and contextual help per question.
- **FR-020**: The web app MUST provide interactive checklists with
  checkbox state, evidence notes, progress bar, and filtering.
- **FR-021**: The web app MUST persist user state (classification
  results, checklist progress) in browser localStorage. The web
  app tracks one AI system at a time per browser.
- **FR-021a**: The web app MUST support exporting state as a
  `.eu-ai-act.json` file and importing a `.eu-ai-act.json` file
  to restore state. The file schema MUST be identical to the CLI
  state file, enabling data portability between components.
- **FR-022**: The web app MUST provide a visual enforcement
  timeline with color-coded events and countdown.
- **FR-023**: The web app MUST provide a documentation template
  generator with live preview and export.
- **FR-024**: The web app MUST display a "not legal advice"
  disclaimer on every page that produces compliance output.
- **FR-025**: The web app MUST meet WCAG 2.1 AA accessibility
  standards: keyboard navigation, screen reader compatibility,
  sufficient color contrast, visible focus indicators.
- **FR-026**: The web app MUST support shareable classification
  results via URL-encoded query parameters. The URL MUST encode
  classification inputs only (not derived results). The recipient's
  browser re-runs classification against the current data, ensuring
  results always reflect the latest classification logic.
- **FR-027**: The web app MUST provide worked examples that walk
  through classification step by step for common AI systems.

**Cross-Cutting**

- **FR-028**: All user-facing strings MUST be externalized in
  locale files to support internationalization.
- **FR-029**: The initial release MUST support English. The string
  externalization structure MUST support adding additional
  languages without code changes.
- **FR-030**: Every page, screen, or output that produces
  compliance-related content MUST include a disclaimer that the
  toolkit does not constitute legal advice.

### Key Entities

- **AI System Profile**: Represents a user's AI system with
  attributes used for classification (prohibited practice flags,
  GPAI indicators, Annex I/III categories, transparency triggers).
- **Classification Result**: The output of the classification
  process — risk tier, sub-tier, applicable articles, obligations,
  enforcement date, conformity assessment type, and reasoning chain.
- **Checklist**: A collection of compliance items for a specific
  risk tier, each traceable to an Article, with completion status
  and evidence notes.
- **Checklist Item**: A single obligation with article reference,
  description, required/optional flag, checked status, and
  optional evidence text.
- **Timeline Event**: An enforcement milestone with date, title,
  description, applicable articles, affected risk tiers, and
  computed status relative to today.
- **Documentation Template**: A structured document skeleton for
  a specific compliance document (technical documentation, risk
  management, etc.) that can be populated with system-specific
  details.
- **Worked Example**: A pre-configured AI system scenario (e.g.,
  chatbot, hiring tool) with classification walkthrough and
  applicable checklist items.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete the full classification wizard
  (all decision steps) in under 5 minutes with no prior knowledge
  of the EU AI Act.
- **SC-002**: Classification results are deterministic — the same
  inputs always produce the same tier, articles, and reasoning.
- **SC-003**: Every checklist item in the toolkit traces to a
  specific Article and paragraph of Regulation 2024/1689, verified
  against the official text.
- **SC-004**: The web app scores 100% on automated accessibility
  checks (axe-core) at WCAG 2.1 AA level.
- **SC-005**: The web app loads its landing page in under 2 seconds
  on a standard broadband connection.
- **SC-006**: A developer can install the SDK, classify a system,
  and retrieve a checklist in under 10 lines of code.
- **SC-007**: All six risk tiers (prohibited, high-risk, GPAI,
  GPAI systemic, limited, minimal) are correctly classifiable
  with appropriate test inputs.
- **SC-008**: Checklist progress persists across sessions (browser
  or CLI) without data loss under normal usage.
- **SC-009**: Updating a single enforcement date in the data layer
  requires changing exactly one JSON file and zero code files.
- **SC-010**: The toolkit includes at least 3 worked examples
  covering different risk tiers (prohibited/high-risk, GPAI, and
  limited/minimal).

## Clarifications

### Session 2026-03-30

- Q: Does the toolkit support multiple concurrent AI system profiles? → A: Single system per workspace/browser. One `.eu-ai-act.json` per project directory. Multi-system tracking is out of scope for MVP.
- Q: Can users transfer compliance state between CLI and web app? → A: Web app can export/import `.eu-ai-act.json` files. CLI reads/writes the file natively. Both share the same schema.
- Q: What data do shareable classification URLs encode? → A: Inputs only. Classification is deterministic, so the recipient re-runs it and gets the same result. Keeps URLs short and always reflects latest logic.

## Assumptions

- Users have a modern browser (last 2 major versions of Chrome,
  Firefox, Safari, Edge) or Node.js 18+ for CLI usage.
- The initial release targets English only. French localization
  is planned for a fast-follow release, not MVP.
- The existing Markdown checklists, decision tree, templates, and
  examples in the repository serve as the authoritative source
  for the structured JSON data migration.
- The project uses a monorepo structure with workspace references
  between SDK, CLI, and web app packages.
- Document export in the web app supports Markdown at minimum.
  DOCX and PDF export are desirable but not required for MVP.
- The CLI interactive mode requires a TTY-capable terminal. In
  non-TTY environments (CI, piped input), the CLI falls back to
  flag-based non-interactive mode.
- Classification logic covers the current regulation text as of
  the Official Journal corrigendum. Future delegated acts or
  implementing acts may require data updates.
