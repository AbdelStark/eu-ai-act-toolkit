---
allowed-tools:
  - Bash
  - Read
  - Write
description: Generate EU AI Act compliance documentation templates
---

Generate compliance documentation for the user's AI system.
Ask for: system name, provider/organization, intended purpose.
Ask which template(s) they need, or generate all for their tier.
Run: npx eu-ai-act generate [template] --system 'X' --provider 'Y' --purpose 'Z' --output [path]
Review the generated documents and help fill in [TODO] sections.
