import { describe, it, expect } from 'vitest';
import { generateReport } from '../reports/generator.js';
import { classify } from '../classifier/engine.js';
import { getChecklist } from '../checklists/generator.js';
import type { ClassificationInput, ChecklistProgress } from '../data/types.js';

/** Helper: returns a full ClassificationInput with all booleans false. */
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

const defaultOptions = {
  systemName: 'Test AI System',
  provider: 'Test Corp',
  intendedPurpose: 'Testing compliance report generation',
  date: '2026-01-15',
};

describe('generateReport', () => {
  it('generates a report for minimal risk', () => {
    const classification = classify(baseInput());
    const checklist = getChecklist('minimal');
    const report = generateReport(classification, checklist, defaultOptions);

    expect(report).toContain('# EU AI Act Compliance Report');
    expect(report).toContain('Test AI System');
    expect(report).toContain('Test Corp');
    expect(report).toContain('Minimal Risk');
    expect(report).toContain('2026-01-15');
    expect(report).toContain('does not constitute legal advice');
  });

  it('generates a report for high-risk', () => {
    const classification = classify(baseInput({ annexIIICategory: 'employment' }));
    const checklist = getChecklist('high-risk');
    const report = generateReport(classification, checklist, defaultOptions);

    expect(report).toContain('High-Risk');
    expect(report).toContain('Risk Management');
    expect(report).toContain('Data Governance');
    expect(report).toContain('## 2. Applicable Obligations');
    expect(report).toContain('## 3. Compliance Checklist');
    expect(report).toContain('Art. 9');
  });

  it('generates a report for prohibited', () => {
    const classification = classify(baseInput({ socialScoring: true }));
    const checklist = getChecklist('prohibited');
    const report = generateReport(classification, checklist, defaultOptions);

    expect(report).toContain('Prohibited');
    expect(report).toContain('Article 5');
  });

  it('generates a report for GPAI', () => {
    const classification = classify(baseInput({ isGPAI: true }));
    const checklist = getChecklist('gpai');
    const report = generateReport(classification, checklist, defaultOptions);

    expect(report).toContain('General-Purpose AI');
    expect(report).toContain('Article 53');
  });

  it('includes article reference appendix by default', () => {
    const classification = classify(baseInput({ annexIIICategory: 'employment' }));
    const checklist = getChecklist('high-risk');
    const report = generateReport(classification, checklist, defaultOptions);

    expect(report).toContain('Appendix: Applicable Article References');
    expect(report).toContain('Art.');
  });

  it('omits article appendix when includeArticleAppendix is false', () => {
    const classification = classify(baseInput({ annexIIICategory: 'employment' }));
    const checklist = getChecklist('high-risk');
    const report = generateReport(classification, checklist, {
      ...defaultOptions,
      includeArticleAppendix: false,
    });

    expect(report).not.toContain('Appendix: Applicable Article References');
  });

  it('includes progress when provided', () => {
    const classification = classify(baseInput({ annexIIICategory: 'employment' }));
    const checklist = getChecklist('high-risk');
    const firstItem = checklist.items[0]!;

    const progress: Record<string, ChecklistProgress> = {
      [firstItem.id]: { checked: true, evidence: 'Documented in RMS v2.1', checkedAt: '2026-01-10' },
    };

    const report = generateReport(classification, checklist, {
      ...defaultOptions,
      progress,
    });

    expect(report).toContain('[x]');
    expect(report).toContain('Documented in RMS v2.1');
  });

  it('defaults date to today if not provided', () => {
    const classification = classify(baseInput());
    const checklist = getChecklist('minimal');
    const { date: _, ...optionsWithoutDate } = defaultOptions;
    const report = generateReport(classification, checklist, optionsWithoutDate);

    // Should contain a date in ISO format
    expect(report).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('includes classification reasoning', () => {
    const classification = classify(baseInput({ annexIIICategory: 'employment' }));
    const checklist = getChecklist('high-risk');
    const report = generateReport(classification, checklist, defaultOptions);

    expect(report).toContain('Classification Reasoning');
    expect(report).toContain('Annex III');
  });

  it('includes enforcement timeline section', () => {
    const classification = classify(baseInput({ annexIIICategory: 'employment' }));
    const checklist = getChecklist('high-risk');
    const report = generateReport(classification, checklist, defaultOptions);

    expect(report).toContain('## 4. Enforcement Timeline');
    expect(report).toContain(classification.enforcementDate);
  });

  it('shows open-source exemption for GPAI', () => {
    const classification = classify(baseInput({ isGPAI: true, isOpenSource: true }));
    const checklist = getChecklist('gpai');
    const report = generateReport(classification, checklist, defaultOptions);

    expect(report).toContain('Open-Source Exemption');
  });

  it('shows conformity assessment type', () => {
    const classification = classify(baseInput({ annexIIICategory: 'biometrics' }));
    const checklist = getChecklist('high-risk');
    const report = generateReport(classification, checklist, defaultOptions);

    expect(report).toContain('Third-party assessment');
    expect(report).toContain('notified body');
  });
});

describe('generateReport — validation', () => {
  it('throws TypeError when options is null', () => {
    const classification = classify(baseInput());
    const checklist = getChecklist('minimal');
    expect(() => generateReport(classification, checklist, null as any)).toThrow(TypeError);
  });

  it('throws TypeError when systemName is missing', () => {
    const classification = classify(baseInput());
    const checklist = getChecklist('minimal');
    expect(() => generateReport(classification, checklist, {
      ...defaultOptions,
      systemName: '',
    })).toThrow(TypeError);
  });

  it('throws TypeError when provider is missing', () => {
    const classification = classify(baseInput());
    const checklist = getChecklist('minimal');
    expect(() => generateReport(classification, checklist, {
      ...defaultOptions,
      provider: '',
    })).toThrow(TypeError);
  });

  it('throws TypeError when intendedPurpose is missing', () => {
    const classification = classify(baseInput());
    const checklist = getChecklist('minimal');
    expect(() => generateReport(classification, checklist, {
      ...defaultOptions,
      intendedPurpose: '',
    })).toThrow(TypeError);
  });
});
