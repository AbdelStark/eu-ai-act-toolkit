# Research: Full Toolkit MVP

**Phase**: 0 — Outline & Research
**Date**: 2026-03-30

## Technology Decisions

### 1. Monorepo Tooling

**Decision**: Turborepo with npm workspaces
**Rationale**: Turborepo provides fast incremental builds with
dependency-aware task orchestration. npm workspaces (native to Node.js)
avoids adding yarn/pnpm as a requirement for contributors. Turborepo's
`dependsOn: ["^build"]` ensures the SDK builds before CLI and web.
**Alternatives considered**:
- Nx: More powerful but heavier, overkill for 3 packages
- Lerna: Effectively deprecated, Nx-backed now
- pnpm workspaces: Faster installs but adds contributor friction

### 2. SDK Build Tool

**Decision**: tsup (esbuild-based)
**Rationale**: Produces ESM + CJS dual output with type declarations.
Zero config for simple libraries. Can inline JSON data files at build
time via esbuild's `loader` option, making the published SDK
self-contained (no need to ship `data/` separately). Tree-shakeable
output.
**Alternatives considered**:
- tsc only: No bundling, would require shipping data/ alongside
- rollup: More config overhead, no meaningful advantage here
- unbuild: Good but less mature ecosystem

### 3. SDK Data Embedding Strategy

**Decision**: Import JSON files directly in TypeScript; tsup bundles
them into the output. At development time, JSON files are read from
`data/` via TypeScript's `resolveJsonModule`. At build time, tsup
inlines the data.
**Rationale**: Zero runtime file system access means the SDK works
in browsers (for the web app) and Node.js (for the CLI) identically.
No runtime `fs.readFileSync` or fetch calls. The SDK is a pure
library with no I/O.
**Alternatives considered**:
- Runtime file loading: Would break browser usage and add fs dependency
- Code generation: Convert JSON to .ts files. Adds build step
  complexity for marginal benefit
- Fetch from CDN: Violates zero-backend privacy principle

### 4. CLI Framework

**Decision**: Commander.js
**Rationale**: Mature, widely used, excellent TypeScript support.
Handles subcommands, flags, help generation. The SDK's SPEC.md
already uses Commander-style command patterns. Lightweight (single
dependency).
**Alternatives considered**:
- Clipanion: Better type safety but less community adoption
- oclif: Too heavy for a tool with 6 commands
- yargs: Functional but less ergonomic API

### 5. CLI Interactive Prompts

**Decision**: @inquirer/prompts
**Rationale**: Modern ESM-first rewrite of Inquirer.js. Supports
select, confirm, checkbox, and input prompts. Works with Commander.
Required for the interactive classification wizard and checklist
tracking mode.
**Alternatives considered**:
- prompts: Lighter but fewer prompt types
- clack: Beautiful but less mature, fewer prompt types
- enquirer: Maintenance concerns

### 6. Web Framework Configuration

**Decision**: Next.js 14+ with App Router, static export
**Rationale**: App Router provides file-based routing, layouts, and
loading states. Static export (`output: 'export'` in next.config.ts)
produces a fully static site with no server. This satisfies the
zero-backend privacy principle. The SDK is imported as a workspace
dependency and runs entirely client-side.
**Alternatives considered**:
- Astro: Good for static, but React component model less mature
- Vite + React Router: More manual routing setup
- Remix: Designed for server-side, misaligned with static-only

### 7. Web UI Component Library

**Decision**: Radix UI primitives + Tailwind CSS
**Rationale**: Radix provides unstyled, accessible primitives
(dialog, checkbox, accordion, tabs, tooltip, progress) that satisfy
WCAG 2.1 AA by default. Tailwind handles styling without CSS-in-JS
runtime cost. Together they provide accessible, performant, and
customizable UI.
**Alternatives considered**:
- shadcn/ui: Built on Radix + Tailwind but adds opinionated styles.
  Could use as a starting point and customize.
- Headless UI: Fewer components than Radix
- Ark UI: Newer, less battle-tested
- MUI: Heavy, opinionated, doesn't align with design direction

### 8. Internationalization Strategy

**Decision**: `next-intl` for web app, plain JSON locale files for
CLI/SDK. All strings keyed, no hardcoded user-facing text.
**Rationale**: `next-intl` integrates with App Router and supports
static export. For CLI/SDK, a simple JSON loader avoids adding a
runtime dependency to the SDK (keeps zero-dep promise). Shared
locale keys between web and CLI enable consistency.
**Alternatives considered**:
- i18next: Heavier, designed for more complex scenarios
- react-intl: Format.js ecosystem, works but next-intl has better
  App Router integration
- Custom: Rolling our own is unnecessary

### 9. Testing Strategy

**Decision**: Vitest for unit/integration (SDK + CLI), Playwright
for E2E (web), `@axe-core/playwright` for accessibility audits.
**Rationale**: Vitest is fast, compatible with TypeScript, and works
in the Turborepo monorepo. Playwright handles browser testing and
has axe-core integration for WCAG compliance checks in CI. The SDK
classification engine needs property-based tests (every input
produces a valid RiskTier); Vitest supports this via `fast-check`.
**Alternatives considered**:
- Jest: Slower, more config overhead with ESM
- Cypress: Heavier for E2E, less suited to static sites
- Testing Library only: Not sufficient for full E2E flows

### 10. JSON Schema Validation

**Decision**: Ajv (Another JSON Schema Validator) for CI validation
of `data/` files. JSON Schema draft-07 definitions in `data/schema/`.
**Rationale**: Ajv is the standard Node.js JSON Schema validator.
Schema definitions serve as documentation and enforce data integrity.
CI runs validation on every PR that touches `data/`.
**Alternatives considered**:
- Zod: TypeScript-first but not JSON Schema compatible
- TypeBox: Good TypeScript integration but less ecosystem support
- Manual validation scripts: Fragile, not standards-based

### 11. State File Schema

**Decision**: The `.eu-ai-act.json` state file includes a `version`
field (semver). The CLI validates the version on read and performs
forward-compatible parsing (ignore unknown fields, provide defaults
for missing fields). No automated migration — if the schema changes
incompatibly, the CLI warns and offers to re-classify.
**Rationale**: State files are small and easy to regenerate. Complex
migration logic is unnecessary for a local compliance tracking file.
The web app uses the same schema for import/export (FR-021a).
**Alternatives considered**:
- Automatic migration scripts: Overkill for this use case
- Breaking version change: Forces re-entry, acceptable for MVP

### 12. Shareable URL Encoding

**Decision**: Classification inputs encoded as base64url-encoded
JSON in a single `q` query parameter. Example:
`/classify?q=eyJzb2NpYWxTY29yaW5nIjpmYWxzZX0`
**Rationale**: Base64url avoids URL-unsafe characters. A single
parameter keeps URLs clean. Inputs-only encoding (per clarification)
means URLs are compact and results always use current classification
logic.
**Alternatives considered**:
- Individual query params per field: Verbose, hard to maintain
- URL hash: Not sent to server (fine for static), but analytics
  tools can't see them. Given no analytics, this is moot.
- Compressed encoding: Premature optimization
