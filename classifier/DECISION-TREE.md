# EU AI Act Risk Classification - Decision Tree

Use this to determine which risk tier your AI system falls under.

---

## Step 1: Is your system prohibited?

Does your AI system do any of the following?

- [ ] Social scoring by public authorities (behavioral profiling that leads to detrimental treatment)
- [ ] Real-time remote biometric identification in public spaces for law enforcement (with narrow exceptions)
- [ ] Subliminal, manipulative, or deceptive techniques that distort behavior and cause significant harm
- [ ] Exploitation of vulnerabilities of specific groups (age, disability, social/economic situation)
- [ ] Untargeted scraping of facial images from internet or CCTV to build facial recognition databases
- [ ] Emotion inference in workplace or educational settings (except medical/safety reasons)
- [ ] Biometric categorization to infer sensitive attributes (race, political opinions, sexual orientation)
- [ ] Individual predictive policing based solely on profiling

**If YES to any**: Your system is **PROHIBITED** under Article 5. Stop here.

**If NO to all**: Continue to Step 2.

---

## Step 2: Is your system a General-Purpose AI model?

A GPAI model is a model trained with a large amount of data using self-supervision at scale, that displays significant generality and can competently perform a wide range of distinct tasks.

- [ ] My system is a foundation model / large language model / large multimodal model
- [ ] My system is built on top of such a model (fine-tuned, RAG, agent framework)

**If YES**: Go to Step 2a.
**If NO**: Continue to Step 3.

### Step 2a: Does your GPAI model pose systemic risk?

A GPAI model has systemic risk if:
- [ ] It was trained with more than 10^25 FLOPs of compute, OR
- [ ] It has been designated by the EU AI Office as posing systemic risk based on capabilities

**If YES**: Your model falls under **GPAI with Systemic Risk** (Article 51 + 55). See [GPAI Systemic Risk Checklist](../checklists/03-gpai-systemic.md).

**If NO**: Your model falls under **GPAI** (Article 51-53). See [GPAI Checklist](../checklists/02-gpai.md).

Note: Open-source GPAI models have reduced obligations (only copyright compliance + training data summary) UNLESS they pose systemic risk.

---

## Step 3: Is your system high-risk?

There are two pathways to high-risk classification:

### Pathway A: Safety component of a regulated product (Annex I)

Is your AI system a safety component of (or itself) a product covered by EU harmonisation legislation?

- [ ] Machinery, toys, lifts, medical devices, vehicles, aviation, railways, marine equipment, etc.

**If YES and requires third-party conformity assessment**: Your system is **HIGH-RISK**.

### Pathway B: Annex III use cases

Does your AI system fall into any of these categories?

**1. Biometrics** (not prohibited ones)
- [ ] Remote biometric identification (not real-time in public by law enforcement)
- [ ] Biometric categorization by sensitive/protected attributes
- [ ] Emotion recognition

**2. Critical infrastructure**
- [ ] Safety component in management/operation of road traffic, water, gas, heating, electricity

**3. Education and vocational training**
- [ ] Determining access to or admission to educational institutions
- [ ] Evaluating learning outcomes or determining appropriate level of education
- [ ] Monitoring/detecting prohibited behavior during tests

**4. Employment, workers management, access to self-employment**
- [ ] Recruitment/selection (filtering, evaluating, ranking candidates)
- [ ] Decisions on terms, promotion, termination of work relationships
- [ ] Task allocation based on individual behavior or personal traits
- [ ] Monitoring/evaluating performance and behavior of workers

**5. Access to essential private and public services**
- [ ] Evaluating eligibility for public assistance benefits and services
- [ ] Creditworthiness assessment (except fraud detection)
- [ ] Risk assessment and pricing in life/health insurance
- [ ] Evaluating and classifying emergency calls (dispatching)

**6. Law enforcement**
- [ ] Risk assessment of natural persons (re-offending, victimization)
- [ ] Polygraph or similar tools
- [ ] Evaluating reliability of evidence
- [ ] Profiling in detection, investigation, or prosecution of criminal offences

**7. Migration, asylum, border control**
- [ ] Risk assessment for irregular migration or health risks
- [ ] Examining applications for asylum, visa, residence permits
- [ ] Detection, recognition, or identification of persons (except document verification)

**8. Administration of justice and democratic processes**
- [ ] Researching/interpreting facts and law and applying it to concrete cases
- [ ] Influencing the outcome of an election or referendum

**If YES to any Annex III category**: Your system is likely **HIGH-RISK** (subject to Art 6(3) exception for narrow procedural tasks). See [High-Risk Checklist](../checklists/01-high-risk.md).

---

## Step 4: Does your system require transparency?

- [ ] The system interacts directly with natural persons (chatbot, voice assistant)
- [ ] The system generates synthetic content (deepfakes, AI-generated text/images/audio/video)
- [ ] The system performs emotion recognition or biometric categorization
- [ ] The system generates or manipulates content that could appear authentic (fake news)

**If YES**: Your system has **LIMITED RISK** transparency obligations. See [Limited Risk Checklist](../checklists/04-limited-risk.md).

---

## Step 5: None of the above

Your system falls under **MINIMAL RISK**. No legal obligations, but voluntary codes of conduct are encouraged. See [Minimal Risk Checklist](../checklists/05-minimal-risk.md).
