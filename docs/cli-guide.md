# CLI Usage Guide

## Installation

Install globally:

```bash
npm install -g eu-ai-act
```

Or run without installing:

```bash
npx eu-ai-act
```

## Commands

### `classify`

Interactive classification wizard. Walks you through the 26-question decision tree to determine your AI system's risk tier.

```bash
eu-ai-act classify
```

### `checklist`

Displays the compliance checklist for your classified tier (or a specified tier).

```bash
eu-ai-act checklist
eu-ai-act checklist --tier high
```

### `timeline`

Shows the EU AI Act enforcement timeline with upcoming milestones.

```bash
eu-ai-act timeline
```

### `status`

Displays current compliance status: classification result, checklist progress, and score.

```bash
eu-ai-act status
```

### `generate`

Generates compliance document templates (e.g., conformity assessment, risk management plan).

```bash
eu-ai-act generate
eu-ai-act generate --template conformity-assessment
```

### `report`

Generates a full compliance report combining classification, checklist progress, and reasoning.

```bash
eu-ai-act report
eu-ai-act report --format json
```

## State File

The CLI stores classification answers, checklist progress, and project metadata in a local **`.eu-ai-act.json`** file in the current working directory. This file is created automatically when you first run `classify`.

```json
{
  "answers": { "q1": false, "q2": false, "q3a": true },
  "tier": "high",
  "completed": ["item-1", "item-2"],
  "lastUpdated": "2025-08-15T10:30:00Z"
}
```

You can commit this file to version control to track compliance status alongside your code.

## JSON Output Mode

All commands support `--json` for machine-readable output, useful for scripting and CI/CD:

```bash
eu-ai-act classify --json
eu-ai-act checklist --json
eu-ai-act status --json
eu-ai-act report --json
```

Example:

```bash
# Parse classification result in a script
TIER=$(eu-ai-act status --json | jq -r '.tier')
echo "Risk tier: $TIER"
```

## CI/CD Integration

### GitHub Actions

```yaml
name: AI Act Compliance Check
on: [push]
jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g eu-ai-act
      - run: eu-ai-act status --json
      - name: Check tier
        run: |
          TIER=$(eu-ai-act status --json | jq -r '.tier')
          if [ "$TIER" = "unacceptable" ]; then
            echo "::error::AI system classified as unacceptable risk"
            exit 1
          fi
```

### GitLab CI

```yaml
compliance-check:
  image: node:20
  script:
    - npm install -g eu-ai-act
    - eu-ai-act status --json
    - |
      TIER=$(eu-ai-act status --json | jq -r '.tier')
      if [ "$TIER" = "unacceptable" ]; then
        echo "Unacceptable risk — blocking pipeline"
        exit 1
      fi
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit
if [ -f ".eu-ai-act.json" ]; then
  TIER=$(npx eu-ai-act status --json | jq -r '.tier')
  if [ "$TIER" = "unacceptable" ]; then
    echo "ERROR: AI system classified as unacceptable risk. Commit blocked."
    exit 1
  fi
fi
```

## Further Reading

Refer to `packages/cli/README.md` for the full command reference, including all options and flags.
