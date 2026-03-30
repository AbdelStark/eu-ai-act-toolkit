---
allowed-tools:
  - Bash
  - Read
description: Show compliance checklist for a risk tier
---

Show the EU AI Act compliance checklist.
If a tier argument is provided, use it. Otherwise check .eu-ai-act.json for the classified tier, or ask the user.
Run: npx eu-ai-act checklist $TIER
Summarize the obligations and highlight the most critical items.
