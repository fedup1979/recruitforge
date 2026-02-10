/**
 * Quiz utilities — extracted from test/quiz.astro for testability.
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Quel est le principal objectif d'un setter ?",
    options: ['Vendre directement le produit', 'Booker un rendez-vous avec un conseiller', 'Envoyer des emails promotionnels', 'Créer du contenu marketing'],
    correct: 1,
  },
  {
    question: 'Combien de leads un setter traite-t-il en moyenne par jour ?',
    options: ['10-20', '30-50', '50-80', '100-200'],
    correct: 1,
  },
  {
    question: 'Quelle est la durée typique de la formation proposée ?',
    options: ['1 mois', '3 mois', '6 mois', '12 mois'],
    correct: 1,
  },
  {
    question: "Quel est le KPI principal d'un setter ?",
    options: ["Nombre d'emails envoyés", 'Taux de rendez-vous bookés', 'Nombre de ventes conclues', "Durée moyenne d'appel"],
    correct: 1,
  },
  {
    question: 'Quel est le taux de réussite annoncé de la formation ?',
    options: ['75%', '85%', '95%', '100%'],
    correct: 2,
  },
  {
    question: "Quelle est la meilleure réaction face à l'objection « Je dois réfléchir » ?",
    options: ['Raccrocher et rappeler plus tard', 'Demander ce qui fait hésiter, puis rassurer', "Insister lourdement sur l'urgence", 'Proposer une réduction de prix'],
    correct: 1,
  },
  {
    question: 'Quelles modalités de paiement proposer à un prospect ?',
    options: ['Paiement unique obligatoire', 'Paiement en plusieurs fois', "Gratuit, financé par l'État", 'Paiement à crédit bancaire'],
    correct: 1,
  },
  {
    question: 'Que signifie un bon taux de contact ?',
    options: ['Plus de 20% des appels aboutissent', 'Plus de 50% des appels aboutissent', 'Plus de 80% des appels aboutissent', '100% des appels aboutissent'],
    correct: 1,
  },
];

/** Calculate quiz score from user answers */
export function calculateQuizScore(answers: Record<number, number>): { correct: number; total: number; percent: number } {
  let correct = 0;
  quizQuestions.forEach((q, i) => {
    if (answers[i] === q.correct) correct++;
  });
  return {
    correct,
    total: quizQuestions.length,
    percent: Math.round((correct / quizQuestions.length) * 100),
  };
}

/** Get result emoji based on score percentage */
export function getResultEmoji(percent: number): string {
  if (percent >= 75) return '\u2705';
  if (percent >= 50) return '\u26A0\uFE0F';
  return '\u274C';
}
