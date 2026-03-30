# Example: AI-Powered Hiring Screening Tool

## System Description
An AI system that screens job applications, ranks candidates based on CV analysis, and recommends shortlists to hiring managers. Used by a company with EU operations.

## Risk Classification

**Step 1 - Prohibited?** No.

**Step 2 - GPAI?** Depends on implementation. If uses an LLM backbone, GPAI obligations apply to the model provider.

**Step 3 - High-risk?** Yes. Falls under Annex III, Category 4: "Employment, workers management, access to self-employment" - specifically "recruitment or selection of natural persons, in particular to place targeted job advertisements, to filter or evaluate applications, to evaluate candidates."

**Classification: HIGH-RISK**

## Required Actions

Full compliance with Articles 9-15:

1. **Risk Management (Art. 9)**: Identify risks of bias, discrimination, unfair exclusion. Test for demographic disparities in recommendations.

2. **Data Governance (Art. 10)**: Audit training data for gender, age, ethnic, disability bias. Document data sources and representativeness. Assess whether historical hiring patterns encode discrimination.

3. **Technical Documentation (Art. 11)**: Full Annex IV documentation before deployment.

4. **Record-Keeping (Art. 12)**: Log every screening decision, inputs used, scores assigned, candidates filtered.

5. **Transparency (Art. 13)**: Inform candidates that AI is involved in the screening process. Provide deployers (hiring managers) with documentation on system capabilities and limitations.

6. **Human Oversight (Art. 14)**: A human must make the final hiring decision. Humans can override the AI's recommendation. Hiring managers trained on automation bias.

7. **Accuracy & Robustness (Art. 15)**: Validated accuracy metrics. Tested against adversarial inputs (resume stuffing, keyword gaming).

## Conformity Assessment

Self-assessment is sufficient for employment AI systems (no third-party assessment required unless also involves biometrics).

Register in EU database before deployment.
