import { describe, it, expect } from 'vitest';
import { matrixItems, TOTAL_ITEMS, scoreIntelligence } from '../../src/lib/intelligence';

describe('Intelligence test items', () => {
  it('has exactly 25 items', () => {
    expect(matrixItems.length).toBe(25);
    expect(TOTAL_ITEMS).toBe(25);
  });

  it('has unique IDs from 1 to 25', () => {
    const ids = matrixItems.map(i => i.id).sort((a, b) => a - b);
    expect(ids[0]).toBe(1);
    expect(ids[ids.length - 1]).toBe(25);
    const unique = new Set(ids);
    expect(unique.size).toBe(25);
  });

  it('has valid answer positions (1-8)', () => {
    matrixItems.forEach(item => {
      expect(item.answer).toBeGreaterThanOrEqual(1);
      expect(item.answer).toBeLessThanOrEqual(8);
    });
  });

  it('has all 4 difficulty levels', () => {
    const difficulties = new Set(matrixItems.map(i => i.difficulty));
    expect(difficulties.has('easy')).toBe(true);
    expect(difficulties.has('medium')).toBe(true);
    expect(difficulties.has('hard')).toBe(true);
    expect(difficulties.has('very_hard')).toBe(true);
  });

  it('has 6 easy, 8 medium, 7 hard, 4 very_hard items', () => {
    const counts = { easy: 0, medium: 0, hard: 0, very_hard: 0 };
    matrixItems.forEach(i => counts[i.difficulty]++);
    expect(counts.easy).toBe(6);
    expect(counts.medium).toBe(8);
    expect(counts.hard).toBe(7);
    expect(counts.very_hard).toBe(4);
  });

  it('items are in ascending difficulty order', () => {
    const diffOrder = { easy: 0, medium: 1, hard: 2, very_hard: 3 };
    for (let i = 1; i < matrixItems.length; i++) {
      expect(
        diffOrder[matrixItems[i].difficulty],
        `Item ${matrixItems[i].id} should not be easier than item ${matrixItems[i-1].id}`
      ).toBeGreaterThanOrEqual(diffOrder[matrixItems[i-1].difficulty]);
    }
  });

  it('all items have non-empty stimulus names', () => {
    matrixItems.forEach(item => {
      expect(item.stimulus.length).toBeGreaterThan(0);
    });
  });
});

describe('scoreIntelligence', () => {
  it('returns 0% for all wrong answers', () => {
    const answers: Record<number, number> = {};
    matrixItems.forEach(item => {
      // Pick a wrong answer (any value that isn't the correct one)
      answers[item.id] = item.answer === 1 ? 2 : 1;
    });
    const result = scoreIntelligence(answers);
    expect(result.correct).toBe(0);
    expect(result.score).toBe(0);
    expect(result.total).toBe(25);
  });

  it('returns 100% for all correct answers', () => {
    const answers: Record<number, number> = {};
    matrixItems.forEach(item => {
      answers[item.id] = item.answer;
    });
    const result = scoreIntelligence(answers);
    expect(result.correct).toBe(25);
    expect(result.score).toBe(100);
  });

  it('calculates partial scores correctly', () => {
    // Answer only the 6 easy items correctly
    const answers: Record<number, number> = {};
    matrixItems.forEach(item => {
      if (item.difficulty === 'easy') {
        answers[item.id] = item.answer;
      } else {
        answers[item.id] = item.answer === 1 ? 2 : 1;
      }
    });
    const result = scoreIntelligence(answers);
    expect(result.correct).toBe(6);
    expect(result.score).toBe(24); // 6/25 = 24%
    expect(result.byDifficulty.easy.correct).toBe(6);
    expect(result.byDifficulty.medium.correct).toBe(0);
  });

  it('handles missing answers (unanswered = 0, always wrong)', () => {
    const result = scoreIntelligence({});
    expect(result.correct).toBe(0);
    expect(result.score).toBe(0);
  });

  it('result has correct structure', () => {
    const result = scoreIntelligence({});
    expect(result).toHaveProperty('correct');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('byDifficulty');
    expect(result.byDifficulty).toHaveProperty('easy');
    expect(result.byDifficulty).toHaveProperty('medium');
    expect(result.byDifficulty).toHaveProperty('hard');
    expect(result.byDifficulty).toHaveProperty('very_hard');
  });
});
