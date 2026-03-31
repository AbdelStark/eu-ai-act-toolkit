import { describe, it, expect } from 'vitest';
import { getTimeline } from '../timeline/events.js';

describe('getTimeline', () => {
  it('returns an array of events', () => {
    const events = getTimeline();
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
  });

  it('events are sorted chronologically', () => {
    const events = getTimeline();
    for (let i = 1; i < events.length; i++) {
      expect(events[i]!.date >= events[i - 1]!.date).toBe(true);
    }
  });

  it('every event has required fields', () => {
    const events = getTimeline();
    for (const e of events) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.title).toBeTruthy();
      expect(typeof e.description).toBe('string');
      expect(Array.isArray(e.articles)).toBe(true);
      expect(Array.isArray(e.categories)).toBe(true);
      expect(['past', 'upcoming', 'future']).toContain(e.status);
      expect(typeof e.daysUntil).toBe('number');
    }
  });

  it('computes correct status relative to a reference date', () => {
    // Use a date we know: Feb 2, 2025 is the prohibited practices enforcement
    const beforeDate = new Date('2025-01-01');
    const events = getTimeline(beforeDate);
    const prohibitedEvent = events.find(e => e.date === '2025-02-02');
    expect(prohibitedEvent).toBeDefined();
    // 32 days from Jan 1 to Feb 2 — should be upcoming (within 90 days)
    expect(prohibitedEvent!.status).toBe('upcoming');
    expect(prohibitedEvent!.daysUntil).toBeGreaterThan(0);
  });

  it('marks past events correctly', () => {
    // Use a date well after all known events
    const futureDate = new Date('2030-01-01');
    const events = getTimeline(futureDate);
    for (const e of events) {
      expect(e.status).toBe('past');
      expect(e.daysUntil).toBeLessThan(0);
    }
  });

  it('marks future events correctly', () => {
    // Use a date well before all known events
    const earlyDate = new Date('2020-01-01');
    const events = getTimeline(earlyDate);
    for (const e of events) {
      expect(e.status).toBe('future');
      expect(e.daysUntil).toBeGreaterThan(90);
    }
  });

  it('throws TypeError on non-Date argument', () => {
    expect(() => getTimeline('2025-01-01' as unknown as Date)).toThrow(TypeError);
  });

  it('throws RangeError on invalid Date', () => {
    expect(() => getTimeline(new Date('not-a-date'))).toThrow(RangeError);
  });

  it('defaults to current date when no argument provided', () => {
    const events = getTimeline();
    const now = Date.now();
    // Feb 2, 2025 should be in the past for any date after Feb 2025
    const prohibitedEvent = events.find(e => e.date === '2025-02-02');
    if (prohibitedEvent && now > new Date('2025-02-02').getTime()) {
      expect(prohibitedEvent.status).toBe('past');
    }
  });

  it('categories are expanded from "all" to concrete tiers', () => {
    const events = getTimeline();
    for (const e of events) {
      for (const cat of e.categories) {
        expect(cat).not.toBe('all');
      }
    }
  });
});
