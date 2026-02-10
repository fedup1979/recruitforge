import { describe, it, expect } from 'vitest';
import { items, scoreBigFive, ITEMS_PER_PAGE, TOTAL_PAGES, DOMAIN_LABELS, FACET_LABELS } from '../../src/lib/bigfive-neo';

describe('IPIP-NEO-120 items', () => {
  it('has exactly 120 items', () => {
    expect(items.length).toBe(120);
  });

  it('has 24 items per domain', () => {
    const domains = ['N', 'E', 'O', 'A', 'C'] as const;
    for (const d of domains) {
      const count = items.filter(i => i.domain === d).length;
      expect(count, `Domain ${d} should have 24 items`).toBe(24);
    }
  });

  it('has 4 items per facet (2 positive, 2 negative)', () => {
    const domains = ['N', 'E', 'O', 'A', 'C'] as const;
    for (const d of domains) {
      for (let f = 1; f <= 6; f++) {
        const facetItems = items.filter(i => i.domain === d && i.facet === f);
        expect(facetItems.length, `${d}${f} should have 4 items`).toBe(4);
        const pos = facetItems.filter(i => i.keyed === '+').length;
        const neg = facetItems.filter(i => i.keyed === '-').length;
        expect(pos, `${d}${f} should have 2 positive items`).toBe(2);
        expect(neg, `${d}${f} should have 2 negative items`).toBe(2);
      }
    }
  });

  it('has unique IDs from 1 to 120', () => {
    const ids = items.map(i => i.id).sort((a, b) => a - b);
    expect(ids[0]).toBe(1);
    expect(ids[ids.length - 1]).toBe(120);
    const unique = new Set(ids);
    expect(unique.size).toBe(120);
  });

  it('all items have non-empty text', () => {
    items.forEach(item => {
      expect(item.text.length, `Item ${item.id} should have text`).toBeGreaterThan(5);
    });
  });
});

describe('IPIP-NEO-120 pagination', () => {
  it('has 10 items per page', () => {
    expect(ITEMS_PER_PAGE).toBe(10);
  });

  it('has 12 pages total', () => {
    expect(TOTAL_PAGES).toBe(12);
  });
});

describe('IPIP-NEO-120 labels', () => {
  it('has labels for all 5 domains', () => {
    expect(Object.keys(DOMAIN_LABELS)).toHaveLength(5);
    expect(DOMAIN_LABELS.N).toBe('Névrosisme');
    expect(DOMAIN_LABELS.E).toBe('Extraversion');
  });

  it('has labels for all 30 facets', () => {
    expect(Object.keys(FACET_LABELS)).toHaveLength(30);
    expect(FACET_LABELS.N1).toBe('Anxiété');
    expect(FACET_LABELS.C6).toBe('Réflexion');
  });
});

describe('scoreBigFive', () => {
  it('returns all neutral scores (50) when all answers are 3', () => {
    const answers: Record<number, number> = {};
    items.forEach(item => { answers[item.id] = 3; });
    const result = scoreBigFive(answers);

    expect(result.overall).toBe(50);
    for (const d of ['N', 'E', 'O', 'A', 'C'] as const) {
      expect(result.domains[d].score).toBe(50);
    }
  });

  it('returns 0 for all domains when positive items get 1 and negative items get 5', () => {
    const answers: Record<number, number> = {};
    items.forEach(item => {
      answers[item.id] = item.keyed === '+' ? 1 : 5;
    });
    const result = scoreBigFive(answers);

    expect(result.overall).toBe(0);
    for (const d of ['N', 'E', 'O', 'A', 'C'] as const) {
      expect(result.domains[d].score).toBe(0);
    }
  });

  it('returns 100 for all domains when positive items get 5 and negative items get 1', () => {
    const answers: Record<number, number> = {};
    items.forEach(item => {
      answers[item.id] = item.keyed === '+' ? 5 : 1;
    });
    const result = scoreBigFive(answers);

    expect(result.overall).toBe(100);
    for (const d of ['N', 'E', 'O', 'A', 'C'] as const) {
      expect(result.domains[d].score).toBe(100);
    }
  });

  it('calculates facet scores correctly', () => {
    const answers: Record<number, number> = {};
    items.forEach(item => { answers[item.id] = 3; }); // default neutral

    // Set N1 items to extreme values → N1 should be 100
    const n1Items = items.filter(i => i.domain === 'N' && i.facet === 1);
    n1Items.forEach(item => {
      answers[item.id] = item.keyed === '+' ? 5 : 1;
    });

    const result = scoreBigFive(answers);
    expect(result.domains.N.facets.N1.score).toBe(100);
    expect(result.domains.N.facets.N1.raw).toBe(20);
  });

  it('defaults unanswered items to neutral (3)', () => {
    const result = scoreBigFive({});
    expect(result.overall).toBe(50);
  });

  it('result has correct structure', () => {
    const result = scoreBigFive({});
    expect(result).toHaveProperty('overall');
    expect(result).toHaveProperty('domains');
    for (const d of ['N', 'E', 'O', 'A', 'C'] as const) {
      expect(result.domains[d]).toHaveProperty('score');
      expect(result.domains[d]).toHaveProperty('facets');
      for (let f = 1; f <= 6; f++) {
        const key = `${d}${f}`;
        expect(result.domains[d].facets[key]).toHaveProperty('raw');
        expect(result.domains[d].facets[key]).toHaveProperty('score');
      }
    }
  });
});
