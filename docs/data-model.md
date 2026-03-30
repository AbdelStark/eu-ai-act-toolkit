# Data Model Reference

## Risk Tiers

The EU AI Act defines **6 risk tiers** for AI systems:

| Tier | Name | Meaning |
|------|------|---------|
| `unacceptable` | Unacceptable Risk | Banned outright. Includes social scoring, real-time biometric surveillance (with narrow exceptions), and manipulative/exploitative AI. |
| `high` | High Risk | Subject to strict obligations: conformity assessments, risk management systems, data governance, transparency, human oversight, and registration in the EU database. |
| `general-purpose` | General-Purpose AI (GPAI) | Foundation models and general-purpose AI systems with specific transparency and documentation obligations. Systemic risk models face additional requirements. |
| `limited` | Limited Risk | Transparency obligations only — users must be informed they are interacting with AI (e.g., chatbots, deepfakes, emotion recognition). |
| `minimal` | Minimal Risk | No specific obligations under the Act. Voluntary codes of conduct encouraged. Covers the vast majority of AI systems. |
| `exempt` | Exempt | Explicitly excluded from the Act's scope (e.g., military/national security, purely personal use, open-source research). |

## Questions (`data/questions.json`)

A **5-step classification tree** with **26 questions** that guides users through determining the risk tier of an AI system.

Each question has:
- `id` — Unique identifier (e.g., `q1`, `q2a`)
- `step` — Which step of the classification flow (1–5)
- `text` — The question text presented to the user
- `article` — Reference to the relevant EU AI Act article
- `yes` / `no` — Next question ID or a terminal tier result

The classification tree evaluates in order: exemptions, unacceptable risk, high risk, GPAI, and limited risk, defaulting to minimal risk.

## Checklists (`data/checklists.json`)

Compliance checklists organized **per risk tier**. Each checklist item has:

| Field | Description |
|-------|-------------|
| `id` | Unique item identifier |
| `article` | EU AI Act article reference |
| `text` | Short obligation description |
| `description` | Detailed explanation of the requirement |
| `required` | Whether the item is mandatory for the tier |
| `category` | Obligation category (e.g., risk management, data governance, transparency) |

## Articles (`data/articles.json`)

Reference data for EU AI Act articles:

| Field | Description |
|-------|-------------|
| `number` | Article number |
| `title` | Article title |
| `summary` | Plain-language summary of the article |
| `tiers` | Which risk tiers the article applies to |
| `eurLexUrl` | Direct link to the article on EUR-Lex |

## Annexes (`data/annexes.json`)

**Annex III** categories define the domains where AI systems are classified as high-risk. Each category contains:
- Category name and description
- Sub-items listing specific high-risk use cases within that category

Examples of Annex III categories: biometric identification, critical infrastructure, education, employment, essential services, law enforcement, migration, and administration of justice.

## Examples (`data/examples.json`)

Worked classification scenarios that demonstrate how different AI systems are classified:

| Field | Description |
|-------|-------------|
| `name` | Scenario name |
| `description` | Description of the AI system |
| `answers` | Map of question IDs to yes/no answers |
| `expectedTier` | The correct risk tier for this scenario |

These serve as both documentation and test fixtures for the classification engine.

## Timeline (`data/timeline.json`)

Enforcement milestones for the EU AI Act's phased rollout:

| Field | Description |
|-------|-------------|
| `date` | Milestone date (ISO 8601) |
| `title` | Short title of the milestone |
| `description` | What happens at this date |
| `articles` | Relevant article numbers |
| `categories` | Which obligation categories take effect |

## Schema Validation

Every data file has a corresponding JSON Schema in `data/schema/`:

```
data/schema/
├── questions.schema.json
├── checklists.schema.json
├── articles.schema.json
├── examples.schema.json
└── timeline.schema.json
```

Schemas are used to validate data integrity during CI and development. All data files must conform to their schema before being accepted.
