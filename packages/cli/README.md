# eu-ai-act

**EU AI Act Compliance Toolkit CLI** — Classify AI systems, track compliance checklists, and generate documentation required under the EU AI Act.

> **Disclaimer:** This tool does not constitute legal advice. Consult qualified legal counsel for compliance decisions.

## Installation

```bash
npm i -g eu-ai-act
```

Or use without installing:

```bash
npx eu-ai-act --help
```

## Quick Start

```bash
# 1. Classify your AI system
eu-ai-act classify

# 2. View your compliance obligations
eu-ai-act checklist high-risk

# 3. Check your progress
eu-ai-act status

# 4. Generate documentation
eu-ai-act generate conformity --system "MyAI" --provider "Acme Corp" --purpose "Customer support chatbot"

# 5. Export a compliance report
eu-ai-act report --output report.md
```

## Commands

### `eu-ai-act classify`

Classify your AI system's risk tier under the EU AI Act. Runs an interactive wizard by default.

**Interactive mode:**
```bash
eu-ai-act classify
```

**Flag mode (for CI/scripting):**
```bash
eu-ai-act classify --gpai --flops 1e25
eu-ai-act classify --social-scoring
eu-ai-act classify --annex-iii biometrics --json
```

**Flags:**
| Flag | Description |
|------|-------------|
| `--social-scoring` | Article 5(1)(c) — social scoring |
| `--realtime-biometrics` | Article 5(1)(h) — real-time biometric ID |
| `--subliminal` | Article 5(1)(a) — subliminal techniques |
| `--exploits-vulnerabilities` | Article 5(1)(b) — exploits vulnerabilities |
| `--facial-scraping` | Article 5(1)(e) — untargeted facial scraping |
| `--emotion-workplace` | Article 5(1)(f) — emotion in workplace |
| `--biometric-categorization` | Article 5(1)(g) — biometric categorization |
| `--predictive-policing` | Article 5(1)(d) — predictive policing |
| `--gpai` | General-purpose AI model |
| `--flops <number>` | Training compute in FLOPs |
| `--open-source` | Open source GPAI model |
| `--systemic-risk` | Designated systemic risk |
| `--annex-i` | Safety component (Annex I) |
| `--annex-i-third-party` | Requires third-party assessment |
| `--annex-iii <category>` | Annex III high-risk category |
| `--interacts-persons` | Interacts with natural persons |
| `--synthetic-content` | Generates synthetic content |
| `--emotion-recognition` | Performs emotion recognition |
| `--biometric-categorizing` | Biometric categorization |
| `--json` | Output as JSON |

**Example output:**
```
  Classification Result
  ────────────────────────────────────────

  🤖 Risk Tier:    GPAI
  📅 Enforcement: 2025-08-02
  📋 Conformity:  none

  Applicable Articles
  51, 52, 53

  Reasoning
  1. ✗ Not prohibited — no prohibited practices detected
  2. ✓ General-purpose AI model detected
  3. → Classified as GPAI (standard)
```

### `eu-ai-act checklist <tier>`

Display the compliance checklist for a risk tier.

```bash
eu-ai-act checklist high-risk
eu-ai-act checklist gpai --filter incomplete
eu-ai-act checklist limited --json
eu-ai-act checklist high-risk --filter 9        # Filter by Article 9
```

**Options:**
| Flag | Description |
|------|-------------|
| `--filter <value>` | Filter: `complete`, `incomplete`, or article number |
| `--json` | Output as JSON |

**Valid tiers:** `prohibited`, `high-risk`, `gpai`, `gpai-systemic`, `limited`, `minimal`

### `eu-ai-act timeline`

Display the EU AI Act enforcement timeline with key compliance dates.

```bash
eu-ai-act timeline
eu-ai-act timeline --json
```

**Example output:**
```
  📅 EU AI Act Enforcement Timeline
  ────────────────────────────────────────

  ┌──────────────┬──────────────────────────────────┬────────────┬──────────────┐
  │ Date         │ Milestone                        │ Status     │ Countdown    │
  ├──────────────┼──────────────────────────────────┼────────────┼──────────────┤
  │ 2024-08-01   │ EU AI Act enters into force      │ ✓ Done     │ 606d ago     │
  │ 2025-02-02   │ Prohibited practices apply       │ ✓ Done     │ 421d ago     │
  │ 2025-08-02   │ GPAI rules apply                 │ ✓ Done     │ 240d ago     │
  │ 2026-08-02   │ High-risk requirements apply     │ ○ Future   │ 125d left    │
  └──────────────┴──────────────────────────────────┴────────────┴──────────────┘
```

### `eu-ai-act status`

Show compliance summary for your classified AI system. Requires running `classify` first.

```bash
eu-ai-act status
eu-ai-act status --json
```

**Example output:**
```
  📊 Compliance Status
  ────────────────────────────────────────

  System:     AI System (Provider)
  Tier:       GPAI
  Classified: 2026-03-30

  Compliance: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% (0/9)

  Next deadline: High-risk requirements apply
  2026-08-02 (125 days remaining)
```

### `eu-ai-act generate [template]`

Generate pre-filled compliance documentation from built-in templates.

```bash
# Single template
eu-ai-act generate conformity --system "MyAI" --provider "Acme" --purpose "Customer support"

# Save to file
eu-ai-act generate risk-assessment --system "Scorer" --provider "Corp" --purpose "Credit scoring" --output risk.md

# Generate ALL templates for a tier
eu-ai-act generate --tier high-risk --system "MyAI" --provider "Co" --purpose "Hiring" --output ./docs/
```

**Available templates:** `conformity`, `risk-assessment`, `model-card`, `impact-assessment`, `transparency-notice`

**Required options:**
| Flag | Description |
|------|-------------|
| `--system <name>` | AI system name |
| `--provider <name>` | Provider/organization name |
| `--purpose <text>` | Intended purpose of the system |
| `--output <path>` | Output file path (default: stdout) |
| `--tier <tier>` | Generate ALL templates for a tier |

### `eu-ai-act report`

Export a full compliance report combining classification, checklist progress, and deadlines.

```bash
eu-ai-act report                        # Print Markdown to stdout
eu-ai-act report --output report.md     # Save to file
eu-ai-act report --json                 # JSON output
eu-ai-act report --format json -o r.json
```

**Options:**
| Flag | Description |
|------|-------------|
| `--format <type>` | Output format: `md` (default) or `json` |
| `--output <path>` | Write to file instead of stdout |
| `--json` | Shorthand for `--format json` |

## Configuration

### `.eu-ai-act.json`

The CLI stores classification state in a `.eu-ai-act.json` file in the current directory. This file is created automatically when you run `eu-ai-act classify` and is used by `status`, `checklist`, and `report` commands.

**Structure:**
```json
{
  "version": "1.0.0",
  "system": {
    "name": "AI System",
    "provider": "Provider",
    "classifiedAt": "2026-03-30T17:00:00.000Z"
  },
  "classification": {
    "tier": "high-risk",
    "subTier": null,
    "conformityAssessment": "third-party"
  },
  "checklist": {}
}
```

The CLI walks up the directory tree to find this file, so you can run commands from subdirectories.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NO_COLOR` | Set to any value to disable colored output (respects [no-color.org](https://no-color.org)) |
| `FORCE_COLOR` | Set to `1` to force colored output even when not a TTY |

## Global Options

| Flag | Description |
|------|-------------|
| `-v, --version` | Display the current version |
| `-h, --help` | Display help for a command |

## Error Handling

The CLI provides clear, actionable error messages:

```
  Error: Invalid tier "invalid-tier"

  Valid tiers: prohibited, high-risk, gpai, gpai-systemic, limited, minimal

  Run eu-ai-act classify to determine your tier.
```

```
  Error: No .eu-ai-act.json found in current directory tree.

  Run eu-ai-act classify first to classify your AI system.
```

## JSON Output

Every command supports `--json` for machine-readable output, making it easy to integrate with CI/CD pipelines, dashboards, or other tools:

```bash
eu-ai-act classify --gpai --json | jq '.tier'
eu-ai-act status --json | jq '.progress.percent'
eu-ai-act checklist high-risk --json | jq '.items | length'
```

## License

MIT
