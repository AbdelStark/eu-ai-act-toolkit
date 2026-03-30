import type {
  ClassificationInput,
  ClassificationResult,
  ConformityAssessment,
  Obligation,
  RiskTier,
} from '../data/types.js';
// reasoning utilities are re-exported from index.ts for consumers

/**
 * Enforcement dates by risk tier (ISO 8601).
 * Source: Regulation (EU) 2024/1689, Article 113.
 */
const ENFORCEMENT_DATES: Record<RiskTier, string> = {
  prohibited: '2025-02-02',
  'high-risk': '2026-08-02',
  gpai: '2025-08-02',
  'gpai-systemic': '2025-08-02',
  limited: '2026-08-02',
  minimal: '2026-08-02',
};

/** Prohibited practice field names mapped to Article 5 points. */
const PROHIBITED_FIELDS = [
  { field: 'subliminalManipulation' as const, point: 'a', label: 'subliminal/manipulative techniques' },
  { field: 'exploitsVulnerabilities' as const, point: 'b', label: 'exploitation of vulnerabilities' },
  { field: 'socialScoring' as const, point: 'c', label: 'social scoring' },
  { field: 'predictivePolicing' as const, point: 'd', label: 'individual predictive policing' },
  { field: 'untargetedFacialScraping' as const, point: 'e', label: 'untargeted facial image scraping' },
  { field: 'emotionInferenceWorkplace' as const, point: 'f', label: 'emotion inference in workplace/education' },
  { field: 'biometricCategorization' as const, point: 'g', label: 'biometric categorization for sensitive attributes' },
  { field: 'realtimeBiometrics' as const, point: 'h', label: 'real-time remote biometric identification' },
] as const;

/** FLOP threshold for GPAI systemic risk (10^25). */
const SYSTEMIC_RISK_FLOPS = 1e25;

/**
 * Classify an AI system's risk tier under the EU AI Act.
 *
 * Pure, synchronous, deterministic function. The same input always
 * produces the same output. No side effects, no I/O.
 *
 * Classification follows strict precedence:
 * 1. Prohibited practices (Article 5)
 * 2. GPAI assessment (Articles 51-55)
 * 3. High-risk Pathway A — Annex I safety component
 * 4. High-risk Pathway B — Annex III categories
 * 5. Limited risk — transparency triggers
 * 6. Minimal risk (default)
 *
 * @param input - Structured description of the AI system
 * @returns Classification result with tier, articles, reasoning
 * @throws {TypeError} If required input fields are missing or invalid
 *
 * @example
 * ```typescript
 * const result = classify({
 *   socialScoring: false,
 *   realtimeBiometrics: false,
 *   subliminalManipulation: false,
 *   exploitsVulnerabilities: false,
 *   untargetedFacialScraping: false,
 *   emotionInferenceWorkplace: false,
 *   biometricCategorization: false,
 *   predictivePolicing: false,
 *   isGPAI: false,
 *   annexIProduct: false,
 *   annexIIICategory: 'employment',
 *   interactsWithPersons: true,
 *   generatesSyntheticContent: false,
 *   emotionRecognition: false,
 *   biometricCategorizing: false,
 * });
 * // result.tier === 'high-risk'
 * ```
 */
export function classify(input: ClassificationInput): ClassificationResult {
  validateInput(input);

  const reasoning: string[] = [];

  // Step 1: Check prohibited practices (Article 5)
  const prohibitedResult = checkProhibited(input, reasoning);
  if (prohibitedResult) return prohibitedResult;

  // Step 2: Check GPAI (Articles 51-55)
  const gpaiResult = checkGPAI(input, reasoning);
  if (gpaiResult) return gpaiResult;

  // Step 3: Check high-risk Pathway A (Annex I)
  const highRiskAResult = checkHighRiskPathwayA(input, reasoning);

  // Step 4: Check high-risk Pathway B (Annex III)
  const highRiskBResult = checkHighRiskPathwayB(input, reasoning);

  // Handle dual Annex I + III
  if (highRiskAResult && highRiskBResult) {
    return mergeHighRiskResults(highRiskAResult, highRiskBResult, reasoning);
  }
  if (highRiskAResult) return highRiskAResult;
  if (highRiskBResult) return highRiskBResult;

  // Step 5: Check limited risk (transparency obligations)
  const limitedResult = checkLimitedRisk(input, reasoning);
  if (limitedResult) return limitedResult;

  // Step 6: Default — minimal risk
  reasoning.push('No specific obligations apply — classified as MINIMAL RISK');
  return {
    tier: 'minimal',
    subTier: null,
    articles: [],
    obligations: [],
    openSourceExemption: false,
    conformityAssessment: 'none',
    enforcementDate: ENFORCEMENT_DATES.minimal,
    reasoning,
  };
}

function validateInput(input: ClassificationInput): void {
  if (!input || typeof input !== 'object') {
    throw new TypeError('ClassificationInput must be a non-null object');
  }

  const requiredBooleans: (keyof ClassificationInput)[] = [
    'socialScoring', 'realtimeBiometrics', 'subliminalManipulation',
    'exploitsVulnerabilities', 'untargetedFacialScraping',
    'emotionInferenceWorkplace', 'biometricCategorization',
    'predictivePolicing', 'isGPAI', 'annexIProduct',
    'interactsWithPersons', 'generatesSyntheticContent',
    'emotionRecognition', 'biometricCategorizing',
  ];

  for (const field of requiredBooleans) {
    if (typeof input[field] !== 'boolean') {
      throw new TypeError(`ClassificationInput.${field} must be a boolean, got ${typeof input[field]}`);
    }
  }

  if (!('annexIIICategory' in input)) {
    throw new TypeError('ClassificationInput.annexIIICategory is required (use null if not applicable)');
  }
}

function checkProhibited(
  input: ClassificationInput,
  reasoning: string[],
): ClassificationResult | null {
  const triggered = PROHIBITED_FIELDS.filter(({ field }) => input[field]);

  if (triggered.length === 0) {
    reasoning.push('✗ Not prohibited (Article 5) — no prohibited practices detected');
    return null;
  }

  const first = triggered[0]!;
  reasoning.push(
    `✓ PROHIBITED under Article 5(1)(${first.point}): ${first.label}`,
  );
  if (triggered.length > 1) {
    reasoning.push(
      `  Additional prohibited practices: ${triggered.slice(1).map(t => `Article 5(1)(${t.point})`).join(', ')}`,
    );
  }

  return {
    tier: 'prohibited',
    subTier: `prohibited-art5-${first.point}`,
    articles: [5],
    obligations: [{
      article: 5,
      title: 'Prohibited AI Practice',
      description: 'This AI system is prohibited under the EU AI Act. It must not be placed on the market, put into service, or used in the Union.',
      category: 'transparency',
    }],
    openSourceExemption: false,
    conformityAssessment: 'none',
    enforcementDate: ENFORCEMENT_DATES.prohibited,
    reasoning,
  };
}

function checkGPAI(
  input: ClassificationInput,
  reasoning: string[],
): ClassificationResult | null {
  if (!input.isGPAI) {
    reasoning.push('✗ Not a general-purpose AI model');
    return null;
  }

  const isSystemic =
    input.designatedSystemicRisk === true ||
    (input.gpaiFlops != null && input.gpaiFlops >= SYSTEMIC_RISK_FLOPS);

  const isOpenSource = input.isOpenSource === true;

  if (isSystemic) {
    reasoning.push('✓ General-purpose AI model detected');
    if (input.gpaiFlops != null && input.gpaiFlops >= SYSTEMIC_RISK_FLOPS) {
      reasoning.push(`✓ Training compute (${input.gpaiFlops.toExponential()} FLOPs) exceeds systemic risk threshold (10^25)`);
    }
    if (input.designatedSystemicRisk) {
      reasoning.push('✓ Designated as posing systemic risk by the AI Office');
    }
    reasoning.push('→ Classified as GPAI WITH SYSTEMIC RISK');

    return {
      tier: 'gpai-systemic',
      subTier: isOpenSource ? 'gpai-systemic-open-source' : null,
      articles: [51, 52, 53, 54, 55],
      obligations: getGPAIObligations(true),
      openSourceExemption: false, // No exemption for systemic risk
      conformityAssessment: 'none',
      enforcementDate: ENFORCEMENT_DATES['gpai-systemic'],
      reasoning,
    };
  }

  // Standard GPAI
  reasoning.push('✓ General-purpose AI model detected');

  if (isOpenSource) {
    reasoning.push('✓ Open-source model — reduced obligations apply (copyright compliance + training data summary only)');
  }

  reasoning.push('→ Classified as GPAI (standard)');

  return {
    tier: 'gpai',
    subTier: isOpenSource ? 'gpai-open-source' : null,
    articles: isOpenSource ? [51, 53] : [51, 52, 53],
    obligations: getGPAIObligations(false, isOpenSource),
    openSourceExemption: isOpenSource,
    conformityAssessment: 'none',
    enforcementDate: ENFORCEMENT_DATES.gpai,
    reasoning,
  };
}

function checkHighRiskPathwayA(
  input: ClassificationInput,
  reasoning: string[],
): ClassificationResult | null {
  if (!input.annexIProduct) {
    reasoning.push('✗ Not a safety component of an Annex I regulated product');
    return null;
  }

  const thirdParty = input.annexIRequiresThirdParty === true;
  const conformity: ConformityAssessment = thirdParty ? 'third-party' : 'self';

  reasoning.push('✓ Safety component of a product under Annex I EU harmonisation legislation');
  reasoning.push(`  Conformity assessment: ${thirdParty ? 'third-party (notified body)' : 'self-assessment'}`);
  reasoning.push('→ Classified as HIGH-RISK (Pathway A — Annex I)');

  return {
    tier: 'high-risk',
    subTier: thirdParty ? 'high-risk-annex-i-third-party' : 'high-risk-annex-i',
    articles: [6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 26, 27, 43, 49],
    obligations: getHighRiskObligations(),
    openSourceExemption: false,
    conformityAssessment: conformity,
    enforcementDate: ENFORCEMENT_DATES['high-risk'],
    reasoning,
  };
}

function checkHighRiskPathwayB(
  input: ClassificationInput,
  reasoning: string[],
): ClassificationResult | null {
  if (input.annexIIICategory == null) {
    reasoning.push('✗ Not in any Annex III high-risk use case category');
    return null;
  }

  const categoryLabels: Record<string, { number: number; label: string }> = {
    biometrics: { number: 1, label: 'Biometrics' },
    'critical-infrastructure': { number: 2, label: 'Critical Infrastructure' },
    education: { number: 3, label: 'Education and Vocational Training' },
    employment: { number: 4, label: 'Employment, Workers Management' },
    'essential-services': { number: 5, label: 'Essential Private and Public Services' },
    'law-enforcement': { number: 6, label: 'Law Enforcement' },
    migration: { number: 7, label: 'Migration, Asylum, Border Control' },
    'justice-democracy': { number: 8, label: 'Administration of Justice and Democracy' },
  };

  const cat = categoryLabels[input.annexIIICategory];
  if (!cat) {
    throw new TypeError(`Invalid annexIIICategory: ${input.annexIIICategory}`);
  }

  // Biometrics and critical infrastructure typically require third-party assessment
  const thirdPartyCategories = ['biometrics', 'critical-infrastructure'];
  const conformity: ConformityAssessment = thirdPartyCategories.includes(input.annexIIICategory)
    ? 'third-party'
    : 'self';

  reasoning.push(`✓ Annex III Category ${cat.number}: ${cat.label}`);
  reasoning.push(`  Conformity assessment: ${conformity === 'third-party' ? 'third-party (notified body)' : 'self-assessment'}`);
  reasoning.push('→ Classified as HIGH-RISK (Pathway B — Annex III)');

  return {
    tier: 'high-risk',
    subTier: `high-risk-annex-iii-${input.annexIIICategory}`,
    articles: [6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 26, 27, 43, 49],
    obligations: getHighRiskObligations(),
    openSourceExemption: false,
    conformityAssessment: conformity,
    enforcementDate: ENFORCEMENT_DATES['high-risk'],
    reasoning,
  };
}

function mergeHighRiskResults(
  pathwayA: ClassificationResult,
  pathwayB: ClassificationResult,
  reasoning: string[],
): ClassificationResult {
  // Use stricter conformity assessment
  const conformity: ConformityAssessment =
    pathwayA.conformityAssessment === 'third-party' || pathwayB.conformityAssessment === 'third-party'
      ? 'third-party'
      : 'self';

  reasoning.push('✓ Dual classification: both Annex I (Pathway A) and Annex III (Pathway B) apply');
  reasoning.push(`  Using stricter conformity assessment: ${conformity}`);

  return {
    tier: 'high-risk',
    subTier: `high-risk-dual-${pathwayB.subTier?.replace('high-risk-', '') ?? 'unknown'}`,
    articles: [...new Set([...pathwayA.articles, ...pathwayB.articles])].sort((a, b) => a - b),
    obligations: pathwayA.obligations, // Same obligations for all high-risk
    openSourceExemption: false,
    conformityAssessment: conformity,
    enforcementDate: ENFORCEMENT_DATES['high-risk'],
    reasoning,
  };
}

function checkLimitedRisk(
  input: ClassificationInput,
  reasoning: string[],
): ClassificationResult | null {
  const triggers: string[] = [];

  if (input.interactsWithPersons) triggers.push('interacts with natural persons');
  if (input.generatesSyntheticContent) triggers.push('generates synthetic content');
  if (input.emotionRecognition) triggers.push('performs emotion recognition');
  if (input.biometricCategorizing) triggers.push('performs biometric categorization');

  if (triggers.length === 0) {
    reasoning.push('✗ No limited-risk transparency triggers');
    return null;
  }

  reasoning.push(`✓ Limited risk transparency triggers: ${triggers.join(', ')}`);
  reasoning.push('→ Classified as LIMITED RISK');

  return {
    tier: 'limited',
    subTier: null,
    articles: [50],
    obligations: [{
      article: 50,
      title: 'Transparency Obligations',
      description: 'Users must be informed they are interacting with an AI system. Synthetic content must be labelled as AI-generated.',
      category: 'transparency',
    }],
    openSourceExemption: false,
    conformityAssessment: 'none',
    enforcementDate: ENFORCEMENT_DATES.limited,
    reasoning,
  };
}

function getGPAIObligations(systemic: boolean, openSource = false): Obligation[] {
  const obligations: Obligation[] = [];

  if (!openSource || systemic) {
    obligations.push(
      {
        article: 53,
        title: 'Technical Documentation',
        description: 'Draw up and keep up-to-date technical documentation of the model, including training and testing process and results.',
        category: 'documentation',
      },
      {
        article: 53,
        title: 'Information to Downstream Providers',
        description: 'Provide information and documentation to downstream providers integrating the model into their AI systems.',
        category: 'documentation',
      },
    );
  }

  obligations.push(
    {
      article: 53,
      title: 'Copyright Policy',
      description: 'Put in place a policy to comply with Union copyright law, in particular identifying and complying with opt-out rights.',
      category: 'copyright',
    },
    {
      article: 53,
      title: 'Training Data Summary',
      description: 'Draw up and make publicly available a sufficiently detailed summary of the content used for training the model.',
      category: 'training-data-summary',
    },
  );

  if (systemic) {
    obligations.push(
      {
        article: 55,
        title: 'Model Evaluation',
        description: 'Perform model evaluation including adversarial testing to identify and mitigate systemic risks.',
        category: 'risk-management',
      },
      {
        article: 55,
        title: 'Systemic Risk Assessment',
        description: 'Assess and mitigate possible systemic risks, including their sources, at Union level.',
        category: 'risk-management',
      },
      {
        article: 55,
        title: 'Incident Tracking and Reporting',
        description: 'Keep track of, document and report serious incidents and possible corrective measures to the AI Office.',
        category: 'incident-reporting',
      },
      {
        article: 55,
        title: 'Adequate Cybersecurity',
        description: 'Ensure an adequate level of cybersecurity protection for the model and its physical infrastructure.',
        category: 'accuracy-robustness',
      },
    );
  }

  return obligations;
}

function getHighRiskObligations(): Obligation[] {
  return [
    {
      article: 9,
      title: 'Risk Management System',
      description: 'Establish and maintain a risk management system throughout the AI system lifecycle.',
      category: 'risk-management',
    },
    {
      article: 10,
      title: 'Data Governance',
      description: 'Apply appropriate data governance and management practices for training, validation, and testing data sets.',
      category: 'data-governance',
    },
    {
      article: 11,
      title: 'Technical Documentation',
      description: 'Draw up technical documentation before placing the system on the market, kept up-to-date.',
      category: 'documentation',
    },
    {
      article: 12,
      title: 'Record-Keeping',
      description: 'Enable automatic recording of events (logs) throughout the system lifetime.',
      category: 'record-keeping',
    },
    {
      article: 13,
      title: 'Transparency and Information',
      description: 'Design the system to enable deployers to interpret output and use it appropriately.',
      category: 'transparency',
    },
    {
      article: 14,
      title: 'Human Oversight',
      description: 'Design the system to allow effective oversight by natural persons during use.',
      category: 'human-oversight',
    },
    {
      article: 15,
      title: 'Accuracy, Robustness, Cybersecurity',
      description: 'Achieve appropriate levels of accuracy, robustness, and cybersecurity.',
      category: 'accuracy-robustness',
    },
    {
      article: 72,
      title: 'Post-Market Monitoring',
      description: 'Establish and document a post-market monitoring system proportionate to the nature and risk.',
      category: 'monitoring',
    },
    {
      article: 73,
      title: 'Serious Incident Reporting',
      description: 'Report serious incidents to market surveillance authorities without undue delay.',
      category: 'incident-reporting',
    },
  ];
}
