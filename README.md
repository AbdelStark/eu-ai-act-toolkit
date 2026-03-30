# EU AI Act Compliance Toolkit

Open-source tools for navigating the [EU AI Act](https://artificialintelligenceact.eu/) (Regulation 2024/1689).

The Act is live. Prohibitions took effect February 2025. GPAI rules apply August 2025. Full high-risk enforcement hits August 2026. If you're building or deploying AI in Europe, compliance is not optional.

This toolkit gives you the practical resources to get there: risk classification, conformity checklists, documentation templates, and reference guides. No vendor lock-in, no SaaS fees.

## What's Inside

```
eu-ai-act-toolkit/
├── classifier/          # Interactive risk classification questionnaire
├── checklists/          # Conformity assessment checklists by risk tier
├── templates/           # Required documentation templates
├── reference/           # Act summaries, timelines, Annex III breakdown
└── examples/            # Worked examples for common AI systems
```

## Quick Start

### 1. Classify Your System

Run the interactive risk classifier to determine which tier your AI system falls under:

```bash
python classifier/classify.py
```

Or use the static decision tree in [`classifier/DECISION-TREE.md`](classifier/DECISION-TREE.md).

### 2. Get Your Checklist

Based on your classification:

| Risk Tier | What You Need |
|-----------|--------------|
| [Prohibited](checklists/00-prohibited.md) | Stop. Your system is banned under Article 5. |
| [High-Risk](checklists/01-high-risk.md) | Full conformity assessment (Articles 9-15). |
| [GPAI Provider](checklists/02-gpai.md) | Technical documentation, copyright, training data summary. |
| [GPAI Systemic Risk](checklists/03-gpai-systemic.md) | Everything in GPAI plus evaluations, adversarial testing, incident reporting. |
| [Limited Risk](checklists/04-limited-risk.md) | Transparency obligations only. |
| [Minimal Risk](checklists/05-minimal-risk.md) | No legal obligations. Voluntary codes encouraged. |

### 3. Fill Documentation Templates

Required documentation for high-risk systems (Annex IV):

- [`templates/technical-documentation.md`](templates/technical-documentation.md) - Full system description, design, development, and validation
- [`templates/risk-management-system.md`](templates/risk-management-system.md) - Risk identification, analysis, evaluation, mitigation
- [`templates/data-governance.md`](templates/data-governance.md) - Training data provenance, quality, bias assessment
- [`templates/human-oversight-plan.md`](templates/human-oversight-plan.md) - Oversight mechanisms and override capabilities
- [`templates/monitoring-plan.md`](templates/monitoring-plan.md) - Post-market monitoring and incident reporting

## Enforcement Timeline

| Date | What Applies |
|------|-------------|
| **Feb 2, 2025** | Prohibited practices (Art. 5) + AI literacy requirement |
| **Aug 2, 2025** | GPAI rules + governance structure + penalties framework |
| **Aug 2, 2026** | ALL high-risk requirements (Articles 6-43) |
| **Aug 2, 2027** | Legacy GPAI models + large-scale IT systems |
| **Aug 2, 2028** | Annex I product safety components |

Penalties: up to 35M EUR or 7% of global annual turnover, whichever is higher.

## Who This Is For

- **AI companies deploying in the EU** - Know exactly what's required before enforcement hits
- **Compliance and legal teams** - Practical checklists instead of reading 400 pages of regulation
- **Startups and open-source projects** - Free tooling to meet the same bar as large companies
- **Policymakers and auditors** - Standardized assessment frameworks

## Status

This is an early release. Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

- [x] Risk classification decision tree
- [x] High-risk conformity checklist (Articles 9-15)
- [x] GPAI compliance checklist
- [x] Documentation templates
- [x] Reference guides
- [ ] Interactive CLI classifier (Python)
- [ ] Automated documentation gap analysis
- [ ] Integration with existing tools (AIF360, Fairlearn)
- [ ] Harmonised standards mapping (CEN/CENELEC JTC 21)
- [ ] Multi-language support (FR, DE, ES, IT)

## References

- [EU AI Act Full Text](https://artificialintelligenceact.eu/ai-act-explorer/)
- [EU AI Act Corrigendum (Official Journal)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
- [EU AI Office](https://digital-strategy.ec.europa.eu/en/policies/ai-office)
- [ALTAI Assessment List](https://futurium.ec.europa.eu/en/european-ai-alliance/pages/altai-assessment-list-trustworthy-artificial-intelligence)
- [NIST AI RMF Crosswalk](https://airc.nist.gov/AI_RMF_Interoperability/iso-42001)
- [ISO/IEC 42001 AI Management System](https://www.iso.org/standard/81230.html)

## License

MIT. Use it, fork it, build on it.
