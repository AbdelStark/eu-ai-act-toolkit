import { describe, it, expect } from 'vitest';
import { getExamples, getExampleBySlug, validateExamples } from '../examples/loader.js';
import { classify } from '../classifier/engine.js';

describe('getExamples', () => {
  it('returns a non-empty array', () => {
    const examples = getExamples();
    expect(examples.length).toBeGreaterThan(0);
  });

  it('every example has required fields', () => {
    for (const ex of getExamples()) {
      expect(typeof ex.slug).toBe('string');
      expect(ex.slug.length).toBeGreaterThan(0);
      expect(typeof ex.title).toBe('string');
      expect(ex.title.length).toBeGreaterThan(0);
      expect(typeof ex.description).toBe('string');
      expect(ex.description.length).toBeGreaterThan(0);
      expect(typeof ex.classificationInput).toBe('object');
      expect(typeof ex.expectedTier).toBe('string');
      expect(Array.isArray(ex.walkthrough)).toBe(true);
      expect(ex.walkthrough.length).toBeGreaterThan(0);
    }
  });

  it('slugs are unique', () => {
    const slugs = getExamples().map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('contains known example slugs', () => {
    const slugs = getExamples().map((e) => e.slug);
    expect(slugs).toContain('chatbot');
    expect(slugs).toContain('hiring-tool');
    expect(slugs).toContain('autonomous-vehicle');
    expect(slugs).toContain('social-scoring-system');
    expect(slugs).toContain('foundation-model');
    expect(slugs).toContain('frontier-model');
    expect(slugs).toContain('open-source-llm');
    expect(slugs).toContain('spam-filter');
    expect(slugs).toContain('deepfake-generator');
    expect(slugs).toContain('credit-scoring');
  });

  it('covers all six risk tiers', () => {
    const tiers = new Set(getExamples().map((e) => e.expectedTier));
    expect(tiers.has('prohibited')).toBe(true);
    expect(tiers.has('high-risk')).toBe(true);
    expect(tiers.has('gpai')).toBe(true);
    expect(tiers.has('gpai-systemic')).toBe(true);
    expect(tiers.has('limited')).toBe(true);
    expect(tiers.has('minimal')).toBe(true);
  });
});

describe('getExampleBySlug', () => {
  it('returns a known example', () => {
    const chatbot = getExampleBySlug('chatbot');
    expect(chatbot).not.toBeNull();
    expect(chatbot!.slug).toBe('chatbot');
    expect(chatbot!.expectedTier).toBe('limited');
  });

  it('returns null for unknown slug', () => {
    expect(getExampleBySlug('nonexistent')).toBeNull();
  });

  it('throws TypeError on empty string', () => {
    expect(() => getExampleBySlug('')).toThrow(TypeError);
  });

  it('throws TypeError on non-string', () => {
    expect(() => getExampleBySlug(123 as unknown as string)).toThrow(TypeError);
  });
});

describe('validateExamples', () => {
  it('all examples classify to their expected tier', () => {
    const results = validateExamples();
    expect(results.length).toBeGreaterThan(0);

    for (const r of results) {
      expect(r.pass).toBe(true);
      expect(r.actualTier).toBe(r.expectedTier);
    }
  });

  it('returns one result per example', () => {
    const examples = getExamples();
    const results = validateExamples();
    expect(results.length).toBe(examples.length);
  });

  it('each result includes reasoning', () => {
    for (const r of validateExamples()) {
      expect(Array.isArray(r.reasoning)).toBe(true);
      expect(r.reasoning.length).toBeGreaterThan(0);
    }
  });
});

describe('example classificationInput validity', () => {
  it('every example input passes classify() without errors', () => {
    for (const ex of getExamples()) {
      expect(() => classify(ex.classificationInput)).not.toThrow();
    }
  });

  it('chatbot classifies as limited risk', () => {
    const chatbot = getExampleBySlug('chatbot')!;
    const result = classify(chatbot.classificationInput);
    expect(result.tier).toBe('limited');
  });

  it('hiring-tool classifies as high-risk', () => {
    const hiring = getExampleBySlug('hiring-tool')!;
    const result = classify(hiring.classificationInput);
    expect(result.tier).toBe('high-risk');
    expect(result.subTier).toContain('employment');
  });

  it('autonomous-vehicle classifies as high-risk via Annex I', () => {
    const av = getExampleBySlug('autonomous-vehicle')!;
    const result = classify(av.classificationInput);
    expect(result.tier).toBe('high-risk');
    expect(result.subTier).toContain('annex-i');
    expect(result.conformityAssessment).toBe('third-party');
  });

  it('social-scoring-system classifies as prohibited', () => {
    const ss = getExampleBySlug('social-scoring-system')!;
    const result = classify(ss.classificationInput);
    expect(result.tier).toBe('prohibited');
    expect(result.articles).toContain(5);
  });

  it('foundation-model classifies as gpai', () => {
    const fm = getExampleBySlug('foundation-model')!;
    const result = classify(fm.classificationInput);
    expect(result.tier).toBe('gpai');
    expect(result.openSourceExemption).toBe(false);
  });

  it('frontier-model classifies as gpai-systemic', () => {
    const fm = getExampleBySlug('frontier-model')!;
    const result = classify(fm.classificationInput);
    expect(result.tier).toBe('gpai-systemic');
    expect(result.articles).toContain(55);
  });

  it('open-source-llm classifies as gpai with exemption', () => {
    const os = getExampleBySlug('open-source-llm')!;
    const result = classify(os.classificationInput);
    expect(result.tier).toBe('gpai');
    expect(result.openSourceExemption).toBe(true);
    expect(result.subTier).toBe('gpai-open-source');
  });

  it('spam-filter classifies as minimal', () => {
    const sf = getExampleBySlug('spam-filter')!;
    const result = classify(sf.classificationInput);
    expect(result.tier).toBe('minimal');
  });

  it('deepfake-generator classifies as limited with multiple triggers', () => {
    const df = getExampleBySlug('deepfake-generator')!;
    const result = classify(df.classificationInput);
    expect(result.tier).toBe('limited');
  });

  it('credit-scoring classifies as high-risk essential-services', () => {
    const cs = getExampleBySlug('credit-scoring')!;
    const result = classify(cs.classificationInput);
    expect(result.tier).toBe('high-risk');
    expect(result.subTier).toContain('essential-services');
  });
});
