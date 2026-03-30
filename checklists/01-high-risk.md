# High-Risk AI System Compliance Checklist

Your AI system is classified as high-risk under the EU AI Act. You must meet all requirements in Articles 9-15 before placing it on the EU market.

**Enforcement date: August 2, 2026**

---

## Article 9: Risk Management System

- [ ] Established a risk management system that operates throughout the entire lifecycle
- [ ] Identified and analyzed known and reasonably foreseeable risks
- [ ] Estimated and evaluated risks from intended use AND reasonably foreseeable misuse
- [ ] Evaluated risks based on post-market monitoring data
- [ ] Adopted risk management measures to eliminate or reduce risks
- [ ] Tested the system to identify the most appropriate risk management measures
- [ ] Considered the combined effects when used with other systems
- [ ] Documented residual risks and communicated them to deployers

## Article 10: Data and Data Governance

- [ ] Training, validation, and testing datasets are subject to appropriate data governance
- [ ] Documented data collection processes and data sources
- [ ] Assessed data for relevance, representativeness, completeness, and statistical properties
- [ ] Examined data for possible biases likely to affect health, safety, or fundamental rights
- [ ] Identified and addressed data gaps or shortcomings
- [ ] Applied appropriate measures for bias detection, correction, and mitigation
- [ ] Training data is free from errors and complete relative to the intended purpose
- [ ] If special categories of personal data are processed: documented necessity and safeguards

## Article 11: Technical Documentation

Before placing on the market, prepared documentation including (per Annex IV):

- [ ] General description of the AI system (intended purpose, developer, version)
- [ ] Detailed description of elements and development process
- [ ] Detailed description of monitoring, functioning, and control of the system
- [ ] Description of the risk management system (Article 9 compliance)
- [ ] Description of changes made through the system's lifecycle
- [ ] List of harmonised standards or other technical specifications applied
- [ ] Description of how human oversight measures are implemented
- [ ] Expected lifetime and maintenance/care measures
- [ ] Description of the AI system's accuracy, robustness, and cybersecurity measures

Use template: [`templates/technical-documentation.md`](../templates/technical-documentation.md)

## Article 12: Record-Keeping

- [ ] System automatically records events (logs) throughout its lifetime
- [ ] Logging enables tracing of the system's operation
- [ ] Logging capabilities conform to recognized standards or common specifications
- [ ] Logs include: period of use, reference database, input data, identification of natural persons involved in verification

## Article 13: Transparency and Provision of Information to Deployers

- [ ] Designed to enable deployers to interpret the system's output and use it appropriately
- [ ] Instructions for use include:
  - [ ] Identity and contact details of the provider
  - [ ] System capabilities and limitations
  - [ ] Intended purpose and foreseeable misuse scenarios
  - [ ] Changes pre-determined by the provider
  - [ ] Human oversight measures
  - [ ] Expected level of accuracy, robustness, cybersecurity (benchmarks)
  - [ ] Known risks to health, safety, or fundamental rights
  - [ ] Technical specifications for input data
  - [ ] Description of logging functionality

## Article 14: Human Oversight

- [ ] Designed to allow effective oversight by natural persons during use
- [ ] Oversight measures enable the human to:
  - [ ] Fully understand the system's capacities and limitations
  - [ ] Properly monitor operation and detect anomalies, dysfunctions, unexpected performance
  - [ ] Remain aware of automation bias (especially for systems informing decisions about persons)
  - [ ] Correctly interpret the system's output
  - [ ] Decide not to use the system or override/reverse the output
  - [ ] Interrupt the system through a "stop" button or similar procedure

## Article 15: Accuracy, Robustness, and Cybersecurity

- [ ] Designed to achieve an appropriate level of accuracy for intended purpose
- [ ] Accuracy levels and metrics declared in instructions for use
- [ ] Resilient to errors, faults, or inconsistencies in the system's environment
- [ ] Resilient to adversarial attempts to manipulate the system by third parties
- [ ] Designed to address unexpected situations safely (fallback/fail-safe plans)
- [ ] Cybersecurity measures proportionate to the risk
- [ ] Technical redundancy solutions where appropriate (backup plans, fail-safe mechanisms)

---

## Conformity Assessment

Before placing on the EU market:

- [ ] **Determine assessment route**: Self-assessment (most cases) OR third-party assessment (biometrics, critical infrastructure, some Annex III categories)
- [ ] Register in the EU database (Article 49)
- [ ] Affix CE marking
- [ ] Prepare EU Declaration of Conformity
- [ ] Designate an authorized representative in the EU (if provider is outside EU)

## Post-Market Obligations

- [ ] Post-market monitoring system in place (Article 72)
- [ ] Serious incident reporting procedure established (Article 73)
- [ ] Incidents reported to market surveillance authorities without undue delay (and within 15 days at most)
