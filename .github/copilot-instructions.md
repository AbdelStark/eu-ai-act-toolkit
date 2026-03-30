# EU AI Act Compliance Toolkit - Copilot Instructions

## Project Overview

This is an EU AI Act compliance toolkit **monorepo** with three packages:

| Package | Path | Description |
|---------|------|-------------|
| `@eu-ai-act/sdk` | `packages/sdk/` | Core SDK library |
| `eu-ai-act` | `packages/cli/` | CLI tool |
| Web app | `packages/web/` | Static web interface |

## SDK API (`@eu-ai-act/sdk`)

- `classify(systemDescription)` — Determine AI system risk tier
- `getChecklist(riskTier)` — Get compliance checklist for a tier
- `getTimeline(riskTier)` — Get compliance deadlines
- `generateTemplate(templateName, params)` — Generate compliance documents
- `getQuestions()` — Get interactive classification questionnaire

## CLI Commands (`eu-ai-act`)

- `classify` — Classify an AI system's risk tier
- `checklist` — Get compliance checklist
- `timeline` — Show compliance deadlines
- `status` — Check compliance status
- `generate` — Generate compliance documents
- `report` — Generate full compliance report

## Risk Tiers

Valid classifications: `prohibited`, `high-risk`, `gpai`, `gpai-systemic`, `limited`, `minimal`

## Compliance Data

- All data lives in `data/*.json` with JSON Schema validation (`data/schemas/`)
- Every compliance item **must** cite a specific EU AI Act Article (e.g., "Article 6")
- Validate with: `node scripts/validate-data.js`

## Architecture Rules

- **Classification is deterministic**: pure functions, no side effects
- **Web app is fully static**: no backend, localStorage only
- **Agent skills** available in `skills/` directory for automated workflows

## Key Commands

```bash
npm install                      # Install dependencies
npx turbo build                  # Build all packages
npx turbo test                   # Run all tests
node scripts/validate-data.js    # Validate compliance data
```

## Important Constraints

- **Do NOT provide legal advice** in any generated content
- Always include disclaimer: *"This tool provides general guidance only and does not constitute legal advice"*
- Every compliance requirement must reference a specific EU AI Act Article
- Keep classification logic deterministic and testable
- Data changes require schema validation before merge
