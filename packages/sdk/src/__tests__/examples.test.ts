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
});
