import { describe, it, expect } from 'vitest';
import {
  normalizeBigFive,
  normalizeQuiz,
  calculateProfileScore,
  calculateComposite,
  getAutoDecision,
  calculateHumanScoreTotal,
  getHumanScoreVerdict,
  humanScoreToPercent,
} from '../../src/lib/scoring';

describe('normalizeBigFive', () => {
  it('passes through IPIP-NEO-120 scores (0-100)', () => {
    expect(normalizeBigFive(75)).toBe(75);
  });

  it('handles 0', () => {
    expect(normalizeBigFive(0)).toBe(0);
  });

  it('handles 100', () => {
    expect(normalizeBigFive(100)).toBe(100);
  });

  it('rounds decimal scores', () => {
    expect(normalizeBigFive(67.4)).toBe(67);
    expect(normalizeBigFive(67.5)).toBe(68);
  });

  it('falls back to TIPI-10 normalization for scores > 100', () => {
    // Legacy path: (score / 35) * 100 capped at 100
    expect(normalizeBigFive(105)).toBe(100);
  });
});

describe('normalizeQuiz', () => {
  it('passes through valid scores', () => {
    expect(normalizeQuiz(75)).toBe(75);
  });

  it('caps at 100', () => {
    expect(normalizeQuiz(120)).toBe(100);
  });

  it('floors at 0', () => {
    expect(normalizeQuiz(-10)).toBe(0);
  });

  it('rounds decimals', () => {
    expect(normalizeQuiz(87.5)).toBe(88);
  });
});

describe('calculateProfileScore', () => {
  it('returns 50 for null answers', () => {
    expect(calculateProfileScore(null)).toBe(50);
  });

  it('returns 50 for undefined answers', () => {
    expect(calculateProfileScore(undefined)).toBe(50);
  });

  it('returns 100 for perfect answers', () => {
    const perfect = {
      availability: 'yes',
      internet: 'yes',
      french_level: 'native',
      call_experience: 'yes_2',
    };
    expect(calculateProfileScore(perfect)).toBe(100);
  });

  it('returns 0 for worst answers', () => {
    const worst = {
      availability: 'no',
      internet: 'no',
      french_level: 'beginner',
      call_experience: 'none',
    };
    expect(calculateProfileScore(worst)).toBe(0);
  });

  it('calculates partial score correctly', () => {
    const partial = {
      availability: 'yes',      // 10
      internet: 'no',           // 0
      french_level: 'fluent',   // 7
      call_experience: 'yes_1', // 7
    };
    // (10 + 0 + 7 + 7) / 40 * 100 = 60
    expect(calculateProfileScore(partial)).toBe(60);
  });

  it('uses default 5 for unknown french_level', () => {
    const answers = {
      availability: 'yes',        // 10
      internet: 'yes',            // 10
      french_level: 'unknown',    // 5 (default)
      call_experience: 'yes_2',   // 10
    };
    // (10 + 10 + 5 + 10) / 40 * 100 = 87.5 → 88
    expect(calculateProfileScore(answers)).toBe(88);
  });
});

describe('calculateComposite', () => {
  it('calculates weighted average correctly', () => {
    // 80*0.4 + 70*0.3 + 60*0.3 = 32 + 21 + 18 = 71
    expect(calculateComposite(80, 70, 60)).toBe(71);
  });

  it('returns 100 for all perfect scores', () => {
    expect(calculateComposite(100, 100, 100)).toBe(100);
  });

  it('returns 0 for all zero scores', () => {
    expect(calculateComposite(0, 0, 0)).toBe(0);
  });
});

describe('getAutoDecision', () => {
  it('rejects below 40', () => {
    expect(getAutoDecision(39)).toBe('rejected');
    expect(getAutoDecision(0)).toBe('rejected');
  });

  it('sends to review at 40+', () => {
    expect(getAutoDecision(40)).toBe('review');
    expect(getAutoDecision(100)).toBe('review');
  });
});

describe('calculateHumanScoreTotal', () => {
  it('sums all criteria', () => {
    const scores = { ouverture: 4, qualification: 3, objections: 5, closing: 2, ton: 4, ecoute: 3 };
    expect(calculateHumanScoreTotal(scores)).toBe(21);
  });

  it('returns 0 for all zeros', () => {
    const scores = { ouverture: 0, qualification: 0, objections: 0, closing: 0, ton: 0, ecoute: 0 };
    expect(calculateHumanScoreTotal(scores)).toBe(0);
  });

  it('returns 30 for all fives', () => {
    const scores = { ouverture: 5, qualification: 5, objections: 5, closing: 5, ton: 5, ecoute: 5 };
    expect(calculateHumanScoreTotal(scores)).toBe(30);
  });
});

describe('getHumanScoreVerdict', () => {
  it('returns excellent for 25+', () => {
    expect(getHumanScoreVerdict(25)).toBe('excellent');
    expect(getHumanScoreVerdict(30)).toBe('excellent');
  });

  it('returns acceptable for 18-24', () => {
    expect(getHumanScoreVerdict(18)).toBe('acceptable');
    expect(getHumanScoreVerdict(24)).toBe('acceptable');
  });

  it('returns insuffisant for 1-17', () => {
    expect(getHumanScoreVerdict(1)).toBe('insuffisant');
    expect(getHumanScoreVerdict(17)).toBe('insuffisant');
  });

  it('returns none for 0', () => {
    expect(getHumanScoreVerdict(0)).toBe('none');
  });
});

describe('humanScoreToPercent', () => {
  it('converts 30/30 to 100%', () => {
    expect(humanScoreToPercent(30)).toBe(100);
  });

  it('converts 18/30 to 60%', () => {
    expect(humanScoreToPercent(18)).toBe(60);
  });

  it('converts 0/30 to 0%', () => {
    expect(humanScoreToPercent(0)).toBe(0);
  });
});
