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
