/**
 * Intelligence Test — Sandia Matrices (Public Domain / Government Research)
 * 25 items across 4 difficulty levels, ~15 minutes
 * Each item shows a 3×3 matrix with the bottom-right cell missing.
 * The candidate picks from 8 options (2×4 grid).
 *
 * Correct answer positions are from Matzen et al. (2010) norming data.
 * Position 1–4 = top row left→right, 5–8 = bottom row left→right.
 */

export interface MatrixItem {
  id: number;
  /** Stimulus file name (without extension) */
  stimulus: string;
  /** Correct answer position (1–8) */
  answer: number;
  /** Difficulty: 'easy' | 'medium' | 'hard' | 'very_hard' */
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  /** % correct from norming study */
  normPct: number;
}

export const matrixItems: MatrixItem[] = [
  // ── Easy: 1 Layer (single transformation rule) ──────────────
  { id: 1,  stimulus: 'A1_1',  answer: 6, difficulty: 'easy',      normPct: 100 },
  { id: 2,  stimulus: 'B2_1',  answer: 8, difficulty: 'easy',      normPct: 100 },
  { id: 3,  stimulus: 'C1_1',  answer: 5, difficulty: 'easy',      normPct: 100 },
  { id: 4,  stimulus: 'D2_1',  answer: 7, difficulty: 'easy',      normPct: 100 },
  { id: 5,  stimulus: 'E2_1',  answer: 6, difficulty: 'easy',      normPct: 100 },
  { id: 6,  stimulus: 'A2_2',  answer: 4, difficulty: 'easy',      normPct: 100 },

  // ── Medium: 2 Layer (two transformation rules combined) ─────
  { id: 7,  stimulus: 'A1B2',  answer: 5, difficulty: 'medium',    normPct: 100 },
  { id: 8,  stimulus: 'B1D2',  answer: 4, difficulty: 'medium',    normPct: 100 },
  { id: 9,  stimulus: 'C1E2',  answer: 7, difficulty: 'medium',    normPct: 100 },
  { id: 10, stimulus: 'A2C3',  answer: 7, difficulty: 'medium',    normPct: 75 },
  { id: 11, stimulus: 'D1E3',  answer: 2, difficulty: 'medium',    normPct: 75 },
  { id: 12, stimulus: 'A1D3',  answer: 8, difficulty: 'medium',    normPct: 50 },
  { id: 13, stimulus: 'B2C4',  answer: 5, difficulty: 'medium',    normPct: 50 },
  { id: 14, stimulus: 'C3D5',  answer: 8, difficulty: 'medium',    normPct: 50 },

  // ── Hard: Logic OR ──────────────────────────────────────────
  { id: 15, stimulus: 'X_4',   answer: 2, difficulty: 'hard',      normPct: 100 },
  { id: 16, stimulus: 'X_3',   answer: 7, difficulty: 'hard',      normPct: 75 },
  { id: 17, stimulus: 'X_9',   answer: 5, difficulty: 'hard',      normPct: 75 },
  { id: 18, stimulus: 'X_5',   answer: 8, difficulty: 'hard',      normPct: 50 },
  { id: 19, stimulus: 'X_10',  answer: 4, difficulty: 'hard',      normPct: 50 },
  { id: 20, stimulus: 'X_1',   answer: 5, difficulty: 'hard',      normPct: 25 },
  { id: 21, stimulus: 'X_13',  answer: 7, difficulty: 'hard',      normPct: 25 },

  // ── Very Hard: Logic AND / XOR ──────────────────────────────
  { id: 22, stimulus: 'Y_6',   answer: 8, difficulty: 'very_hard', normPct: 75 },
  { id: 23, stimulus: 'Y_2',   answer: 5, difficulty: 'very_hard', normPct: 50 },
  { id: 24, stimulus: 'Z_9',   answer: 5, difficulty: 'very_hard', normPct: 100 },
  { id: 25, stimulus: 'Z_8',   answer: 4, difficulty: 'very_hard', normPct: 50 },
];

export const TOTAL_ITEMS = matrixItems.length;

export interface IntelligenceResult {
  correct: number;
  total: number;
  score: number; // 0–100
  byDifficulty: Record<string, { correct: number; total: number }>;
}

export function scoreIntelligence(answers: Record<number, number>): IntelligenceResult {
  let correct = 0;
  const byDifficulty: Record<string, { correct: number; total: number }> = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
    very_hard: { correct: 0, total: 0 },
  };

  for (const item of matrixItems) {
    byDifficulty[item.difficulty].total++;
    if (answers[item.id] === item.answer) {
      correct++;
      byDifficulty[item.difficulty].correct++;
    }
  }

  const score = Math.round((correct / TOTAL_ITEMS) * 100);
  return { correct, total: TOTAL_ITEMS, score, byDifficulty };
}
