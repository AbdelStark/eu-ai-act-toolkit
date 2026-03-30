# CLI Command Contract: eu-ai-act

**Version**: 1.0.0
**Date**: 2026-03-30

## Global Options

All commands support:

| Flag       | Description                        |
|------------|------------------------------------|
| `--json`   | Output as JSON instead of human-readable |
| `--help`   | Show command help with disclaimer  |
| `--version`| Show CLI version                   |

## Commands

### `eu-ai-act classify`

Classify an AI system's risk tier.

**Interactive mode** (default when TTY):
```
eu-ai-act classify
```
Walks through questions step by step. Displays result with tier,
articles, reasoning, and next steps.

**Non-interactive mode** (flags):
```
eu-ai-act classify [flags]
```

| Flag                     | Type    | Description |
|--------------------------|---------|-------------|
| `--social-scoring`       | boolean | Article 5(1)(c) |
| `--realtime-biometrics`  | boolean | Article 5(1)(h) |
| `--subliminal`           | boolean | Article 5(1)(a) |
| `--exploits-vulnerabilities` | boolean | Article 5(1)(b) |
| `--facial-scraping`      | boolean | Article 5(1)(e) |
| `--emotion-workplace`    | boolean | Article 5(1)(f) |
| `--biometric-categorization` | boolean | Article 5(1)(g) |
| `--predictive-policing`  | boolean | Article 5(1)(d) |
| `--gpai`                 | boolean | General-purpose AI model |
| `--flops <number>`       | number  | Training compute in FLOPs |
| `--open-source`          | boolean | Open source GPAI model |
| `--systemic-risk`        | boolean | Designated systemic risk |
| `--annex-i`              | boolean | Safety component (Annex I) |
| `--annex-i-third-party`  | boolean | Requires third-party assessment |
| `--annex-iii <category>` | string  | Annex III category |
| `--interacts-persons`    | boolean | Interacts with natural persons |
| `--synthetic-content`    | boolean | Generates synthetic content |
| `--emotion-recognition`  | boolean | Performs emotion recognition |
| `--biometric-categorizing` | boolean | Biometric categorization |

**Output** (human-readable):
```
Risk Tier: High-Risk
Sub-tier: Annex III — Employment (Category 4)
Enforcement: August 2, 2026 (125 days)
Conformity: Self-assessment

Applicable Articles: 6, 9, 10, 11, 12, 13, 14, 15

Reasoning:
  1. ✗ Not prohibited (Article 5)
  2. ✗ Not a GPAI model
  3. ✗ Not an Annex I safety component
  4. ✓ Annex III Category 4: Employment — recruitment decisions
  → Classified as HIGH-RISK

Next: Run `eu-ai-act checklist high-risk` to see your obligations.
```

**Exit codes**: 0 = success, 1 = input error, 2 = no classification
(missing required flags in non-interactive mode)

**Side effect**: Saves classification to `.eu-ai-act.json`.

---

### `eu-ai-act checklist <tier>`

Display the compliance checklist for a risk tier.

| Argument | Required | Description |
|----------|----------|-------------|
| `tier`   | yes      | Risk tier (prohibited, high-risk, gpai, gpai-systemic, limited, minimal) |

| Flag       | Type    | Description |
|------------|---------|-------------|
| `--track`  | boolean | Enter interactive tracking mode |
| `--filter` | string  | Filter by article number or status (complete/incomplete) |

**Default output**: Full checklist with status from state file.

**Interactive mode** (`--track`): Arrow keys to navigate, space to
toggle, `e` to add/edit evidence, `q` to quit. Changes saved to
`.eu-ai-act.json` on each toggle.

**Exit codes**: 0 = success, 1 = invalid tier

---

### `eu-ai-act timeline`

Display the enforcement timeline.

**Output**: Table of milestones with date, title, status, countdown.
Color-coded: green (past), yellow (upcoming ≤90 days), red (upcoming
≤30 days), dim (future >90 days).

**Exit codes**: 0 = success

---

### `eu-ai-act status`

Show compliance summary.

**Requires**: `.eu-ai-act.json` in current or parent directory.

**Output**:
```
System: My AI System (My Company)
Tier: High-Risk (Annex III — Employment)
Classified: 2026-03-28

Compliance: 23/47 items (49%)
  ████████░░░░░░░░ 49%

Next deadline: August 2, 2026 (125 days)

Run `eu-ai-act checklist high-risk --track` to continue.
```

**Exit codes**: 0 = success, 1 = no state file found

---

### `eu-ai-act generate <template> [flags]`

Generate a compliance documentation template.

| Argument   | Required | Description |
|------------|----------|-------------|
| `template` | yes      | Template name (technical-documentation, risk-management-system, data-governance, human-oversight-plan, monitoring-plan, declaration-of-conformity) |

| Flag         | Type   | Description |
|--------------|--------|-------------|
| `--system`   | string | AI system name |
| `--provider` | string | Provider/organization name |
| `--purpose`  | string | Intended purpose |
| `--output`   | string | Output file path (default: stdout) |
| `--tier`     | string | Generate ALL templates for a tier (overrides template argument) |

**Output**: Markdown to stdout or file.

**Exit codes**: 0 = success, 1 = invalid template/tier,
2 = missing required flag

---

### `eu-ai-act report`

Export a compliance report.

| Flag       | Type   | Description |
|------------|--------|-------------|
| `--format` | string | Output format: md (default), json |
| `--output` | string | Output file path (default: stdout) |

**Requires**: `.eu-ai-act.json` in current or parent directory.

**Output**: Full compliance report with classification, checklist
progress, evidence notes, and timestamp.

**Exit codes**: 0 = success, 1 = no state file

---

## State File Discovery

The CLI searches for `.eu-ai-act.json` starting from the current
directory and walking up to the filesystem root (cosmiconfig-style).
If not found, commands that require state exit with code 1 and
a message directing the user to run `classify` first.

## Disclaimer

The `--help` output for every command includes:

> This tool does not constitute legal advice. Consult qualified
> legal counsel for compliance decisions.
