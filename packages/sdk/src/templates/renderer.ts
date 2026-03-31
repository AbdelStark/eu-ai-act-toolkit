import type { TemplateName, TemplateInput } from '../data/types.js';
import { validateTemplateInput } from './schemas.js';

/**
 * Template content generators by template type.
 * Each returns a Markdown string with interpolated fields.
 */
const TEMPLATES: Record<TemplateName, (input: TemplateInput) => string> = {
  'technical-documentation': (input) => `# Technical Documentation

**AI System**: ${input.systemName}
**Provider**: ${input.provider}
**Version**: ${input.version ?? '[TODO: version]'}
**Date**: ${input.date ?? new Date().toISOString().split('T')[0]}

## 1. General Description

**Intended Purpose**: ${input.intendedPurpose}

**Developer/Provider**: ${input.provider}

### 1.1 System Overview
[TODO: Provide a general description of the AI system including its intended purpose and interaction context]

### 1.2 Version History
[TODO: Document version history and changes through the system's lifecycle]

## 2. Development Process

### 2.1 Design Specifications
[TODO: Describe the design specifications of the system, algorithms used, and key design choices]

### 2.2 Data Requirements
[TODO: Describe training, validation, and testing data sets used]

### 2.3 Computational Resources
[TODO: Document computational resources used for development, training, and testing]

## 3. Monitoring and Functioning

### 3.1 System Capabilities
[TODO: Describe the capabilities and limitations of the system]

### 3.2 Foreseeable Misuse
[TODO: Document reasonably foreseeable misuse scenarios and measures to prevent them]

### 3.3 Performance Metrics
[TODO: Describe accuracy, robustness, and cybersecurity measures with quantified benchmarks]

## 4. Risk Management

[TODO: Reference your risk management system documentation (Article 9)]

## 5. Human Oversight

[TODO: Describe human oversight measures implemented (Article 14)]

## 6. Logging and Traceability

[TODO: Describe automatic logging capabilities (Article 12)]

---
*This document is prepared in accordance with Annex IV of Regulation (EU) 2024/1689.*
*This toolkit does not constitute legal advice.*
`,

  'risk-management-system': (input) => `# Risk Management System

**AI System**: ${input.systemName}
**Provider**: ${input.provider}
**Date**: ${input.date ?? new Date().toISOString().split('T')[0]}

## 1. Risk Identification

[TODO: Identify known and reasonably foreseeable risks to health, safety, or fundamental rights]

## 2. Risk Estimation and Evaluation

[TODO: Estimate and evaluate risks from intended use and reasonably foreseeable misuse]

## 3. Risk Management Measures

[TODO: Describe measures adopted to eliminate or reduce identified risks]

## 4. Testing

[TODO: Describe testing procedures to identify the most appropriate risk management measures]

## 5. Residual Risks

[TODO: Document residual risks and communicate them to deployers]

## 6. Review and Update

[TODO: Describe the process for regular systematic review and updating]

---
*Prepared in accordance with Article 9 of Regulation (EU) 2024/1689.*
*This toolkit does not constitute legal advice.*
`,

  'data-governance': (input) => `# Data Governance Plan

**AI System**: ${input.systemName}
**Provider**: ${input.provider}
**Date**: ${input.date ?? new Date().toISOString().split('T')[0]}

## 1. Data Collection

[TODO: Document data collection processes and data sources]

## 2. Data Quality Assessment

[TODO: Assess data for relevance, representativeness, and completeness]

## 3. Bias Assessment

[TODO: Examine data for possible biases affecting health, safety, or fundamental rights]

## 4. Gap Analysis

[TODO: Identify and address data gaps or shortcomings]

## 5. Bias Mitigation

[TODO: Document measures for bias detection, correction, and mitigation]

## 6. Personal Data Processing

[TODO: If special categories processed, document necessity and safeguards]

---
*Prepared in accordance with Article 10 of Regulation (EU) 2024/1689.*
*This toolkit does not constitute legal advice.*
`,

  'human-oversight-plan': (input) => `# Human Oversight Plan

**AI System**: ${input.systemName}
**Provider**: ${input.provider}
**Date**: ${input.date ?? new Date().toISOString().split('T')[0]}

## 1. Oversight Capability

[TODO: Describe how the system enables effective human oversight]

## 2. Understanding and Monitoring

[TODO: How can overseers understand the system's capacities and limitations?]

## 3. Anomaly Detection

[TODO: How can overseers detect anomalies, dysfunctions, or unexpected performance?]

## 4. Automation Bias Awareness

[TODO: Measures to help overseers remain aware of automation bias]

## 5. Output Interpretation

[TODO: How can overseers correctly interpret the system's output?]

## 6. Override and Interrupt

[TODO: Describe override mechanisms, stop buttons, and intervention procedures]

---
*Prepared in accordance with Article 14 of Regulation (EU) 2024/1689.*
*This toolkit does not constitute legal advice.*
`,

  'monitoring-plan': (input) => `# Post-Market Monitoring Plan

**AI System**: ${input.systemName}
**Provider**: ${input.provider}
**Date**: ${input.date ?? new Date().toISOString().split('T')[0]}

## 1. Monitoring System

[TODO: Describe the post-market monitoring system established]

## 2. Data Collection

[TODO: What data is collected from deployers and users for monitoring?]

## 3. Incident Identification

[TODO: How are incidents and malfunctions identified and classified?]

## 4. Incident Reporting

[TODO: Describe the serious incident reporting procedure (within 15 days)]

## 5. Corrective Actions

[TODO: Process for implementing corrective actions based on monitoring data]

## 6. Communication

[TODO: How are monitoring findings communicated to relevant stakeholders?]

---
*Prepared in accordance with Articles 72-73 of Regulation (EU) 2024/1689.*
*This toolkit does not constitute legal advice.*
`,

  'gpai-model-card': (input) => `# GPAI Model Card

**Model Name**: ${input.systemName}
**Provider**: ${input.provider}
**Version**: ${input.version ?? '[TODO: version]'}
**Date**: ${input.date ?? new Date().toISOString().split('T')[0]}

## 1. General Information

**Model Type**: ${input.intendedPurpose}
**Provider**: ${input.provider}

### 1.1 Model Description
[TODO: Provide a general description of the GPAI model including its architecture, capabilities, and design objectives]

### 1.2 Intended Use
[TODO: Describe the intended tasks and downstream applications the model is designed to support]

### 1.3 Limitations and Risks
[TODO: Document known limitations, potential risks, and out-of-scope use cases]

## 2. Training Information

### 2.1 Training Data
[TODO: Provide a sufficiently detailed summary of the content used for training, as required by Article 53(1)(d)]

### 2.2 Training Methodology
[TODO: Describe the training process, algorithms, and key design choices]

### 2.3 Computational Resources
[TODO: Document computational resources used — hardware, total FLOPs, training duration]

### 2.4 Data Governance
[TODO: Describe data curation, filtering, and quality assurance processes]

## 3. Evaluation

### 3.1 Performance Benchmarks
[TODO: Report evaluation results on standard benchmarks relevant to the model's capabilities]

### 3.2 Safety Evaluations
[TODO: Document safety evaluations including red-teaming and adversarial testing results]

### 3.3 Bias and Fairness Assessment
[TODO: Report on bias evaluations across protected characteristics and demographic groups]

## 4. Copyright Compliance

### 4.1 Copyright Policy
[TODO: Describe your policy to comply with Union copyright law, including Directive 2019/790]

### 4.2 Text and Data Mining Opt-Out
[TODO: Describe measures to identify and comply with opt-out reservations expressed by rights holders under Article 4(3) of Directive 2019/790]

## 5. Downstream Provider Information

### 5.1 Integration Guidelines
[TODO: Provide information and documentation to downstream providers for integrating this model into AI systems, as required by Article 53(1)(b)]

### 5.2 Known Interaction Effects
[TODO: Document known interaction effects when the model is integrated into downstream systems]

### 5.3 Acceptable Use Policy
[TODO: Define acceptable and prohibited uses of the model by downstream providers]

## 6. Technical Documentation Reference

[TODO: Reference the full technical documentation prepared in accordance with Annex XI of Regulation (EU) 2024/1689]

---
*This model card is prepared in accordance with Articles 51-53 of Regulation (EU) 2024/1689.*
*This toolkit does not constitute legal advice.*
`,

  'fundamental-rights-impact': (input) => `# Fundamental Rights Impact Assessment

**AI System**: ${input.systemName}
**Provider/Deployer**: ${input.provider}
**Date**: ${input.date ?? new Date().toISOString().split('T')[0]}

## 1. System Description

**System Name**: ${input.systemName}
**Intended Purpose**: ${input.intendedPurpose}
**Version**: ${input.version ?? '[TODO: version]'}

### 1.1 Deployment Context
[TODO: Describe the specific context in which the high-risk AI system will be used]

### 1.2 Affected Persons
[TODO: Identify categories of natural persons and groups likely to be affected by the system's use]

### 1.3 Geographic and Temporal Scope
[TODO: Define the geographic scope and intended period of use]

## 2. Fundamental Rights Assessment

### 2.1 Right to Non-Discrimination (Article 21 EU Charter)
[TODO: Assess the system's potential impact on the right to non-discrimination, particularly regarding protected characteristics (race, gender, age, disability, religion, sexual orientation)]

### 2.2 Right to Privacy and Data Protection (Articles 7-8 EU Charter)
[TODO: Assess the impact on the right to privacy and protection of personal data, including any special categories of data processed]

### 2.3 Right to an Effective Remedy (Article 47 EU Charter)
[TODO: Assess whether affected persons can effectively contest decisions made with the assistance of this AI system]

### 2.4 Rights of the Child (Article 24 EU Charter)
[TODO: If applicable, assess the impact on children's rights and best interests]

### 2.5 Right to Good Administration (Article 41 EU Charter)
[TODO: If the system is used by public bodies, assess the impact on the right to good administration]

### 2.6 Other Relevant Fundamental Rights
[TODO: Identify and assess any other fundamental rights that may be affected (e.g., freedom of expression, right to work, right to education)]

## 3. Risk Analysis

### 3.1 Identified Risks to Fundamental Rights
[TODO: List specific risks to fundamental rights identified through the assessment]

### 3.2 Risk Severity and Likelihood
[TODO: For each risk, assess the severity of potential harm and the likelihood of occurrence]

### 3.3 Vulnerable Groups
[TODO: Identify specific groups that may be disproportionately affected and assess additional risks]

## 4. Mitigation Measures

### 4.1 Governance Measures
[TODO: Describe organizational and governance measures to mitigate identified risks]

### 4.2 Technical Measures
[TODO: Describe technical measures implemented to prevent or reduce adverse impacts on fundamental rights]

### 4.3 Human Oversight Measures
[TODO: Describe how human oversight (Article 14) will protect fundamental rights in practice]

### 4.4 Redress Mechanisms
[TODO: Describe mechanisms available to affected persons to seek redress or contest decisions]

## 5. Monitoring and Review

### 5.1 Ongoing Monitoring
[TODO: Describe how fundamental rights impacts will be monitored during deployment]

### 5.2 Review Schedule
[TODO: Define the schedule for periodic review and update of this assessment]

### 5.3 Incident Reporting
[TODO: Describe the process for reporting and addressing fundamental rights incidents]

## 6. Stakeholder Consultation

[TODO: Document any consultations with affected communities, civil society organizations, or equality bodies]

## 7. Conclusion and Recommendation

[TODO: Summarize findings and provide a recommendation on whether the deployment should proceed, proceed with conditions, or not proceed]

---
*This assessment is prepared in accordance with Article 27 of Regulation (EU) 2024/1689.*
*This toolkit does not constitute legal advice.*
`,

  'declaration-of-conformity': (input) => `# EU Declaration of Conformity

**AI System**: ${input.systemName}
**Provider**: ${input.provider}
**Date**: ${input.date ?? new Date().toISOString().split('T')[0]}

## Declaration

We, ${input.provider}, declare under our sole responsibility that the AI system described above is in conformity with the requirements set out in Regulation (EU) 2024/1689 of the European Parliament and of the Council.

## System Identification

- **System Name**: ${input.systemName}
- **Version**: ${input.version ?? '[TODO: version]'}
- **Intended Purpose**: ${input.intendedPurpose}

## Applicable Requirements

[TODO: List the Articles and requirements with which conformity is declared]

## Conformity Assessment

[TODO: Specify whether self-assessment or third-party assessment was used]

## Standards Applied

[TODO: List harmonised standards or common specifications applied]

## Notified Body (if applicable)

[TODO: Name and identification number of the notified body, if third-party assessment]

## Signed

[TODO: Name, function, signature of authorised representative]
[TODO: Place and date of issue]

---
*Prepared in accordance with Article 47 of Regulation (EU) 2024/1689.*
*This toolkit does not constitute legal advice.*
`,
};

/**
 * Generate a compliance documentation template.
 *
 * Produces a Markdown string with system details interpolated and
 * [TODO] placeholders for fields the user needs to fill in.
 *
 * @param name - Template type to generate
 * @param input - System details to interpolate
 * @returns Markdown string ready for the user to complete
 * @throws {TypeError} If required input fields are missing
 * @throws {RangeError} If template name is invalid
 *
 * @example
 * ```typescript
 * const doc = generateTemplate('technical-documentation', {
 *   systemName: 'Hiring Screener',
 *   provider: 'Acme Corp',
 *   intendedPurpose: 'Automated resume screening',
 * });
 * ```
 */
export function generateTemplate(name: TemplateName, input: TemplateInput): string {
  validateTemplateInput(name, input);
  const generator = TEMPLATES[name];
  return generator(input);
}
