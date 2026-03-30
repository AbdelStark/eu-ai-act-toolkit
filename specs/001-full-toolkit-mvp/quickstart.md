# Quickstart: EU AI Act Compliance Toolkit

## Prerequisites

- Node.js 18+
- npm 9+

## Setup (development)

```bash
git clone https://github.com/user/eu-ai-act-toolkit.git
cd eu-ai-act-toolkit
npm install
npm run build
```

## Using the SDK

```bash
npm install @eu-ai-act/sdk
```

```typescript
import {
  classify,
  getChecklist,
  getTimeline,
  generateTemplate
} from '@eu-ai-act/sdk';

// 1. Classify your AI system
const result = classify({
  socialScoring: false,
  realtimeBiometrics: false,
  subliminalManipulation: false,
  exploitsVulnerabilities: false,
  untargetedFacialScraping: false,
  emotionInferenceWorkplace: false,
  biometricCategorization: false,
  predictivePolicing: false,
  isGPAI: false,
  annexIProduct: false,
  annexIIICategory: 'employment',
  interactsWithPersons: true,
  generatesSyntheticContent: false,
  emotionRecognition: false,
  biometricCategorizing: false,
});

console.log(result.tier);        // 'high-risk'
console.log(result.articles);    // [6, 9, 10, 11, 12, 13, 14, 15]
console.log(result.reasoning);   // ['Not prohibited...', 'Not GPAI...', ...]

// 2. Get the checklist for your tier
const checklist = getChecklist('high-risk');
console.log(checklist.items.length); // ~47 items

// 3. Check the enforcement timeline
const timeline = getTimeline();
const next = timeline.find(e => e.status === 'upcoming');
console.log(`${next.title}: ${next.daysUntil} days`);

// 4. Generate documentation template
const doc = generateTemplate('technical-documentation', {
  systemName: 'Hiring Screener',
  provider: 'Acme Corp',
  intendedPurpose: 'Automated resume screening for job applications',
});
// doc is a Markdown string ready to fill in
```

## Using the CLI

```bash
npm install -g eu-ai-act

# Interactive classification wizard
eu-ai-act classify

# Non-interactive classification
eu-ai-act classify --annex-iii employment --interacts-persons

# View your checklist
eu-ai-act checklist high-risk

# Track progress interactively
eu-ai-act checklist high-risk --track

# Check compliance status
eu-ai-act status

# View enforcement timeline
eu-ai-act timeline

# Generate documentation
eu-ai-act generate technical-documentation \
  --system "Hiring Screener" \
  --provider "Acme Corp" \
  --purpose "Automated resume screening"

# Generate all templates for your tier
eu-ai-act generate --tier high-risk --output ./compliance-docs/

# Export compliance report
eu-ai-act report --format md --output compliance-report.md

# JSON output (for piping/scripting)
eu-ai-act classify --gpai --flops 1e24 --json
```

## Using the Web App

```bash
# Development
cd packages/web
npm run dev
# Open http://localhost:3000

# Production build (static export)
npm run build
# Output in packages/web/out/ — deploy to any static host
```

### Web app pages

- `/` — Landing page with enforcement countdown
- `/classify` — Interactive risk classification wizard
- `/checklist/high-risk` — Interactive compliance checklist
- `/timeline` — Visual enforcement timeline
- `/templates` — Documentation template generator
- `/examples/chatbot` — Worked example: chatbot classification

## Verify it works

After setup, run the test suite:

```bash
# All tests
npm test

# SDK tests only
npm test --filter=sdk

# Web E2E + accessibility
npm test --filter=web
```

Expected: all classification paths produce correct tiers, all
checklist items trace to articles, axe-core reports zero AA
violations.
