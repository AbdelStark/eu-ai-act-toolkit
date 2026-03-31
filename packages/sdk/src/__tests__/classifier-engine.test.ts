import { describe, it, expect } from 'vitest';
import { classify } from '../classifier/engine.js';
import type { ClassificationInput } from '../data/types.js';
import { OBLIGATION_CATEGORIES } from '../data/types.js';

/** Helper: returns a full ClassificationInput with all booleans false and no flags set. */
function baseInput(overrides: Partial<ClassificationInput> = {}): ClassificationInput {
  return {
    subliminalManipulation: false,
    exploitsVulnerabilities: false,
    socialScoring: false,
    predictivePolicing: false,
    untargetedFacialScraping: false,
    emotionInferenceWorkplace: false,
    biometricCategorization: false,
    realtimeBiometrics: false,
    isGPAI: false,
    annexIProduct: false,
    annexIIICategory: null,
    interactsWithPersons: false,
    generatesSyntheticContent: false,
    emotionRecognition: false,
    biometricCategorizing: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------
describe('classify — input validation', () => {
  it('throws TypeError on null input', () => {
    expect(() => classify(null as unknown as ClassificationInput)).toThrow(TypeError);
  });

  it('throws TypeError on undefined input', () => {
    expect(() => classify(undefined as unknown as ClassificationInput)).toThrow(TypeError);
  });

  it('throws TypeError on array input', () => {
    expect(() => classify([] as unknown as ClassificationInput)).toThrow(TypeError);
  });

  it('throws TypeError on primitive input', () => {
    expect(() => classify('hello' as unknown as ClassificationInput)).toThrow(TypeError);
  });

  it('throws TypeError when required boolean fields are missing', () => {
    expect(() => classify({} as unknown as ClassificationInput)).toThrow(TypeError);
    expect(() => classify({} as unknown as ClassificationInput)).toThrow(/missing required boolean/i);
  });

  it('throws TypeError when a boolean field has wrong type', () => {
    const bad = baseInput();
    (bad as unknown as Record<string, unknown>).socialScoring = 'yes';
    expect(() => classify(bad)).toThrow(TypeError);
    expect(() => classify(bad)).toThrow(/invalid field type/i);
  });

  it('throws TypeError when annexIIICategory is missing entirely', () => {
    const input = baseInput();
    delete (input as unknown as Record<string, unknown>).annexIIICategory;
    expect(() => classify(input)).toThrow(TypeError);
    expect(() => classify(input)).toThrow(/annexIIICategory/);
  });

  it('throws TypeError when gpaiFlops is negative', () => {
    expect(() => classify(baseInput({ isGPAI: true, gpaiFlops: -1 }))).toThrow(TypeError);
  });

  it('throws TypeError when gpaiFlops is NaN', () => {
    expect(() => classify(baseInput({ isGPAI: true, gpaiFlops: NaN }))).toThrow(TypeError);
  });

  it('throws TypeError when gpaiFlops is Infinity', () => {
    expect(() => classify(baseInput({ isGPAI: true, gpaiFlops: Infinity }))).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// Minimal risk (default path)
// ---------------------------------------------------------------------------
describe('classify — minimal risk', () => {
  it('classifies as minimal when no flags are set', () => {
    const result = classify(baseInput());
    expect(result.tier).toBe('minimal');
    expect(result.subTier).toBeNull();
    expect(result.articles).toEqual([]);
    expect(result.obligations).toHaveLength(0);
    expect(result.openSourceExemption).toBe(false);
    expect(result.conformityAssessment).toBe('none');
    expect(result.enforcementDate).toBe('2026-08-02');
    expect(result.reasoning.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Prohibited practices (Article 5)
// ---------------------------------------------------------------------------
describe('classify — prohibited practices', () => {
  const prohibitedFields: (keyof ClassificationInput)[] = [
    'subliminalManipulation',
    'exploitsVulnerabilities',
    'socialScoring',
    'predictivePolicing',
    'untargetedFacialScraping',
    'emotionInferenceWorkplace',
    'biometricCategorization',
    'realtimeBiometrics',
  ];

  for (const field of prohibitedFields) {
    it(`classifies as prohibited when ${field} is true`, () => {
      const result = classify(baseInput({ [field]: true }));
      expect(result.tier).toBe('prohibited');
      expect(result.articles).toContain(5);
      expect(result.enforcementDate).toBe('2025-02-02');
      expect(result.conformityAssessment).toBe('none');
    });
  }

  it('reports multiple prohibited practices in reasoning', () => {
    const result = classify(baseInput({
      socialScoring: true,
      realtimeBiometrics: true,
    }));
    expect(result.tier).toBe('prohibited');
    expect(result.reasoning.some(r => r.includes('Additional prohibited'))).toBe(true);
  });

  it('prohibited takes precedence over all other classifications', () => {
    const result = classify(baseInput({
      socialScoring: true,
      isGPAI: true,
      annexIProduct: true,
      annexIIICategory: 'employment',
      interactsWithPersons: true,
    }));
    expect(result.tier).toBe('prohibited');
  });
});

// ---------------------------------------------------------------------------
// GPAI classification
// ---------------------------------------------------------------------------
describe('classify — GPAI', () => {
  it('classifies standard GPAI model', () => {
    const result = classify(baseInput({ isGPAI: true }));
    expect(result.tier).toBe('gpai');
    expect(result.subTier).toBeNull();
    expect(result.articles).toContain(51);
    expect(result.articles).toContain(53);
    expect(result.openSourceExemption).toBe(false);
    expect(result.enforcementDate).toBe('2025-08-02');
  });

  it('classifies open-source GPAI with reduced obligations', () => {
    const result = classify(baseInput({ isGPAI: true, isOpenSource: true }));
    expect(result.tier).toBe('gpai');
    expect(result.subTier).toBe('gpai-open-source');
    expect(result.openSourceExemption).toBe(true);
    expect(result.articles).toContain(51);
    expect(result.articles).toContain(53);
    expect(result.articles).not.toContain(52);
  });

  it('classifies GPAI with systemic risk by FLOPs threshold', () => {
    const result = classify(baseInput({ isGPAI: true, gpaiFlops: 1e25 }));
    expect(result.tier).toBe('gpai-systemic');
    expect(result.articles).toContain(55);
    expect(result.openSourceExemption).toBe(false);
  });

  it('classifies GPAI with systemic risk by designation', () => {
    const result = classify(baseInput({ isGPAI: true, designatedSystemicRisk: true }));
    expect(result.tier).toBe('gpai-systemic');
    expect(result.articles).toContain(55);
  });

  it('systemic risk GPAI has no open-source exemption', () => {
    const result = classify(baseInput({
      isGPAI: true,
      isOpenSource: true,
      gpaiFlops: 1e26,
    }));
    expect(result.tier).toBe('gpai-systemic');
    expect(result.openSourceExemption).toBe(false);
    expect(result.subTier).toBe('gpai-systemic-open-source');
  });

  it('GPAI below FLOPs threshold is not systemic', () => {
    const result = classify(baseInput({ isGPAI: true, gpaiFlops: 9.9e24 }));
    expect(result.tier).toBe('gpai');
  });

  it('GPAI takes precedence over high-risk and limited', () => {
    const result = classify(baseInput({
      isGPAI: true,
      annexIIICategory: 'employment',
      interactsWithPersons: true,
    }));
    expect(result.tier).toBe('gpai');
  });
});

// ---------------------------------------------------------------------------
// High-risk classification
// ---------------------------------------------------------------------------
describe('classify — high-risk', () => {
  it('classifies via Pathway A (Annex I product)', () => {
    const result = classify(baseInput({ annexIProduct: true }));
    expect(result.tier).toBe('high-risk');
    expect(result.subTier).toContain('annex-i');
    expect(result.conformityAssessment).toBe('self');
    expect(result.enforcementDate).toBe('2026-08-02');
    expect(result.articles).toContain(6);
    expect(result.articles).toContain(9);
  });

  it('Pathway A with third-party assessment', () => {
    const result = classify(baseInput({
      annexIProduct: true,
      annexIRequiresThirdParty: true,
    }));
    expect(result.tier).toBe('high-risk');
    expect(result.conformityAssessment).toBe('third-party');
    expect(result.subTier).toBe('high-risk-annex-i-third-party');
  });

  it('classifies via Pathway B (Annex III category)', () => {
    const result = classify(baseInput({ annexIIICategory: 'employment' }));
    expect(result.tier).toBe('high-risk');
    expect(result.subTier).toBe('high-risk-annex-iii-employment');
    expect(result.conformityAssessment).toBe('self');
  });

  it('biometrics category gets third-party assessment', () => {
    const result = classify(baseInput({ annexIIICategory: 'biometrics' }));
    expect(result.tier).toBe('high-risk');
    expect(result.conformityAssessment).toBe('third-party');
  });

  it('critical-infrastructure category gets third-party assessment', () => {
    const result = classify(baseInput({ annexIIICategory: 'critical-infrastructure' }));
    expect(result.conformityAssessment).toBe('third-party');
  });

  it('dual pathway (Annex I + III) merges results', () => {
    const result = classify(baseInput({
      annexIProduct: true,
      annexIIICategory: 'education',
    }));
    expect(result.tier).toBe('high-risk');
    expect(result.subTier).toContain('dual');
    expect(result.reasoning.some(r => r.includes('Dual classification'))).toBe(true);
  });

  it('dual pathway uses stricter conformity assessment', () => {
    const result = classify(baseInput({
      annexIProduct: true,
      annexIIICategory: 'biometrics', // third-party
    }));
    expect(result.conformityAssessment).toBe('third-party');
  });

  it('throws on invalid annexIIICategory', () => {
    expect(() => classify(baseInput({
      annexIIICategory: 'invalid-category' as any,
    }))).toThrow(TypeError);
  });

  const allCategories = [
    'biometrics', 'critical-infrastructure', 'education', 'employment',
    'essential-services', 'law-enforcement', 'migration', 'justice-democracy',
  ] as const;

  for (const cat of allCategories) {
    it(`Annex III category '${cat}' produces high-risk`, () => {
      const result = classify(baseInput({ annexIIICategory: cat }));
      expect(result.tier).toBe('high-risk');
      expect(result.subTier).toContain(cat);
    });
  }

  it('high-risk obligations include all required articles', () => {
    const result = classify(baseInput({ annexIIICategory: 'employment' }));
    expect(result.obligations.length).toBeGreaterThan(0);
    const articles = result.obligations.map(o => o.article);
    expect(articles).toContain(9);  // risk management
    expect(articles).toContain(10); // data governance
    expect(articles).toContain(11); // documentation
    expect(articles).toContain(14); // human oversight
    expect(articles).toContain(15); // accuracy/robustness
  });
});

// ---------------------------------------------------------------------------
// Limited risk
// ---------------------------------------------------------------------------
describe('classify — limited risk', () => {
  it('classifies as limited when interacting with persons', () => {
    const result = classify(baseInput({ interactsWithPersons: true }));
    expect(result.tier).toBe('limited');
    expect(result.articles).toContain(50);
  });

  it('classifies as limited for synthetic content generation', () => {
    const result = classify(baseInput({ generatesSyntheticContent: true }));
    expect(result.tier).toBe('limited');
  });

  it('classifies as limited for emotion recognition', () => {
    const result = classify(baseInput({ emotionRecognition: true }));
    expect(result.tier).toBe('limited');
  });

  it('classifies as limited for biometric categorization', () => {
    const result = classify(baseInput({ biometricCategorizing: true }));
    expect(result.tier).toBe('limited');
  });

  it('multiple transparency triggers still produce limited risk', () => {
    const result = classify(baseInput({
      interactsWithPersons: true,
      generatesSyntheticContent: true,
      emotionRecognition: true,
    }));
    expect(result.tier).toBe('limited');
    expect(result.reasoning.some(r => r.includes('interacts with natural persons'))).toBe(true);
    expect(result.reasoning.some(r => r.includes('generates synthetic content'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------
describe('classify — determinism', () => {
  it('produces identical results for identical inputs', () => {
    const input = baseInput({ annexIIICategory: 'employment', interactsWithPersons: true });
    const result1 = classify(input);
    const result2 = classify(input);
    expect(result1).toEqual(result2);
  });
});

// ---------------------------------------------------------------------------
// Precedence order
// ---------------------------------------------------------------------------
describe('classify — precedence', () => {
  it('prohibited > GPAI > high-risk > limited > minimal', () => {
    // prohibited beats everything
    expect(classify(baseInput({ socialScoring: true, isGPAI: true })).tier).toBe('prohibited');
    // GPAI beats high-risk
    expect(classify(baseInput({ isGPAI: true, annexIIICategory: 'employment' })).tier).toBe('gpai');
    // high-risk beats limited
    expect(classify(baseInput({ annexIIICategory: 'employment', interactsWithPersons: true })).tier).toBe('high-risk');
    // limited beats minimal
    expect(classify(baseInput({ interactsWithPersons: true })).tier).toBe('limited');
    // minimal is default
    expect(classify(baseInput()).tier).toBe('minimal');
  });
});

// ---------------------------------------------------------------------------
// Boundary values & edge cases
// ---------------------------------------------------------------------------
describe('classify — boundary values', () => {
  it('gpaiFlops exactly at 1e25 threshold triggers systemic risk', () => {
    const result = classify(baseInput({ isGPAI: true, gpaiFlops: 1e25 }));
    expect(result.tier).toBe('gpai-systemic');
  });

  it('gpaiFlops at 9.999999999999999e24 does NOT trigger systemic risk', () => {
    const result = classify(baseInput({ isGPAI: true, gpaiFlops: 9.999999999999999e24 }));
    expect(result.tier).toBe('gpai');
  });

  it('gpaiFlops at 0 is valid and non-systemic', () => {
    const result = classify(baseInput({ isGPAI: true, gpaiFlops: 0 }));
    expect(result.tier).toBe('gpai');
  });

  it('gpaiFlops ignored when isGPAI is false', () => {
    const result = classify(baseInput({ isGPAI: false, gpaiFlops: 1e30 }));
    expect(result.tier).toBe('minimal');
  });

  it('designatedSystemicRisk with open-source still yields systemic (no exemption)', () => {
    const result = classify(baseInput({
      isGPAI: true,
      isOpenSource: true,
      designatedSystemicRisk: true,
    }));
    expect(result.tier).toBe('gpai-systemic');
    expect(result.openSourceExemption).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Obligation structure verification
// ---------------------------------------------------------------------------
describe('classify — obligation structure', () => {
  it('high-risk obligations have correct article numbers and categories', () => {
    const result = classify(baseInput({ annexIIICategory: 'employment' }));
    for (const obligation of result.obligations) {
      expect(obligation).toHaveProperty('article');
      expect(obligation).toHaveProperty('title');
      expect(obligation).toHaveProperty('description');
      expect(obligation).toHaveProperty('category');
      expect(typeof obligation.article).toBe('number');
      expect(obligation.article).toBeGreaterThan(0);
      expect(obligation.title.length).toBeGreaterThan(0);
      expect(obligation.description.length).toBeGreaterThan(0);
    }
  });

  it('GPAI standard obligations reference Article 53', () => {
    const result = classify(baseInput({ isGPAI: true }));
    const art53Obligations = result.obligations.filter(o => o.article === 53);
    expect(art53Obligations.length).toBeGreaterThanOrEqual(2);
    // Must include copyright and training data summary
    const categories = art53Obligations.map(o => o.category);
    expect(categories).toContain('copyright');
    expect(categories).toContain('training-data-summary');
  });

  it('GPAI systemic obligations include Article 55 items', () => {
    const result = classify(baseInput({ isGPAI: true, gpaiFlops: 1e26 }));
    const art55Obligations = result.obligations.filter(o => o.article === 55);
    expect(art55Obligations.length).toBeGreaterThanOrEqual(2);
    const categories = art55Obligations.map(o => o.category);
    expect(categories).toContain('risk-management');
    expect(categories).toContain('incident-reporting');
  });

  it('open-source GPAI has fewer obligations than standard GPAI', () => {
    const standard = classify(baseInput({ isGPAI: true }));
    const openSource = classify(baseInput({ isGPAI: true, isOpenSource: true }));
    expect(openSource.obligations.length).toBeLessThan(standard.obligations.length);
  });

  it('prohibited tier has exactly one obligation referencing Article 5', () => {
    const result = classify(baseInput({ socialScoring: true }));
    expect(result.obligations).toHaveLength(1);
    expect(result.obligations[0]!.article).toBe(5);
  });

  it('limited risk obligation references Article 50 transparency', () => {
    const result = classify(baseInput({ interactsWithPersons: true }));
    expect(result.obligations).toHaveLength(1);
    expect(result.obligations[0]!.article).toBe(50);
    expect(result.obligations[0]!.category).toBe('transparency');
  });

  it('minimal risk has zero obligations', () => {
    const result = classify(baseInput());
    expect(result.obligations).toHaveLength(0);
    expect(result.articles).toHaveLength(0);
  });

  it('high-risk result.articles contains core high-risk articles', () => {
    const result = classify(baseInput({ annexIIICategory: 'employment' }));
    // Articles 6, 9-17 (Chapter 2), 26, 27, 43, 49 per classification engine
    expect(result.articles).toContain(6);
    expect(result.articles).toContain(9);
    expect(result.articles).toContain(15);
    expect(result.articles).toContain(43);
    expect(result.articles).toContain(49);
  });

  it('all obligation articles are positive integers with valid categories', () => {
    const result = classify(baseInput({ annexIIICategory: 'employment' }));
    for (const obligation of result.obligations) {
      expect(Number.isInteger(obligation.article)).toBe(true);
      expect(obligation.article).toBeGreaterThan(0);
      expect(OBLIGATION_CATEGORIES).toContain(obligation.category);
    }
  });
});
