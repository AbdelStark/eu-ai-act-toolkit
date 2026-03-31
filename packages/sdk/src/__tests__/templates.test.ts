import { describe, it, expect } from 'vitest';
import { generateTemplate } from '../templates/renderer.js';
import { validateTemplateInput } from '../templates/schemas.js';
import { TEMPLATE_NAMES } from '../data/types.js';
import type { TemplateName, TemplateInput } from '../data/types.js';

const validInput: TemplateInput = {
  systemName: 'Test AI System',
  provider: 'Acme Corp',
  intendedPurpose: 'Automated testing of compliance toolkit',
  version: '2.0.0',
};

// ---------------------------------------------------------------------------
// generateTemplate
// ---------------------------------------------------------------------------
describe('generateTemplate', () => {
  for (const name of TEMPLATE_NAMES) {
    it(`generates valid Markdown for '${name}'`, () => {
      const doc = generateTemplate(name, validInput);
      expect(typeof doc).toBe('string');
      expect(doc.length).toBeGreaterThan(100);
      expect(doc).toContain('Test AI System');
      expect(doc).toContain('Acme Corp');
      expect(doc).toContain('[TODO');
      expect(doc).toContain('Regulation (EU) 2024/1689');
    });
  }

  it('interpolates system name and provider', () => {
    const doc = generateTemplate('technical-documentation', validInput);
    expect(doc).toContain('**AI System**: Test AI System');
    expect(doc).toContain('**Provider**: Acme Corp');
  });

  it('interpolates version when provided', () => {
    const doc = generateTemplate('technical-documentation', validInput);
    expect(doc).toContain('2.0.0');
  });

  it('uses [TODO] placeholder when version is omitted', () => {
    const { version, ...noVersion } = validInput;
    const doc = generateTemplate('technical-documentation', noVersion as TemplateInput);
    expect(doc).toContain('[TODO: version]');
  });

  it('uses today date when date is omitted', () => {
    const doc = generateTemplate('risk-management-system', validInput);
    const today = new Date().toISOString().split('T')[0];
    expect(doc).toContain(today);
  });

  it('uses provided date when given', () => {
    const doc = generateTemplate('risk-management-system', {
      ...validInput,
      date: '2025-06-15',
    });
    expect(doc).toContain('2025-06-15');
  });

  it('declaration of conformity includes declaration text', () => {
    const doc = generateTemplate('declaration-of-conformity', validInput);
    expect(doc).toContain('declare under our sole responsibility');
    expect(doc).toContain('Acme Corp');
  });

  it('GPAI model card includes training data and copyright sections', () => {
    const doc = generateTemplate('gpai-model-card', validInput);
    expect(doc).toContain('# GPAI Model Card');
    expect(doc).toContain('Training Data');
    expect(doc).toContain('Copyright Compliance');
    expect(doc).toContain('Downstream Provider Information');
    expect(doc).toContain('Article 53');
    expect(doc).toContain('Annex XI');
  });

  it('GPAI model card references Directive 2019/790', () => {
    const doc = generateTemplate('gpai-model-card', validInput);
    expect(doc).toContain('Directive 2019/790');
  });

  it('fundamental rights impact assessment covers key rights', () => {
    const doc = generateTemplate('fundamental-rights-impact', validInput);
    expect(doc).toContain('# Fundamental Rights Impact Assessment');
    expect(doc).toContain('Non-Discrimination');
    expect(doc).toContain('Privacy');
    expect(doc).toContain('Effective Remedy');
    expect(doc).toContain('Rights of the Child');
    expect(doc).toContain('Article 27');
  });

  it('fundamental rights impact assessment includes mitigation and monitoring', () => {
    const doc = generateTemplate('fundamental-rights-impact', validInput);
    expect(doc).toContain('Mitigation Measures');
    expect(doc).toContain('Monitoring and Review');
    expect(doc).toContain('Stakeholder Consultation');
    expect(doc).toContain('Redress Mechanisms');
  });
});

// ---------------------------------------------------------------------------
// validateTemplateInput
// ---------------------------------------------------------------------------
describe('validateTemplateInput', () => {
  it('throws RangeError on invalid template name', () => {
    expect(() => validateTemplateInput('invalid' as TemplateName, validInput)).toThrow(RangeError);
  });

  it('throws TypeError on null name', () => {
    expect(() => validateTemplateInput(null as unknown as TemplateName, validInput)).toThrow(TypeError);
  });

  it('throws TypeError on null input', () => {
    expect(() => validateTemplateInput('technical-documentation', null as unknown as TemplateInput)).toThrow(TypeError);
  });

  it('throws TypeError when systemName is missing', () => {
    expect(() => validateTemplateInput('technical-documentation', {
      provider: 'Acme',
      intendedPurpose: 'Testing',
    } as TemplateInput)).toThrow(TypeError);
  });

  it('throws TypeError when systemName is empty string', () => {
    expect(() => validateTemplateInput('technical-documentation', {
      systemName: '  ',
      provider: 'Acme',
      intendedPurpose: 'Testing',
    })).toThrow(TypeError);
  });

  it('throws TypeError when provider is missing', () => {
    expect(() => validateTemplateInput('technical-documentation', {
      systemName: 'AI',
      intendedPurpose: 'Testing',
    } as TemplateInput)).toThrow(TypeError);
  });

  it('throws TypeError when intendedPurpose is missing', () => {
    expect(() => validateTemplateInput('technical-documentation', {
      systemName: 'AI',
      provider: 'Acme',
    } as TemplateInput)).toThrow(TypeError);
  });

  it('accepts valid input without errors', () => {
    expect(() => validateTemplateInput('technical-documentation', validInput)).not.toThrow();
  });
});
