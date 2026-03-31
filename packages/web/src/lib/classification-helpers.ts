import { classify, type ClassificationInput, type RiskTier } from '@eu-ai-act/sdk';

const DEFAULT_INPUT: ClassificationInput = {
  socialScoring: false,
  realtimeBiometrics: false,
  subliminalManipulation: false,
  exploitsVulnerabilities: false,
  untargetedFacialScraping: false,
  emotionInferenceWorkplace: false,
  biometricCategorization: false,
  predictivePolicing: false,
  isGPAI: false,
  annexIProduct: false,
  annexIIICategory: null,
  interactsWithPersons: false,
  generatesSyntheticContent: false,
  emotionRecognition: false,
  biometricCategorizing: false,
};

const TIER_INPUTS: Record<RiskTier, Partial<ClassificationInput>> = {
  prohibited: { socialScoring: true },
  'high-risk': { annexIIICategory: 'employment' },
  gpai: { isGPAI: true },
  'gpai-systemic': { isGPAI: true, designatedSystemicRisk: true },
  limited: { interactsWithPersons: true },
  minimal: {},
};

/** Build a ClassificationResult for a given tier using correct SDK field names. */
export function classificationForTier(tier: RiskTier) {
  return classify({ ...DEFAULT_INPUT, ...TIER_INPUTS[tier] });
}
