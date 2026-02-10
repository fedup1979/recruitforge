import { describe, it, expect } from 'vitest';
import { quizQuestions, calculateQuizScore, getResultEmoji } from '../../src/lib/quiz';

describe('quizQuestions', () => {
  it('has exactly 8 questions', () => {
    expect(quizQuestions).toHaveLength(8);
  });

  it('each question has 4 options', () => {
    quizQuestions.forEach((q, i) => {
      expect(q.options, `question ${i}`).toHaveLength(4);
    });
  });

  it('each question has a valid correct index', () => {
    quizQuestions.forEach((q, i) => {
      expect(q.correct, `question ${i}`).toBeGreaterThanOrEqual(0);
      expect(q.correct, `question ${i}`).toBeLessThan(q.options.length);
    });
  });

  it('does NOT mention ESSR, Secrétaire Médicale, FSM, or any confidential names', () => {
    const forbidden = ['ESSR', 'Secrétaire Médicale', 'FSM', 'François Dupuis', 'Laura Escariz', 'Yasmine', 'École de Santé'];
    quizQuestions.forEach((q, i) => {
      const allText = [q.question, ...q.options].join(' ');
      forbidden.forEach(term => {
        expect(allText, `question ${i} contains "${term}"`).not.toContain(term);
      });
    });
  });
});

describe('calculateQuizScore', () => {
  it('returns 100% for all correct answers', () => {
    const answers: Record<number, number> = {};
    quizQuestions.forEach((q, i) => { answers[i] = q.correct; });
    const result = calculateQuizScore(answers);
    expect(result.correct).toBe(8);
    expect(result.total).toBe(8);
    expect(result.percent).toBe(100);
  });

  it('returns 0% for all wrong answers', () => {
    const answers: Record<number, number> = {};
    quizQuestions.forEach((q, i) => { answers[i] = (q.correct + 1) % 4; });
    const result = calculateQuizScore(answers);
    expect(result.correct).toBe(0);
    expect(result.percent).toBe(0);
  });

  it('returns correct count for partial answers', () => {
    const answers: Record<number, number> = {};
    // Answer first 4 correctly, rest wrong
    quizQuestions.forEach((q, i) => {
      answers[i] = i < 4 ? q.correct : (q.correct + 1) % 4;
    });
    const result = calculateQuizScore(answers);
    expect(result.correct).toBe(4);
    expect(result.percent).toBe(50);
  });

  it('handles missing answers gracefully', () => {
    const result = calculateQuizScore({});
    expect(result.correct).toBe(0);
    expect(result.percent).toBe(0);
  });
});

describe('getResultEmoji', () => {
  it('returns checkmark for 75%+', () => {
    expect(getResultEmoji(75)).toBe('\u2705');
    expect(getResultEmoji(100)).toBe('\u2705');
  });

  it('returns warning for 50-74%', () => {
    expect(getResultEmoji(50)).toBe('\u26A0\uFE0F');
    expect(getResultEmoji(74)).toBe('\u26A0\uFE0F');
  });

  it('returns cross for below 50%', () => {
    expect(getResultEmoji(49)).toBe('\u274C');
    expect(getResultEmoji(0)).toBe('\u274C');
  });
});
