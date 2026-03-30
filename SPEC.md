# EU AI Act Toolkit - Product Specification

## Vision

The definitive open-source toolkit for EU AI Act compliance. Three components:

1. **`@eu-ai-act/sdk`** - TypeScript library for programmatic risk classification, checklist generation, and compliance tracking
2. **`eu-ai-act`** - CLI tool for terminal-based compliance workflows
3. **Web App** - Interactive dashboard with visual timeline, risk classifier wizard, and documentation generator

---

## Architecture

```
eu-ai-act-toolkit/
├── packages/
│   ├── sdk/                    # @eu-ai-act/sdk - Core TypeScript library
│   │   ├── src/
│   │   │   ├── classifier/     # Risk classification engine
│   │   │   ├── checklists/     # Checklist generation and tracking
│   │   │   ├── templates/      # Documentation template engine
│   │   │   ├── timeline/       # Enforcement timeline data and utilities
│   │   │   ├── data/           # Act articles, annexes, structured data
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── cli/                    # CLI application
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── classify.ts
│   │   │   │   ├── checklist.ts
│   │   │   │   ├── generate.ts
│   │   │   │   ├── timeline.ts
│   │   │   │   └── status.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                    # Web application
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx                    # Landing page
│       │   │   ├── classify/page.tsx           # Risk classifier wizard
│       │   │   ├── checklist/[tier]/page.tsx   # Interactive checklists
│       │   │   ├── timeline/page.tsx           # Visual enforcement timeline
│       │   │   ├── templates/page.tsx          # Documentation generator
│       │   │   └── examples/[slug]/page.tsx    # Worked examples
│       │   ├── components/
│       │   │   ├── classifier/
│       │   │   │   ├── ClassifierWizard.tsx
│       │   │   │   ├── QuestionCard.tsx
│       │   │   │   ├── ResultCard.tsx
│       │   │   │   └── ProgressBar.tsx
│       │   │   ├── checklist/
│       │   │   │   ├── ChecklistView.tsx
│       │   │   │   ├── ChecklistItem.tsx
│       │   │   │   └── ComplianceScore.tsx
│       │   │   ├── timeline/
│       │   │   │   ├── Timeline.tsx
│       │   │   │   ├── TimelineEvent.tsx
│       │   │   │   └── CountdownBanner.tsx
│       │   │   ├── templates/
│       │   │   │   ├── TemplateSelector.tsx
│       │   │   │   ├── TemplateEditor.tsx
│       │   │   │   └── ExportButton.tsx
│       │   │   └── shared/
│       │   │       ├── ArticleReference.tsx
│       │   │       ├── RiskBadge.tsx
│       │   │       └── Layout.tsx
│       │   └── lib/
│       │       └── sdk.ts              # SDK client wrapper
│       ├── public/
│       ├── package.json
│       └── tsconfig.json
├── data/
│   ├── articles.json           # Structured Act content (articles, recitals)
│   ├── annexes.json            # Annex I, III, IV, XI structured data
│   ├── timeline.json           # Enforcement dates and milestones
│   ├── questions.json          # Classification questionnaire tree
│   ├── checklists.json         # All checklist items with article refs
│   └── examples.json           # Worked example metadata
├── docs/                       # Existing markdown docs (kept as-is)
│   ├── checklists/
│   ├── classifier/
│   ├── templates/
│   ├── reference/
│   └── examples/
├── turbo.json                  # Turborepo config
├── package.json                # Root workspace
├── tsconfig.base.json
└── README.md
```

Monorepo managed with **Turborepo**. Packages linked via workspace references.

---

## Component 1: SDK (`@eu-ai-act/sdk`)

### Core API

```typescript
import { classify, getChecklist, getTimeline, generateTemplate } from '@eu-ai-act/sdk';

// Risk classification
const result = classify({
  socialScoring: false,
  realtimeBiometrics: false,
  isGPAI: true,
  gpaiFlops: 1e24,
  isOpenSource: true,
  annexIProduct: false,
  annexIIICategory: null,
  interactsWithPersons: true,
  generatesSyntheticContent: false,
});
// => { tier: 'gpai', subTier: 'standard', articles: [51, 52, 53], openSourceExemption: true }

// Get checklist for a tier
const checklist = getChecklist('high-risk');
// => { items: [{ id: 'art9-1', article: 9, text: '...', required: true, checked: false }, ...] }

// Get timeline
const timeline = getTimeline();
// => { events: [{ date: '2025-02-02', title: '...', description: '...', active: true }, ...] }

// Generate documentation template
const doc = generateTemplate('technical-documentation', {
  systemName: 'My AI System',
  provider: 'My Company',
  intendedPurpose: '...',
});
// => Markdown string with pre-filled template
```

### Data Types

```typescript
// Risk tiers
type RiskTier = 'prohibited' | 'high-risk' | 'gpai' | 'gpai-systemic' | 'limited' | 'minimal';

// Classification input
interface ClassificationInput {
  // Step 1: Prohibited practices (Article 5)
  socialScoring: boolean;
  realtimeBiometrics: boolean;
  subliminalManipulation: boolean;
  exploitsVulnerabilities: boolean;
  untargetedFacialScraping: boolean;
  emotionInferenceWorkplace: boolean;
  biometricCategorization: boolean;
  predictivePolicing: boolean;

  // Step 2: GPAI
  isGPAI: boolean;
  gpaiFlops?: number;              // Training compute in FLOPs
  isOpenSource?: boolean;
  designatedSystemicRisk?: boolean; // Designated by AI Office

  // Step 3: High-risk
  annexIProduct: boolean;           // Safety component under Annex I
  annexIRequiresThirdParty?: boolean;
  annexIIICategory?: AnnexIIICategory | null;

  // Step 4: Limited risk
  interactsWithPersons: boolean;
  generatesSyntheticContent: boolean;
  emotionRecognition: boolean;
  biometricCategorizing: boolean;   // Non-prohibited type
}

type AnnexIIICategory =
  | 'biometrics'
  | 'critical-infrastructure'
  | 'education'
  | 'employment'
  | 'essential-services'
  | 'law-enforcement'
  | 'migration'
  | 'justice-democracy';

// Classification result
interface ClassificationResult {
  tier: RiskTier;
  subTier?: string;                 // e.g., 'gpai-open-source', 'high-risk-third-party'
  articles: number[];               // Applicable articles
  obligations: Obligation[];
  openSourceExemption: boolean;
  conformityAssessment: 'self' | 'third-party' | 'none';
  enforcementDate: string;          // ISO date
  reasoning: string[];              // Step-by-step explanation of classification
}

interface Obligation {
  article: number;
  title: string;
  description: string;
  category: 'risk-management' | 'data-governance' | 'documentation' | 'record-keeping'
           | 'transparency' | 'human-oversight' | 'accuracy-robustness' | 'monitoring'
           | 'incident-reporting' | 'copyright' | 'training-data-summary';
}

// Checklist
interface Checklist {
  tier: RiskTier;
  items: ChecklistItem[];
  completionRate: number;           // 0-1
}

interface ChecklistItem {
  id: string;                       // e.g., 'art9-risk-identification'
  article: number;
  paragraph?: number;
  text: string;
  description: string;
  required: boolean;
  checked: boolean;
  evidence?: string;                // User-provided compliance evidence
  notes?: string;
}

// Timeline
interface TimelineEvent {
  date: string;                     // ISO date
  title: string;
  description: string;
  articles: number[];
  status: 'past' | 'upcoming' | 'future';
  daysUntil: number;               // Negative if past
  categories: RiskTier[];           // Which tiers are affected
}

// Template
type TemplateName =
  | 'technical-documentation'
  | 'risk-management-system'
  | 'data-governance'
  | 'human-oversight-plan'
  | 'monitoring-plan'
  | 'declaration-of-conformity';

interface TemplateInput {
  systemName: string;
  provider: string;
  intendedPurpose: string;
  version?: string;
  date?: string;
  [key: string]: string | undefined; // Additional fields vary by template
}
```

### Internal Modules

```
sdk/src/
├── classifier/
│   ├── engine.ts           # Classification logic (pure function, deterministic)
│   ├── questions.ts        # Question tree for interactive classification
│   └── reasoning.ts        # Generate human-readable reasoning chain
├── checklists/
│   ├── generator.ts        # Generate checklist from tier
│   ├── tracker.ts          # Track completion, persist state
│   └── scoring.ts          # Compliance score calculation
├── templates/
│   ├── renderer.ts         # Render template with inputs
│   ├── schemas.ts          # Input validation per template
│   └── export.ts           # Export to Markdown, DOCX, PDF
├── timeline/
│   ├── events.ts           # Timeline event computation
│   └── countdown.ts        # Days-until calculations
├── data/
│   ├── loader.ts           # Load JSON data files
│   └── types.ts            # All TypeScript types
└── index.ts                # Public API exports
```

---

## Component 2: CLI (`eu-ai-act`)

### Commands

```bash
# Interactive risk classification wizard
eu-ai-act classify
# => Walks through questions, outputs classification result

# Classify with flags (non-interactive)
eu-ai-act classify --gpai --flops 1e24 --open-source
# => gpai (standard) - Open source exemption applies

# Show checklist for a tier
eu-ai-act checklist high-risk
# => Prints full checklist with checkboxes

# Track checklist progress (saves to .eu-ai-act.json in project root)
eu-ai-act checklist high-risk --track
# => Interactive mode: check/uncheck items, add evidence notes

# Show compliance status
eu-ai-act status
# => Summary: 23/47 items complete (49%). Next deadline: Aug 2, 2026 (493 days)

# Show enforcement timeline
eu-ai-act timeline
# => Visual timeline with countdown to each milestone

# Generate documentation template
eu-ai-act generate technical-documentation --system "My AI" --provider "My Corp"
# => Outputs pre-filled markdown template to stdout or file

# Generate all required templates for a tier
eu-ai-act generate --tier high-risk --output ./compliance-docs/
# => Creates all 5 template files in output directory

# Export checklist/status as report
eu-ai-act report --format md
eu-ai-act report --format json
# => Compliance report suitable for auditors
```

### CLI UX Details

- Colors: green (complete), yellow (in progress), red (overdue/missing), dim (not applicable)
- Progress bars for compliance scores
- Countdown timers to enforcement dates
- Article references clickable in terminals that support hyperlinks (OSC 8)
- Interactive checkbox mode using arrow keys + space (like inquirer)
- JSON output mode for all commands (`--json` flag) for piping

### State File (`.eu-ai-act.json`)

```json
{
  "version": "1.0.0",
  "system": {
    "name": "My AI System",
    "provider": "My Company",
    "classifiedAt": "2026-03-30T10:00:00Z"
  },
  "classification": {
    "tier": "high-risk",
    "subTier": "annex-iii-employment",
    "conformityAssessment": "self"
  },
  "checklist": {
    "art9-risk-system": { "checked": true, "evidence": "See risk-mgmt-v2.pdf", "checkedAt": "2026-03-28" },
    "art9-risk-identification": { "checked": true, "evidence": "Risk register v3", "checkedAt": "2026-03-28" },
    "art10-data-governance": { "checked": false }
  }
}
```

### Tech Stack (CLI)

- **Framework**: Commander.js or Clipanion
- **Prompts**: @inquirer/prompts (interactive classification wizard, checkbox tracking)
- **Output**: chalk for colors, cli-table3 for tables, ora for spinners
- **Config**: cosmiconfig for .eu-ai-act.json discovery

---

## Component 3: Web App

### Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives (accessible, unstyled)
- **Animations**: Framer Motion (timeline, wizard transitions)
- **Charts**: D3 or Recharts (timeline visualization)
- **Export**: jsPDF + docx for document generation in browser
- **State**: URL state for shareable classifications (no backend needed)
- **Deployment**: Vercel (static export also supported)

### Pages

#### Landing Page (`/`)
- Hero: "Is your AI system compliant with the EU AI Act?" with CTA to classifier
- Countdown banner: days until next enforcement milestone
- Three cards: Classify, Checklist, Timeline
- Brief explanation of what the Act is and who it affects
- No signup, no paywall, no cookie banner beyond essential

#### Risk Classifier Wizard (`/classify`)
- Multi-step form, one question group per step
- Progress indicator at top
- Each question has an info tooltip with the relevant Article text
- Branching logic: skip irrelevant steps based on previous answers
- Result page: tier badge, applicable articles, enforcement date, link to checklist
- Shareable URL: `/classify?result=eyJ...` (base64-encoded result in query param)
- Option to download classification report as PDF

Steps:
1. Prohibited practices check (Article 5) - 8 yes/no questions
2. GPAI assessment - is it a foundation model? training compute? open-source?
3. High-risk Pathway A - safety component of regulated product?
4. High-risk Pathway B - Annex III category selector (8 areas, expandable sub-items)
5. Limited risk - transparency triggers
6. Result - classification with reasoning chain

#### Interactive Checklists (`/checklist/[tier]`)
- Full checklist for the selected tier
- Each item: checkbox, article reference (links to Act text), description expand
- Progress bar at top: X/Y complete (Z%)
- Filter: by article, by status (complete/incomplete/all)
- Persist state in localStorage (no account needed)
- Export as Markdown, JSON, or PDF
- Print-friendly view

#### Visual Timeline (`/timeline`)
- Horizontal scrollable timeline from Feb 2025 to Aug 2028
- Color-coded events by category (prohibitions=red, GPAI=orange, high-risk=blue, products=purple)
- "You are here" marker at today's date
- Countdown cards for upcoming milestones
- Click event to expand: what exactly applies, which articles, who's affected
- Responsive: vertical layout on mobile

#### Documentation Generator (`/templates`)
- Select template type from cards
- Fill in system details via form
- Live preview of generated document
- Export as Markdown or DOCX
- Pre-filled with the right structure for the selected tier

#### Worked Examples (`/examples/[slug]`)
- Chatbot, hiring tool, autonomous vehicle (from existing markdown)
- Walk through classification step-by-step with the wizard UI
- Show which checklist items apply and why
- "Classify a system like this" button that pre-fills the wizard

### Design Principles

- **No dark patterns.** This is a compliance tool. Trust is the product.
- **No signup wall.** Everything works without an account. LocalStorage for persistence.
- **Accessible.** WCAG 2.1 AA. Screen reader tested. Keyboard navigable.
- **Fast.** Static where possible. No unnecessary client-side JS. Core Web Vitals green.
- **Credible.** Every claim links to the specific Article. Legal text accessible on hover. No marketing fluff.
- **Shareable.** Classification results encoded in URLs. Screenshots look professional.
- **Multilingual-ready.** All user-facing strings externalized. i18n from day one (start with EN, FR next).

### Visual Design Direction

- Clean, institutional feel. Think gov.uk meets Linear.
- Primary color: deep navy (#1a1f36). Accent: EU flag blue (#003399).
- Risk tier colors: Red (prohibited), Orange (high-risk), Yellow (GPAI), Blue (limited), Green (minimal).
- Typography: Inter for UI, monospace for article references.
- Minimal decoration. Content-first. White space.
- EU flag or stars motif subtle in header/footer (establishes authority).

---

## Data Layer (`data/`)

All compliance data lives in structured JSON files. The SDK, CLI, and web app all consume the same data. Updates to the Act only require updating these files.

### `data/questions.json`

```json
{
  "steps": [
    {
      "id": "prohibited",
      "title": "Prohibited Practices",
      "description": "Article 5 of the EU AI Act prohibits certain AI practices entirely.",
      "questions": [
        {
          "id": "social-scoring",
          "text": "Does your AI system evaluate or classify natural persons based on their social behavior or personal characteristics, leading to detrimental treatment?",
          "article": 5,
          "paragraph": 1,
          "subparagraph": "c",
          "help": "This covers social scoring by public authorities that leads to unfavorable treatment in social contexts unrelated to the data collection context, or treatment that is disproportionate.",
          "ifYes": { "result": "prohibited", "reason": "Social scoring by public authorities is prohibited under Article 5(1)(c)." }
        }
      ]
    }
  ]
}
```

### `data/checklists.json`

```json
{
  "high-risk": {
    "items": [
      {
        "id": "art9-risk-system",
        "article": 9,
        "paragraph": 1,
        "text": "Establish a risk management system that operates throughout the entire lifecycle of the AI system",
        "description": "The risk management system must be a continuous iterative process planned and run throughout the entire lifecycle, requiring regular systematic review and updating.",
        "required": true,
        "category": "risk-management"
      }
    ]
  }
}
```

### `data/timeline.json`

```json
{
  "events": [
    {
      "date": "2024-08-01",
      "title": "EU AI Act enters into force",
      "description": "Regulation (EU) 2024/1689 published in Official Journal and enters into force.",
      "articles": [],
      "categories": ["all"]
    },
    {
      "date": "2025-02-02",
      "title": "Prohibited practices apply",
      "description": "Article 5 prohibitions and AI literacy obligations (Article 4) become enforceable.",
      "articles": [4, 5],
      "categories": ["prohibited"]
    },
    {
      "date": "2025-08-02",
      "title": "GPAI rules apply",
      "description": "Obligations for general-purpose AI model providers (Articles 51-55), governance structure, and penalties framework become enforceable.",
      "articles": [51, 52, 53, 54, 55],
      "categories": ["gpai", "gpai-systemic"]
    },
    {
      "date": "2026-08-02",
      "title": "High-risk requirements apply",
      "description": "All obligations for high-risk AI systems (Articles 6-43) become enforceable. Conformity assessments required before market placement.",
      "articles": [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 26, 27, 43, 49],
      "categories": ["high-risk"]
    },
    {
      "date": "2027-08-02",
      "title": "Legacy GPAI models and large-scale IT systems",
      "description": "GPAI models placed on market before August 2025 must comply. High-risk AI in large-scale EU IT systems (SIS II, VIS, Eurodac, etc.) must comply.",
      "articles": [111],
      "categories": ["gpai", "high-risk"]
    },
    {
      "date": "2028-08-02",
      "title": "Product safety components",
      "description": "High-risk AI systems that are safety components of products under Annex I Union harmonisation legislation must comply.",
      "articles": [6],
      "categories": ["high-risk"]
    }
  ]
}
```

### `data/articles.json`

Structured content of relevant articles. Each article has:
- Number, title, full text (for tooltip/reference display)
- Which risk tiers it applies to
- Cross-references to other articles

Keep this lightweight. Link to full text on artificialintelligenceact.eu rather than embedding all 400 pages.

---

## Build & Development

### Monorepo Setup

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

```json
// root package.json
{
  "name": "eu-ai-act-toolkit",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.4"
  }
}
```

### SDK Build

- TypeScript, compiled to ESM + CJS
- Bundled with tsup
- Zero runtime dependencies (data is embedded at build time)
- Published to npm as `@eu-ai-act/sdk`
- Tree-shakeable

### CLI Build

- TypeScript, compiled to single executable with pkg or bundled with esbuild
- Published to npm as `eu-ai-act` (global install: `npm i -g eu-ai-act`)
- Depends on `@eu-ai-act/sdk` (workspace reference)

### Web Build

- Next.js with static export support
- Can be deployed to Vercel, Netlify, or any static host
- Uses `@eu-ai-act/sdk` directly (workspace reference)
- No backend. All logic runs client-side. No user data leaves the browser.

---

## Testing

### SDK Tests

- Unit tests for classification engine (every branch of decision tree)
- Property-based tests: any input produces a valid RiskTier
- Snapshot tests for checklist generation
- Edge cases: boundary of 10^25 FLOPs, open-source + systemic risk, dual Annex I + III

### CLI Tests

- Integration tests: run commands, assert stdout output
- Interactive mode tested with mock stdin
- State file read/write tests

### Web Tests

- Component tests with Vitest + Testing Library
- E2E tests with Playwright for the classification wizard flow
- Accessibility audits with axe-core
- Visual regression tests for timeline component

---

## Future Roadmap (post-v1)

- **MCP Server**: Expose SDK as an MCP tool so AI agents can classify systems and check compliance
- **GitHub Action**: CI check that validates .eu-ai-act.json exists and is complete for high-risk projects
- **VS Code extension**: Inline compliance hints in AI project codebases
- **i18n**: French, German, Spanish, Italian translations
- **Harmonised standards mapping**: As CEN/CENELEC JTC 21 publishes standards, map them to checklist items
- **Compliance diff**: Compare two versions of a system's compliance state
- **Multi-system dashboard**: Track compliance across multiple AI systems in one org
- **NIST AI RMF crosswalk**: Side-by-side view mapping EU AI Act to NIST AI RMF
- **API mode**: REST API for integration into GRC (Governance, Risk, Compliance) platforms
