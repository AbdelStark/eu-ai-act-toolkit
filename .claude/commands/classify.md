---
allowed-tools:
  - Bash
  - Read
  - Write
description: Classify an AI system's risk tier under the EU AI Act
---

Run the EU AI Act classification wizard for the user's AI system.

First, ask the user to describe their AI system. Then map their description to the classification inputs:
- Does it involve social scoring, real-time biometrics, subliminal manipulation, or other prohibited practices? (Article 5)
- Is it a general-purpose AI model? What's the training compute? Is it open source? (GPAI)
- Is it a safety component of a regulated product? (Annex I high-risk)
- Does it fall under Annex III categories? (biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, justice/democracy)
- Does it interact with persons, generate synthetic content, or perform emotion recognition? (limited risk)

Then run: npx eu-ai-act classify with the appropriate flags, or use the SDK programmatically.
Explain the result and recommend next steps.
