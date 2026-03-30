# Technical Documentation Template (Annex IV)

*Required for all high-risk AI systems before market placement.*

---

## 1. General Description

**System name:**
**Version:**
**Provider name and contact:**
**Intended purpose:**
**Date of first market placement or putting into service:**

### 1.1 Intended purpose and foreseeable misuse
Describe the specific purpose this system is designed for and any reasonably foreseeable misuse scenarios.

### 1.2 Persons/groups affected
Who are the natural persons or groups on whom the system is intended to be used? Who might be affected by its outputs?

### 1.3 Interaction with other systems
Does the system interact with hardware or other software? If yes, describe interfaces and dependencies.

---

## 2. System Design and Development

### 2.1 Architecture and design choices
Describe the overall architecture, key design decisions, and rationale.

### 2.2 Algorithms and computational approach
What type of AI approach is used (ML, rule-based, hybrid)? Describe the model architecture, key hyperparameters, and training methodology.

### 2.3 Key design choices and trade-offs
What trade-offs were made between accuracy, speed, fairness, interpretability, robustness?

### 2.4 Third-party components
List any pre-trained models, datasets, open-source libraries, or third-party components used.

---

## 3. Data and Data Governance

### 3.1 Training data
- **Sources:**
- **Collection methodology:**
- **Volume (approximate):**
- **Date range:**
- **Geographic and demographic coverage:**
- **Known gaps or limitations:**

### 3.2 Validation and testing data
- **Sources:**
- **Methodology for train/validation/test split:**
- **Representativeness assessment:**

### 3.3 Bias assessment
Describe the measures taken to detect and mitigate bias in the data. What protected characteristics were examined?

### 3.4 Personal data
If personal data is processed: legal basis, data minimization measures, GDPR compliance documentation.

---

## 4. Risk Management

### 4.1 Known risks
List identified risks to health, safety, and fundamental rights.

| Risk | Likelihood | Severity | Mitigation Measure |
|------|-----------|----------|-------------------|
| | | | |

### 4.2 Residual risks
Risks that could not be eliminated. How are they communicated to deployers?

### 4.3 Testing methodology
How were risks assessed? What testing protocols were used?

---

## 5. Human Oversight

### 5.1 Oversight measures built into the system
Describe how humans can monitor, interpret, and override the system.

### 5.2 Recommended operating procedures for deployers
What should the deployer do to maintain effective oversight?

### 5.3 Override/stop capabilities
How can a human interrupt or reverse the system's operation?

---

## 6. Accuracy, Robustness, and Cybersecurity

### 6.1 Accuracy metrics
| Metric | Value | Test Dataset | Conditions |
|--------|-------|-------------|------------|
| | | | |

### 6.2 Robustness testing
Describe testing against errors, faults, and inconsistencies. Include adversarial testing results.

### 6.3 Cybersecurity measures
What measures protect against unauthorized access, data poisoning, model extraction, or adversarial inputs?

### 6.4 Fail-safe mechanisms
What happens when the system encounters inputs outside its training distribution?

---

## 7. Lifecycle and Maintenance

### 7.1 Expected lifetime
How long is this version expected to be in use?

### 7.2 Update and maintenance procedures
How will the system be updated? What triggers a re-assessment?

### 7.3 Version history
| Version | Date | Changes | Re-assessment Required? |
|---------|------|---------|------------------------|
| | | | |

---

## 8. Standards and Conformity

### 8.1 Applied standards
List harmonised standards, common specifications, or other technical standards used.

### 8.2 Conformity assessment
Route used (self-assessment or third-party). Body name if applicable.

### 8.3 EU Declaration of Conformity
Reference to the signed declaration.
