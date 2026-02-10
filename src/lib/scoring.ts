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

/** Calculate composite score: Big Five 30% + Intelligence 25% + Quiz 20% + Profile 25%
 * (Legacy fixed weights — use calculateDynamicComposite for job-specific weights)
 */
export function calculateComposite(bigFiveNorm: number, intelligenceNorm: number, quizNorm: number, profileScore: number): number {
  return Math.round(bigFiveNorm * 0.3 + intelligenceNorm * 0.25 + quizNorm * 0.2 + profileScore * 0.25);
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

// ============================================================
// Dynamic scoring (job_tests-based)
// ============================================================

export interface JobTestEntry {
  test_definition_id: string;
  slug: string;
  weight: number;
  threshold: number | null;
  is_required: boolean;
}

export interface TestScore {
  slug: string;
  score: number; // 0-100
}

/**
 * Calculate dynamic composite score using per-job weights from job_tests.
 * Weights are normalized so they sum to 1.0.
 * Returns { composite, breakdown, passesThresholds }.
 */
export function calculateDynamicComposite(
  testScores: TestScore[],
  jobTests: JobTestEntry[],
  profileScore: number
): { composite: number; breakdown: Record<string, number>; passesThresholds: boolean } {
  const scoreMap = new Map(testScores.map(s => [s.slug, s.score]));

  // Add profile score as virtual test
  scoreMap.set('profile', profileScore);

  // Filter to tests that have scores available
  const availableTests = jobTests.filter(jt => scoreMap.has(jt.slug));

  if (availableTests.length === 0) {
    return { composite: profileScore, breakdown: { profile: profileScore }, passesThresholds: true };
  }

  // Add profile weight (0.25) if not already in job_tests
  const totalWeight = availableTests.reduce((sum, jt) => sum + jt.weight, 0) + 0.25;

  let weightedSum = profileScore * (0.25 / totalWeight);
  const breakdown: Record<string, number> = { profile: profileScore };
  let passesThresholds = true;

  for (const jt of availableTests) {
    const score = scoreMap.get(jt.slug)!;
    const normalizedWeight = jt.weight / totalWeight;
    weightedSum += score * normalizedWeight;
    breakdown[jt.slug] = score;

    if (jt.threshold != null && jt.is_required && score < jt.threshold) {
      passesThresholds = false;
    }
  }

  return {
    composite: Math.round(weightedSum),
    breakdown,
    passesThresholds,
  };
}

/**
 * Calculate personality fit score (0-100) based on how well a candidate's
 * Big Five scores match the job's ideal personality profile.
 */
export function calculatePersonalityFit(
  candidateScores: { N: number; E: number; O: number; A: number; C: number },
  profile: { n_min: number; n_max: number; e_min: number; e_max: number; o_min: number; o_max: number; a_min: number; a_max: number; c_min: number; c_max: number }
): number {
  const dimensions: Array<{ score: number; min: number; max: number }> = [
    { score: candidateScores.N, min: profile.n_min, max: profile.n_max },
    { score: candidateScores.E, min: profile.e_min, max: profile.e_max },
    { score: candidateScores.O, min: profile.o_min, max: profile.o_max },
    { score: candidateScores.A, min: profile.a_min, max: profile.a_max },
    { score: candidateScores.C, min: profile.c_min, max: profile.c_max },
  ];

  let totalFit = 0;
  for (const dim of dimensions) {
    if (dim.score >= dim.min && dim.score <= dim.max) {
      totalFit += 100; // Perfect fit
    } else {
      // Calculate distance penalty
      const distance = dim.score < dim.min
        ? dim.min - dim.score
        : dim.score - dim.max;
      totalFit += Math.max(0, 100 - distance * 2);
    }
  }

  return Math.round(totalFit / 5);
}

/**
 * Calculate evaluation score from criteria scores (stars 1-5).
 * Returns { total, maxScore, percent }.
 */
export function calculateEvaluationScore(
  scores: Record<string, number>,
  criteriaCount: number
): { total: number; maxScore: number; percent: number } {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = criteriaCount * 5;
  const percent = maxScore > 0 ? Math.round((total / maxScore) * 100) : 0;
  return { total, maxScore, percent };
}

/**
 * Calculate inter-rater agreement between multiple evaluators' scores.
 * Returns a percentage (0-100) where 100 = perfect agreement.
 */
export function calculateInterRaterAgreement(
  evaluations: Array<Record<string, number>>
): number {
  if (evaluations.length < 2) return 100;

  const criteria = Object.keys(evaluations[0]);
  let totalAgreement = 0;

  for (const criterion of criteria) {
    const scores = evaluations.map(e => e[criterion] || 0);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxDev = Math.max(...scores.map(s => Math.abs(s - mean)));
    // Max possible deviation is 4 (1 to 5)
    totalAgreement += Math.round(((4 - maxDev) / 4) * 100);
  }

  return Math.round(totalAgreement / criteria.length);
}

/**
 * Calculate a multi-dimensional rank score for candidates.
 * Equal-weight average of all available dimension scores.
 * Candidates with more completed dimensions get a bonus.
 */
export function calculateRankScore(
  dimensions: Record<string, number | null>
): { score: number; completedCount: number; totalDimensions: number } {
  const entries = Object.entries(dimensions);
  const completed = entries.filter(([, v]) => v !== null && v !== undefined);
  const totalDimensions = entries.length;
  const completedCount = completed.length;

  if (completedCount === 0) return { score: 0, completedCount: 0, totalDimensions };

  const avg = completed.reduce((sum, [, v]) => sum + (v as number), 0) / completedCount;
  // Completeness bonus: up to 10 points for having all dimensions
  const completenessBonus = (completedCount / totalDimensions) * 10;

  return {
    score: Math.round(Math.min(100, avg + completenessBonus)),
    completedCount,
    totalDimensions,
  };
}
