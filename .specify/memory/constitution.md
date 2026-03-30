<!--
  Sync Impact Report
  ===========================================================================
  Version change: (none) → 1.0.0
  Type: MAJOR — initial ratification of project constitution

  Added principles:
    I.   Legal Accuracy (NON-NEGOTIABLE)
    II.  Zero-Backend Privacy
    III. Accessibility-First
    IV.  Single Source of Truth
    V.   Developer Experience over Feature Count
    VI.  Internationalization from Day One
    VII. No Legal Advice
    VIII. Credibility through Transparency

  Added sections:
    - Architecture Constraints (three-component structure)
    - Development Workflow (quality gates and review process)
    - Governance (amendment procedure, versioning, compliance)

  Removed sections: (none — initial creation)

  Templates requiring updates:
    ✅ .specify/templates/plan-template.md — Constitution Check section
       is generic; will be populated per-feature by /speckit.plan.
       No structural conflict with these principles.
    ✅ .specify/templates/spec-template.md — spec template is
       principle-agnostic. No changes needed.
    ✅ .specify/templates/tasks-template.md — task phases are generic.
       No structural conflict.
    ✅ No command files exist in .specify/templates/commands/.

  Follow-up TODOs: (none)
  ===========================================================================
-->

# EU AI Act Compliance Toolkit Constitution

## Core Principles

### I. Legal Accuracy (NON-NEGOTIABLE)

Every requirement, checklist item, and classification decision MUST
trace to a specific Article of Regulation (EU) 2024/1689. No
paraphrasing that alters legal meaning is permitted.

- Each data entry in `data/` MUST include an `article` field citing
  the source Article(s) and, where applicable, paragraph and point.
- Wording of obligations MUST be drawn directly from the official
  text or clearly marked as a plain-language summary with a link to
  the original provision.
- Any change to compliance data MUST be reviewed against the
  published regulation before merge.
- When harmonised standards (CEN/CENELEC JTC 21) or delegated acts
  supplement the regulation, these MUST be cited separately and
  never conflated with the base text.

### II. Zero-Backend Privacy

The web application runs entirely client-side. There is no backend,
no user accounts, no analytics, and no server-side data storage.

- The web app MUST NOT make network requests that transmit user
  data to any server, first-party or third-party.
- No cookies, fingerprinting, or tracking pixels are permitted.
- All user state (e.g., saved progress, classification results)
  MUST persist in the browser only (localStorage or IndexedDB)
  and MUST be deletable by the user at any time.
- The deployment artifact MUST be a static site exportable via
  `next export` (or equivalent static generation).

### III. Accessibility-First

WCAG 2.1 AA is the minimum bar. The toolkit is useless if
compliance teams cannot use it.

- All interactive elements MUST be keyboard navigable.
- All pages MUST pass automated accessibility checks (axe-core
  or equivalent) with zero violations at the AA level.
- Screen reader testing MUST be performed before any release
  that changes UI structure.
- Color contrast ratios MUST meet AA minimums (4.5:1 for normal
  text, 3:1 for large text).
- Focus indicators MUST be visible and never suppressed.

### IV. Single Source of Truth

All compliance data lives in structured JSON files under `data/`.
The SDK, CLI, and web app consume the same data. Updating the Act
means updating JSON, not code.

- The `data/` directory is the canonical source for articles,
  obligations, risk tiers, timelines, and checklist items.
- The SDK MUST read from `data/` at build time or runtime — never
  from hardcoded constants.
- The CLI and web app MUST consume data exclusively through the
  SDK's public API, never by reading `data/` directly.
- A change to `data/` MUST be the only step required to reflect
  a regulatory update across all three components.

### V. Developer Experience over Feature Count

Fewer features that work perfectly beat many features that work
partially. The CLI MUST feel as polished as git. The SDK MUST
have zero runtime dependencies.

- The SDK (`@eu-ai-act/sdk`) MUST ship with zero `dependencies`
  in its `package.json`. Dev dependencies are unrestricted.
- CLI commands MUST follow POSIX conventions: predictable flags,
  composable output (JSON by default, human-readable via `--pretty`),
  meaningful exit codes.
- Every public API surface MUST have TypeScript types, JSDoc
  documentation, and at least one usage example.
- New features MUST NOT be merged if they degrade the experience
  of existing features (performance, output clarity, API ergonomics).

### VI. Internationalization from Day One

All user-facing strings MUST be externalized. The EU has 24
official languages and compliance teams work in all of them.

- No user-facing string — in the CLI, SDK error messages, or web
  app — may be hardcoded in source files. All strings MUST reside
  in locale files under a `locales/` or `i18n/` directory.
- English (en) is the initial locale. French (fr) is the second
  target locale.
- Locale files MUST use a flat or namespaced key structure that
  supports interpolation (e.g., ICU MessageFormat or equivalent).
- Date, number, and list formatting MUST use `Intl` APIs, never
  manual string concatenation.

### VII. No Legal Advice

The toolkit helps organize and track compliance work. It does not
replace legal counsel. This distinction MUST be clear in every
user-facing surface.

- The web app MUST display a persistent disclaimer on every page
  that generates compliance output (e.g., classification results,
  checklists, gap analysis).
- The CLI MUST include a disclaimer in `--help` output and at the
  start of any compliance report.
- The SDK README, JSDoc, and npm package description MUST state
  that outputs are informational and not legal advice.
- No marketing copy, README, or documentation may imply that
  using the toolkit constitutes or guarantees legal compliance.

### VIII. Credibility through Transparency

The project is open source, cites its sources, links to official
text, and welcomes corrections. Trust is the product.

- Every compliance data entry MUST link to the corresponding
  provision in the official EUR-Lex publication or the AI Act
  Explorer.
- The project MUST maintain a CHANGELOG that documents data
  corrections, regulatory updates, and interpretation changes.
- Issue templates MUST include a category for "Data accuracy"
  so that errors in legal mappings can be reported and triaged
  with priority.
- Contributors MUST NOT need legal expertise to report an
  inaccuracy — the project provides clear reporting guidance.

## Architecture Constraints

The toolkit comprises three components that share a strict
dependency direction:

```
data/ (JSON) → @eu-ai-act/sdk → eu-ai-act CLI
                              → Next.js web app
```

- **`data/`**: Structured JSON files. No code. Version-controlled
  alongside the SDK. Schema-validated in CI.
- **`@eu-ai-act/sdk`**: TypeScript library. Zero runtime
  dependencies. Publishes to npm. Exposes all compliance logic
  as typed functions.
- **`eu-ai-act` CLI**: Node.js CLI. Depends only on the SDK and
  minimal CLI infrastructure (e.g., argument parsing). Publishes
  to npm as a global binary.
- **Web app**: Next.js static site. Depends only on the SDK and
  React. No API routes. No server components that fetch external
  data.

Cross-component rules:

- The CLI and web app MUST NOT import from each other.
- The SDK MUST NOT depend on the CLI or web app.
- Shared types live in the SDK. The CLI and web app import them.
- All three components MUST be testable independently.

## Development Workflow

### Quality Gates

Every pull request MUST pass the following before merge:

1. **Type check**: `tsc --noEmit` with strict mode enabled.
2. **Lint**: ESLint with no warnings (warnings treated as errors
   in CI).
3. **Unit tests**: All tests pass. Coverage MUST NOT decrease.
4. **Accessibility audit**: axe-core scan on any changed pages
   (web app PRs only).
5. **Data validation**: JSON schema validation on any changed
   files in `data/`.

### Review Process

- PRs that modify `data/` (compliance content) require review
  by a contributor who has verified the change against the
  official regulation text.
- PRs that modify public SDK API require review for backwards
  compatibility.
- PRs that add or remove user-facing strings require i18n review
  to confirm keys are externalized and translations are tracked.

### Branching and Release

- `main` is the stable branch. All work happens on feature
  branches merged via pull request.
- Releases follow semantic versioning. A change to `data/` that
  corrects a legal mapping is a PATCH. A new feature is MINOR.
  A breaking SDK API change is MAJOR.

## Governance

This constitution is the highest-authority document for project
decisions. When a code review, feature proposal, or architectural
decision conflicts with a principle above, the constitution wins.

### Amendment Procedure

1. Open an issue titled `constitution: <summary of change>`.
2. Propose the amendment as a pull request modifying this file.
3. The PR MUST include a Sync Impact Report (HTML comment at top)
   documenting version bump rationale and downstream effects.
4. At least one maintainer MUST approve. For MAJOR version bumps
   (principle removal or redefinition), two maintainers MUST
   approve.
5. After merge, all dependent templates and documentation MUST be
   updated within the same release cycle.

### Versioning Policy

- **MAJOR**: Principle removed, redefined, or governance change
  that breaks existing workflows.
- **MINOR**: New principle added, existing principle materially
  expanded, or new section added.
- **PATCH**: Clarifications, wording fixes, typo corrections,
  non-semantic refinements.

### Compliance Review

- Every feature spec (`/speckit.specify`) MUST include a
  constitution compliance check before implementation begins.
- Implementation plans (`/speckit.plan`) MUST populate the
  "Constitution Check" section with pass/fail for each
  applicable principle.
- Quarterly review: maintainers MUST review the constitution
  against the current state of the regulation, harmonised
  standards, and project scope. Findings are logged as issues.

**Version**: 1.0.0 | **Ratified**: 2026-03-30 | **Last Amended**: 2026-03-30
