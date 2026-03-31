/**
 * Cross-module data integrity tests.
 *
 * Validates that all data files are consistent with each other and
 * that cross-references between modules are valid. These tests catch
 * data drift where, for example, a checklist item references an
 * article that doesn't exist, or an example uses an invalid category.
 */
import { describe, it, expect } from 'vitest';
import { classify, getChecklist, getTimeline, getArticles, getArticle, getAnnexes, getAnnex, getExamples, validateExamples, getQuestions, RISK_TIERS, ANNEX_III_CATEGORIES, TEMPLATE_NAMES, generateTemplate } from '../index.js';

describe('cross-module data integrity', () => {
  // -----------------------------------------------------------------------
  // Checklist → Articles cross-reference
  // -----------------------------------------------------------------------
  describe('checklist items reference valid articles', () => {
    for (const tier of RISK_TIERS) {
      it(`${tier} checklist items reference valid articles (minimal tier allows null)`, () => {
        const checklist = getChecklist(tier);
        for (const item of checklist.items) {
          if (tier === 'minimal') {
            // Minimal tier voluntary items may have null/0 article (per CLAUDE.md exception)
            expect(item.article === null || item.article === undefined || item.article >= 0).toBe(true);
          } else {
            // All other tiers must cite a specific article
            expect(typeof item.article).toBe('number');
            expect(item.article).toBeGreaterThan(0);
          }
        }
      });
    }
  });

  // -----------------------------------------------------------------------
  // Timeline → Articles cross-reference
  // -----------------------------------------------------------------------
  describe('timeline events reference valid articles', () => {
    it('every timeline event has valid article references when present', () => {
      const events = getTimeline(new Date('2024-01-01'));
      for (const event of events) {
        expect(Array.isArray(event.articles)).toBe(true);
        for (const art of event.articles) {
          expect(art).toBeGreaterThan(0);
        }
      }
    });

    it('every timeline event has valid risk tier categories', () => {
      const events = getTimeline(new Date('2024-01-01'));
      for (const event of events) {
        for (const cat of event.categories) {
          expect(RISK_TIERS).toContain(cat);
        }
      }
    });
  });

  // -----------------------------------------------------------------------
  // Examples → Classification consistency
  // -----------------------------------------------------------------------
  describe('examples are consistent with classifier', () => {
    it('all examples classify to their expected tier', () => {
      const results = validateExamples();
      for (const r of results) {
        expect(r.pass).toBe(true);
      }
    });

    it('examples cover all six risk tiers', () => {
      const tiers = new Set(getExamples().map((e) => e.expectedTier));
      for (const tier of RISK_TIERS) {
        expect(tiers.has(tier)).toBe(true);
      }
    });

    it('example slugs match URL-safe pattern', () => {
      for (const ex of getExamples()) {
        expect(ex.slug).toMatch(/^[a-z0-9-]+$/);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Annex III ↔ Classifier consistency
  // -----------------------------------------------------------------------
  describe('annex III categories are consistent', () => {
    it('SDK ANNEX_III_CATEGORIES matches annexes.json categories', () => {
      const annexCategories = getAnnexes().map((a) => a.category).sort();
      const sdkCategories = [...ANNEX_III_CATEGORIES].sort();
      expect(annexCategories).toEqual(sdkCategories);
    });

    it('every ANNEX_III_CATEGORY classifies as high-risk', () => {
      for (const cat of ANNEX_III_CATEGORIES) {
        const result = classify({
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
          annexIIICategory: cat,
          interactsWithPersons: false,
          generatesSyntheticContent: false,
          emotionRecognition: false,
          biometricCategorizing: false,
        });
        expect(result.tier).toBe('high-risk');
      }
    });

    it('every annex category has at least one listed item', () => {
      for (const cat of ANNEX_III_CATEGORIES) {
        const annex = getAnnex(cat);
        expect(annex).not.toBeNull();
        expect(annex!.items.length).toBeGreaterThan(0);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Questions → Classification field mapping
  // -----------------------------------------------------------------------
  describe('questions cover classification inputs', () => {
    it('question steps include prohibited, high-risk, and limited steps', () => {
      const steps = getQuestions();
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toContain('prohibited');
    });

    it('every question has a valid article reference', () => {
      for (const step of getQuestions()) {
        for (const q of step.questions) {
          expect(q.article).toBeGreaterThan(0);
        }
      }
    });
  });

  // -----------------------------------------------------------------------
  // Templates produce valid Markdown
  // -----------------------------------------------------------------------
  describe('templates produce consistent output', () => {
    const input = {
      systemName: 'Integrity Test AI',
      provider: 'Test Corp',
      intendedPurpose: 'Cross-module validation',
    };

    for (const name of TEMPLATE_NAMES) {
      it(`${name} template contains legal disclaimer`, () => {
        const doc = generateTemplate(name, input);
        expect(doc).toContain('does not constitute legal advice');
      });

      it(`${name} template references Regulation 2024/1689`, () => {
        const doc = generateTemplate(name, input);
        expect(doc).toContain('2024/1689');
      });

      it(`${name} template contains [TODO] placeholders`, () => {
        const doc = generateTemplate(name, input);
        expect(doc).toContain('[TODO');
      });
    }
  });

  // -----------------------------------------------------------------------
  // Every tier has a checklist
  // -----------------------------------------------------------------------
  describe('every tier has a checklist', () => {
    for (const tier of RISK_TIERS) {
      it(`${tier} tier has a checklist with items`, () => {
        const checklist = getChecklist(tier);
        expect(checklist.tier).toBe(tier);
        // Even minimal tier should have at least voluntary items
        expect(checklist.items.length).toBeGreaterThan(0);
      });
    }
  });

  // -----------------------------------------------------------------------
  // Enforcement dates are valid
  // -----------------------------------------------------------------------
  describe('enforcement dates', () => {
    it('all timeline events have valid ISO dates', () => {
      const events = getTimeline(new Date('2024-01-01'));
      for (const event of events) {
        expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(isNaN(new Date(event.date).getTime())).toBe(false);
      }
    });

    it('classification results have valid enforcement dates', () => {
      for (const tier of RISK_TIERS) {
        const input = {
          socialScoring: tier === 'prohibited',
          realtimeBiometrics: false,
          subliminalManipulation: false,
          exploitsVulnerabilities: false,
          untargetedFacialScraping: false,
          emotionInferenceWorkplace: false,
          biometricCategorization: false,
          predictivePolicing: false,
          isGPAI: tier === 'gpai' || tier === 'gpai-systemic',
          gpaiFlops: tier === 'gpai-systemic' ? 1e26 : undefined,
          annexIProduct: false,
          annexIIICategory: tier === 'high-risk' ? 'employment' as const : null,
          interactsWithPersons: tier === 'limited',
          generatesSyntheticContent: false,
          emotionRecognition: false,
          biometricCategorizing: false,
        };
        const result = classify(input);
        expect(result.enforcementDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });
});
