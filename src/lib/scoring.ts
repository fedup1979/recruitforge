/**
 * Scoring utilities for candidate evaluation.
 * Extracted from tests.astro and admin/candidates/detail.astro for testability.
 */

/** Normalize Big Five raw score to 0-100.
 * IPIP-NEO-120: overall score is already 0-100.
 * TIPI-10 (legacy): range ~5-35, normalize proportionally.
 */
export function normalizeBigFive(rawScore: number): number {
  // IPIP-NEO-120 scores are already 0-100
  if (rawScore >= 0 && rawScore <= 100) return Math.round(rawScore);
  // Legacy TIPI-10 fallback
  return Math.min(100, Math.round((rawScore / 35) * 100));
}

/** Quiz score is already 0-100, pass through with bounds check */
export function normalizeQuiz(rawScore: number): number {
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/** Calculate profile/knockout score from application answers */
export function calculateProfileScore(answers: Record<string, string> | null | undefined): number {
  if (!answers) return 50; // default

  let pts = 0;

  // Availability: yes=10
  if (answers.availability === 'yes') pts += 10;

  // Internet: yes=10
  if (answers.internet === 'yes') pts += 10;

  // French level: native=10, fluent=7, intermediate=3, beginner=0
  const frenchMap: Record<string, number> = { native: 10, fluent: 7, intermediate: 3, beginner: 0 };
  pts += frenchMap[answers.french_level] ?? 5;

  // Call experience: yes_2=10, yes_1=7, yes_less_1=3, none=0
  const expMap: Record<string, number> = { yes_2: 10, yes_1: 7, yes_less_1: 3, none: 0 };
  pts += expMap[answers.call_experience] ?? 5;

  return Math.round((pts / 40) * 100);
}

/** Calculate composite score: Big Five 40% + Quiz 30% + Profile 30% */
export function calculateComposite(bigFiveNorm: number, quizNorm: number, profileScore: number): number {
  return Math.round(bigFiveNorm * 0.4 + quizNorm * 0.3 + profileScore * 0.3);
}

/** Determine auto-decision based on composite score */
export function getAutoDecision(composite: number): 'rejected' | 'review' {
  return composite < 40 ? 'rejected' : 'review';
}

/** Calculate human roleplay score total from criteria scores */
export function calculateHumanScoreTotal(scores: Record<string, number>): number {
  return Object.values(scores).reduce((a, b) => a + b, 0);
}

/** Get human score verdict based on total /30 */
export function getHumanScoreVerdict(total: number): 'excellent' | 'acceptable' | 'insuffisant' | 'none' {
  if (total >= 25) return 'excellent';
  if (total >= 18) return 'acceptable';
  if (total > 0) return 'insuffisant';
  return 'none';
}

/** Calculate human score percentage */
export function humanScoreToPercent(total: number): number {
  return Math.round((total / 30) * 100);
}
