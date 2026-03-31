import { describe, it, expect } from 'vitest';
import { getQuestions } from '../classifier/questions.js';

describe('getQuestions', () => {
  it('returns an array of question steps', () => {
    const steps = getQuestions();
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
  });

  it('each step has required fields', () => {
    const steps = getQuestions();
    for (const step of steps) {
      expect(step.id).toBeTruthy();
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
      expect(Array.isArray(step.questions)).toBe(true);
      expect(step.questions.length).toBeGreaterThan(0);
    }
  });

  it('each question has required fields', () => {
    const steps = getQuestions();
    for (const step of steps) {
      for (const q of step.questions) {
        expect(q.id).toBeTruthy();
        expect(q.text).toBeTruthy();
        expect(typeof q.article).toBe('number');
        expect(q.article).toBeGreaterThan(0);
        expect(typeof q.help).toBe('string');
      }
    }
  });

  it('question IDs are globally unique', () => {
    const steps = getQuestions();
    const allIds = steps.flatMap(s => s.questions.map(q => q.id));
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
  });

  it('contains the expected step IDs', () => {
    const steps = getQuestions();
    const ids = steps.map(s => s.id);
    expect(ids).toContain('prohibited');
    expect(ids).toContain('gpai');
  });

  it('prohibited step references Article 5', () => {
    const steps = getQuestions();
    const prohibited = steps.find(s => s.id === 'prohibited');
    expect(prohibited).toBeDefined();
    for (const q of prohibited!.questions) {
      expect(q.article).toBe(5);
    }
  });
});
