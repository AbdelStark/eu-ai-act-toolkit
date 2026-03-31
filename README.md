<p align="center">
  <h1 align="center">EU AI Act Toolkit</h1>
  <p align="center">
    Open-source compliance toolkit for <a href="https://artificialintelligenceact.eu/">Regulation (EU) 2024/1689</a>
  </p>
</p>

<p align="center">
  <a href="https://github.com/AbdelStark/eu-ai-act-toolkit/actions"><img src="https://img.shields.io/github/actions/workflow/status/AbdelStark/eu-ai-act-toolkit/ci.yml?branch=main&style=flat-square" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@eu-ai-act/sdk"><img src="https://img.shields.io/npm/v/@eu-ai-act/sdk?style=flat-square&label=sdk" alt="SDK version"></a>
  <a href="https://github.com/AbdelStark/eu-ai-act-toolkit/blob/main/LICENSE"><img src="https://img.shields.io/github/license/AbdelStark/eu-ai-act-toolkit?style=flat-square" alt="License"></a>
</p>

---

The EU AI Act is the first comprehensive AI regulation. Prohibitions are already enforceable. GPAI rules apply August 2025. Full high-risk requirements hit August 2026. Penalties go up to 35M EUR or 7% of global turnover.

This toolkit helps you figure out what applies to you and track your compliance. Three components, same data, no vendor lock-in.

| Component | What it does |
|-----------|-------------|
| **[`@eu-ai-act/sdk`](packages/sdk/)** | TypeScript library. Classify systems, generate checklists, render templates. |
| **[`eu-ai-act`](packages/cli/)** | CLI tool. Interactive classification wizard, compliance tracking, doc generation. |
| **[Web App](packages/web/)** | Visual dashboard. Timeline, classifier wizard, interactive checklists. |

## Get Started

### CLI

```bash
npx eu-ai-act classify
```

Walks you through a step-by-step classification of your AI system. Outputs which risk tier applies, which articles you need to comply with, and what to do next.

```bash
npx eu-ai-act checklist high-risk    # See all requirements for high-risk systems
npx eu-ai-act timeline               # Enforcement dates and countdowns
npx eu-ai-act generate --tier high-risk --output ./compliance/
```

See the full [CLI documentation](packages/cli/README.md).

### SDK

```bash
npm install @eu-ai-act/sdk
```

```typescript
import { classify, getChecklist, getTimeline } from '@eu-ai-act/sdk';

const result = classify({
  subliminalManipulation: false,
  exploitsVulnerabilities: false,
  socialScoring: false,
  predictivePolicing: false,
  untargetedFacialScraping: false,
  emotionInferenceWorkplace: false,
  biometricCategorization: false,
  realtimeBiometrics: false,
  isGPAI: true,
  gpaiFlops: 1e24,
  isOpenSource: true,
  annexIProduct: false,
  annexIIICategory: null,
  interactsWithPersons: true,
  generatesSyntheticContent: false,
  emotionRecognition: false,
  biometricCategorizing: false,
});

console.log(result.tier);        // 'gpai'
console.log(result.articles);    // [51, 53] (Article 52 excluded for open-source)
console.log(result.reasoning);   // Step-by-step explanation
```

See the full [SDK documentation](packages/sdk/README.md).

### Web App

```bash
git clone https://github.com/AbdelStark/eu-ai-act-toolkit.git
cd eu-ai-act-toolkit
npm install
npx turbo dev --filter=@eu-ai-act/web
```

Opens at `localhost:3000`. Everything runs client-side. No backend, no accounts, no data leaves your browser.

## What's Covered

### Risk Classification

Interactive decision tree that walks through the Act's classification logic:

1. **Prohibited practices** (Article 5) - social scoring, real-time biometrics, manipulative AI
2. **GPAI assessment** - foundation models, training compute thresholds, open-source exemptions
3. **High-risk** (Annex I + III) - safety components, biometrics, employment, critical infrastructure
4. **Limited risk** - transparency obligations for chatbots, deepfakes, emotion recognition
5. **Minimal risk** - voluntary codes only

The classifier outputs the applicable tier, relevant articles, enforcement date, and a reasoning chain explaining why.

### Compliance Checklists

92 checklist items across 6 risk tiers, each linked to a specific Article:

| Tier | Items | Key Articles |
|------|-------|-------------|
| High-Risk | 61 | Art. 9-15 (risk management, data governance, documentation, human oversight, accuracy) |
| GPAI Systemic Risk | 10 | Art. 55 (evaluations, adversarial testing, incident reporting) |
| GPAI | 9 | Art. 51-53 (technical docs, copyright, training data summary) |
| Limited Risk | 6 | Art. 50 (transparency: disclose AI interaction, label synthetic content) |
| Minimal Risk | 4 | Voluntary measures |
| Prohibited | 2 | Art. 5 (stop deployment) |

Checklists support evidence tracking, notes, and export to JSON/Markdown.

### Documentation Templates

Pre-structured templates for everything the Act requires from high-risk system providers:

- **Technical Documentation** (Annex IV) - system description, architecture, data, validation
- **Risk Management System** (Art. 9) - risk identification, evaluation, mitigation, residual risk
- **Data Governance** (Art. 10) - data provenance, bias assessment, representativeness
- **Human Oversight Plan** (Art. 14) - monitoring, interpretation, override, automation bias mitigation
- **Post-Market Monitoring** (Art. 72) - performance tracking, incident reporting, continuous improvement

### Enforcement Timeline

| Date | Milestone |
|------|-----------|
| **Feb 2, 2025** | Prohibited practices + AI literacy |
| **Aug 2, 2025** | GPAI obligations + governance + penalties |
| **Aug 2, 2026** | All high-risk requirements (Art. 6-43) |
| **Aug 2, 2027** | Legacy GPAI models + large-scale IT systems |
| **Aug 2, 2028** | Annex I product safety components |

### Worked Examples

Step-by-step classification walkthroughs for real scenarios:

- **Customer service chatbot** - Limited risk. Transparency obligations only.
- **AI hiring screening tool** - High-risk (Annex III, employment). Full Articles 9-15.
- **Autonomous vehicle** - High-risk + third-party conformity assessment.

## Architecture

```
eu-ai-act-toolkit/
├── packages/
│   ├── sdk/              # @eu-ai-act/sdk - classification engine, checklists, templates
│   ├── cli/              # eu-ai-act CLI - interactive terminal tool
│   └── web/              # Next.js web application
├── data/                 # Structured JSON - single source of truth
│   ├── questions.json    # Classification decision tree (26 questions, 5 steps)
│   ├── checklists.json   # All checklist items with article references
│   ├── timeline.json     # Enforcement dates
│   ├── articles.json     # Article text and cross-references
│   └── examples.json     # Worked example metadata
├── locales/              # i18n strings (English, more coming)
└── docs/                 # Static compliance documents
```

All three components consume the same `data/` directory. Updating the Act means updating JSON files, not code.

## Development

```bash
git clone https://github.com/AbdelStark/eu-ai-act-toolkit.git
cd eu-ai-act-toolkit
npm install
npx turbo build          # Build all packages
npx turbo dev            # Start dev servers
npx turbo test           # Run tests
```

Monorepo managed with [Turborepo](https://turbo.build/). SDK builds with [tsup](https://tsup.egoist.dev/) (ESM + CJS). Web app is [Next.js 14](https://nextjs.org/).

## Agent Integration

This toolkit is designed to be used by AI agents. Three approaches, depending on your setup.

### Agent Skills (recommended)

Install skills into your AI coding agent using [`npx skills`](https://github.com/vercel-labs/skills):

```bash
npx skills add AbdelStark/eu-ai-act-toolkit
```

This installs 3 skills into your agent's workspace:

| Skill | What it does |
|-------|-------------|
| `classify-ai-system` | Walk through EU AI Act risk classification for any AI system |
| `compliance-checklist` | Retrieve and track compliance obligations by risk tier |
| `generate-compliance-docs` | Generate documentation templates (technical docs, risk management, etc.) |

Skills work with Claude Code, Cursor, Copilot, Codex, Windsurf, and [40+ other agents](https://github.com/vercel-labs/skills#supported-agents).

### Claude Code Commands

If you use [Claude Code](https://docs.anthropic.com/en/docs/claude-code), this repo includes slash commands in `.claude/commands/`:

```
/classify          # Classify an AI system's risk tier
/checklist         # Show compliance checklist for a tier
/generate-docs     # Generate compliance documentation
```

Clone the repo and the commands are available automatically.

### Agent Context Files

For agents working on or with this codebase, we provide context files for all major AI coding tools:

| File | Agent |
|------|-------|
| [`AGENTS.md`](AGENTS.md) | Claude Code, Codex, and any agent that reads AGENTS.md |
| [`.cursorrules`](.cursorrules) | Cursor |
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | GitHub Copilot |

### Programmatic Use by Agents

Agents can use the SDK directly in code or shell out to the CLI:

```bash
# Quick classification via CLI (no install needed)
npx eu-ai-act classify --annex-iii employment --json

# Full checklist as JSON
npx eu-ai-act checklist high-risk --json

# Generate all docs for a tier
npx eu-ai-act generate --tier high-risk --system "My AI" --provider "Acme" --purpose "Hiring" --output ./docs/
```

All CLI commands support `--json` for machine-readable output that agents can parse.

## Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](AGENTS.md) | Architecture, data model, conventions — guide for AI coding agents |
| [SDK README](packages/sdk/README.md) | Integration guide for `@eu-ai-act/sdk` |
| [CLI README](packages/cli/README.md) | Usage guide for the `eu-ai-act` CLI |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute, development setup |

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

Things that would help most right now:
- Corrections to legal interpretations (cite the Article)
- Additional worked examples
- Translations (French and German are priorities)
- Harmonised standards mapping as CEN/CENELEC JTC 21 publishes them

## Project Status

This project is in **beta** (v0.1.0). The SDK classification engine, checklists, templates, timeline, gap analysis, and penalty calculations are functional and tested (321+ tests). The CLI is usable. The web app builds but depends on Google Fonts at build time.

**Suitable for**: Evaluating AI system risk tiers, generating initial compliance documentation, tracking obligations during pre-enforcement planning.

**Not yet suitable for**: Production compliance auditing without legal counsel review. The legal interpretations have not been independently validated by EU AI Act specialists.

**Known limitations**:
- Web app requires network access at build time (Google Fonts)
- SDK is not yet published to npm
- Only English locale is complete
- Harmonised standards mapping is preliminary (CEN/CENELEC JTC 21 standards are in development)

## Disclaimer

This toolkit helps organize and track compliance work. It does not constitute legal advice. Consult qualified legal counsel for compliance decisions. Not affiliated with the European Union or any EU institution.

## References

- [EU AI Act Full Text](https://artificialintelligenceact.eu/ai-act-explorer/)
- [Official Journal (EUR-Lex)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
- [EU AI Office](https://digital-strategy.ec.europa.eu/en/policies/ai-office)
- [NIST AI RMF](https://airc.nist.gov/)
- [ISO/IEC 42001](https://www.iso.org/standard/81230.html)

## License

[MIT](LICENSE)
