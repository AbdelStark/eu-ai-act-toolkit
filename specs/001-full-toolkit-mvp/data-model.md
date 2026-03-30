# Data Model: Full Toolkit MVP

**Phase**: 1 — Design & Contracts
**Date**: 2026-03-30

## Entities

### RiskTier (enum)

Represents the six possible risk classifications under the EU AI Act.

```
Values: prohibited | high-risk | gpai | gpai-systemic | limited | minimal
```

### AnnexIIICategory (enum)

The eight high-risk use case areas listed in Annex III.

```
Values: biometrics | critical-infrastructure | education | employment
      | essential-services | law-enforcement | migration
      | justice-democracy
```

### ClassificationInput

User-provided attributes describing an AI system. Used as input to
the classification engine.

| Field                     | Type                      | Required | Description |
|---------------------------|---------------------------|----------|-------------|
| socialScoring             | boolean                   | yes      | Art 5(1)(c) — social scoring by public authorities |
| realtimeBiometrics        | boolean                   | yes      | Art 5(1)(h) — real-time remote biometric ID in public spaces |
| subliminalManipulation    | boolean                   | yes      | Art 5(1)(a) — subliminal/manipulative techniques |
| exploitsVulnerabilities   | boolean                   | yes      | Art 5(1)(b) — exploits age/disability vulnerabilities |
| untargetedFacialScraping  | boolean                   | yes      | Art 5(1)(e) — untargeted facial image scraping |
| emotionInferenceWorkplace | boolean                   | yes      | Art 5(1)(f) — emotion inference in workplace/education |
| biometricCategorization   | boolean                   | yes      | Art 5(1)(g) — biometric categorization for sensitive attributes |
| predictivePolicing        | boolean                   | yes      | Art 5(1)(d) — individual predictive policing |
| isGPAI                    | boolean                   | yes      | Is this a general-purpose AI model? |
| gpaiFlops                 | number \| undefined       | no       | Training compute in FLOPs |
| isOpenSource              | boolean \| undefined      | no       | Is the GPAI model open source? |
| designatedSystemicRisk    | boolean \| undefined      | no       | Designated by AI Office as systemic |
| annexIProduct             | boolean                   | yes      | Safety component under Annex I |
| annexIRequiresThirdParty  | boolean \| undefined      | no       | Annex I product requires third-party assessment |
| annexIIICategory          | AnnexIIICategory \| null  | yes      | Annex III high-risk category, or null |
| interactsWithPersons      | boolean                   | yes      | Interacts directly with natural persons |
| generatesSyntheticContent | boolean                   | yes      | Generates deepfakes/synthetic content |
| emotionRecognition        | boolean                   | yes      | Performs emotion recognition |
| biometricCategorizing     | boolean                   | yes      | Non-prohibited biometric categorization |

### ClassificationResult

Output of the classification engine. Deterministic for a given input.

| Field                | Type            | Description |
|----------------------|-----------------|-------------|
| tier                 | RiskTier        | Primary risk classification |
| subTier              | string \| null  | Refinement (e.g., 'gpai-open-source', 'high-risk-annex-iii-employment') |
| articles             | number[]        | Applicable article numbers |
| obligations          | Obligation[]    | List of specific obligations |
| openSourceExemption  | boolean         | Whether GPAI open-source reduced obligations apply |
| conformityAssessment | 'self' \| 'third-party' \| 'none' | Required assessment type |
| enforcementDate      | string          | ISO 8601 date when obligations become enforceable |
| reasoning            | string[]        | Step-by-step explanation of classification logic |

### Obligation

A single regulatory obligation derived from classification.

| Field       | Type     | Description |
|-------------|----------|-------------|
| article     | number   | Article number in Regulation 2024/1689 |
| title       | string   | Short title |
| description | string   | What the obligation requires |
| category    | string   | One of: risk-management, data-governance, documentation, record-keeping, transparency, human-oversight, accuracy-robustness, monitoring, incident-reporting, copyright, training-data-summary |

### ChecklistItem

A single compliance obligation to be tracked.

| Field       | Type              | Description |
|-------------|-------------------|-------------|
| id          | string            | Unique ID (e.g., 'art9-risk-identification') |
| article     | number            | Source article number |
| paragraph   | number \| null    | Source paragraph within article |
| text        | string            | Short obligation text |
| description | string            | Detailed explanation |
| required    | boolean           | Whether this item is mandatory for the tier |
| category    | string            | Obligation category (same enum as Obligation.category) |

### Checklist

A tier's complete checklist with tracking state.

| Field          | Type            | Description |
|----------------|-----------------|-------------|
| tier           | RiskTier        | Which risk tier this checklist covers |
| items          | ChecklistItem[] | All items for this tier |
| completionRate | number          | 0-1, computed from checked items |

### ChecklistProgress (state file)

User's tracking state for a single checklist item. Persisted in
`.eu-ai-act.json` (CLI) or localStorage (web).

| Field     | Type              | Description |
|-----------|-------------------|-------------|
| checked   | boolean           | Whether the user has marked this complete |
| evidence  | string \| null    | User-provided compliance evidence note |
| checkedAt | string \| null    | ISO 8601 date when checked |

### TimelineEvent

An enforcement milestone in the EU AI Act rollout.

| Field       | Type        | Description |
|-------------|-------------|-------------|
| date        | string      | ISO 8601 date |
| title       | string      | Event title |
| description | string      | What becomes enforceable |
| articles    | number[]    | Applicable articles |
| categories  | RiskTier[]  | Which risk tiers are affected |
| status      | 'past' \| 'upcoming' \| 'future' | Computed relative to today |
| daysUntil   | number      | Days until event (negative if past) |

Note: `status` and `daysUntil` are computed at runtime by the SDK,
not stored in `data/timeline.json`.

### TemplateName (enum)

```
Values: technical-documentation | risk-management-system
      | data-governance | human-oversight-plan | monitoring-plan
      | declaration-of-conformity
```

### TemplateInput

Input for documentation template generation.

| Field           | Type   | Required | Description |
|-----------------|--------|----------|-------------|
| systemName      | string | yes      | Name of the AI system |
| provider        | string | yes      | Organization providing the system |
| intendedPurpose | string | yes      | Description of intended use |
| version         | string | no       | System version |
| date            | string | no       | Document date (defaults to today) |

Additional fields vary by template type and are validated by
per-template schemas in `sdk/src/templates/schemas.ts`.

### StateFile

The `.eu-ai-act.json` persistence schema, shared between CLI and
web app (via export/import).

| Field          | Type                                | Description |
|----------------|-------------------------------------|-------------|
| version        | string                              | Schema version (semver) |
| system         | { name, provider, classifiedAt }    | AI system metadata |
| classification | ClassificationResult (subset)       | Stored tier, subTier, conformityAssessment |
| checklist      | Record<string, ChecklistProgress>   | Item ID → progress |

### WorkedExample

A pre-configured AI system scenario with classification walkthrough.

| Field               | Type                | Description |
|---------------------|---------------------|-------------|
| slug                | string              | URL-safe identifier (e.g., 'chatbot') |
| title               | string              | Display name |
| description         | string              | Brief scenario description |
| classificationInput | ClassificationInput | Pre-filled inputs for the classifier |
| expectedTier        | RiskTier            | Expected classification result |
| walkthrough         | string[]            | Step-by-step reasoning narrative |

## Relationships

```
ClassificationInput --[classify()]--> ClassificationResult
ClassificationResult.tier --[getChecklist()]--> Checklist
Checklist.items[].id --[state file]--> ChecklistProgress
TimelineEvent.categories --references--> RiskTier
WorkedExample.classificationInput --feeds--> classify()
TemplateInput --[generateTemplate()]--> Markdown string
```

## State Transitions

### Checklist Item Lifecycle

```
unchecked → checked (user marks complete, optionally adds evidence)
checked → unchecked (user reverts)
```

No intermediate states. Binary completion tracking.

### Classification Flow

```
no classification → classified (user runs wizard or CLI classify)
classified → re-classified (user runs again, overwrites previous)
```

State file stores only the latest classification. No history.
