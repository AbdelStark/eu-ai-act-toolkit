# Architecture Overview

## Monorepo Structure

This project is a Turborepo-managed monorepo with three main packages and a shared data layer:

```
eu-ai-act-toolkit/
├── data/                  # Shared data layer (single source of truth)
│   ├── schema/            # JSON Schema validation files
│   ├── questions.json
│   ├── checklists.json
│   ├── articles.json
│   ├── annexes.json
│   ├── examples.json
│   └── timeline.json
├── packages/
│   ├── sdk/               # Pure TypeScript library
│   ├── cli/               # Command-line interface
│   └── web/               # Next.js web application
├── turbo.json             # Turborepo pipeline configuration
└── package.json           # Root workspace configuration
```

## Data Layer

The `data/*.json` files are the **single source of truth** for all EU AI Act content. Every data file is validated against a corresponding JSON Schema in `data/schema/`. This ensures structural correctness and consistency across all consumers.

Data files include questions for risk classification, compliance checklists, article summaries, Annex III categories, worked examples, and enforcement timeline milestones.

## SDK (`packages/sdk`)

- **Pure TypeScript library** with zero runtime dependencies
- **Dual ESM + CJS** output for maximum compatibility
- Consumes `data/*.json` files via **tsup aliases**, bundling them at build time
- Exports classification logic, checklist generation, timeline queries, template rendering, and all associated types and constants
- Published as `@eu-ai-act/sdk`

## CLI (`packages/cli`)

- Built with **Commander.js** (command parsing) and **Inquirer** (interactive prompts)
- Depends on the SDK for all business logic
- Maintains project state in a local **`.eu-ai-act.json`** file
- Supports JSON output mode for scripting and CI/CD integration
- Published as `eu-ai-act`

## Web (`packages/web`)

- **Next.js 14** with the App Router
- **next-intl** for internationalization, supporting **14 languages**
- **Static export** — no backend server required; deployable to any static host
- Imports the SDK directly for classification and checklist logic

## Build Pipeline

| Package | Build Tool | Output |
|---------|-----------|--------|
| SDK | tsup | ESM + CJS bundles with data embedded |
| CLI | tsup | ESM bundle, bin entry point |
| Web | Next.js | Static HTML/CSS/JS export |

**Turborepo** orchestrates the build pipeline, ensuring correct dependency ordering: SDK builds first, then CLI and Web build in parallel.

## Data Flow

```
data/*.json
    │
    ▼
SDK (bundles data at build time)
    │
    ├──► CLI (imports SDK)
    │
    └──► Web (imports SDK)
```

1. **data/*.json** — Raw structured data, validated by JSON Schema
2. **SDK** — Bundles data files at build time via tsup aliases; exposes typed APIs
3. **CLI** — Imports SDK functions; provides terminal-based classification and compliance workflows
4. **Web** — Imports SDK functions; renders interactive classification wizard and compliance dashboards
