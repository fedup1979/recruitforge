/**
 * IPIP-NEO-120 — Big Five Personality Test (Public Domain)
 * 120 items, 5 domains, 30 facets (6 per domain), 4 items per facet
 * Based on Johnson (2014) IPIP-NEO-120 structure
 * French translations of public domain IPIP items
 *
 * Likert scale: 1–5
 *   1 = Très inexact
 *   2 = Plutôt inexact
 *   3 = Neutre
 *   4 = Plutôt exact
 *   5 = Très exact
 *
 * Scoring: reversed items use (6 - response)
 * Facet score: sum of 4 items → range 4–20 → normalized 0–100
 * Domain score: average of 6 facet scores → 0–100
 */

export type Domain = 'N' | 'E' | 'O' | 'A' | 'C';

export interface BigFiveItem {
  id: number;
  text: string;
  domain: Domain;
  facet: number; // 1–6
  keyed: '+' | '-';
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  N: 'Névrosisme',
  E: 'Extraversion',
  O: 'Ouverture',
  A: 'Agréabilité',
  C: 'Conscienciosité',
};

export const FACET_LABELS: Record<string, string> = {
  N1: 'Anxiété',
  N2: 'Colère',
  N3: 'Dépression',
  N4: 'Timidité sociale',
  N5: 'Impulsivité',
  N6: 'Vulnérabilité',
  E1: 'Cordialité',
  E2: 'Grégarité',
  E3: 'Assurance',
  E4: 'Activité',
  E5: 'Recherche de sensations',
  E6: 'Enthousiasme',
  O1: 'Imagination',
  O2: 'Sensibilité esthétique',
  O3: 'Émotivité',
  O4: 'Goût de l\'aventure',
  O5: 'Curiosité intellectuelle',
  O6: 'Libéralisme',
  A1: 'Confiance',
  A2: 'Moralité',
  A3: 'Altruisme',
  A4: 'Coopération',
  A5: 'Modestie',
  A6: 'Sympathie',
  C1: 'Sentiment de compétence',
  C2: 'Ordre',
  C3: 'Sens du devoir',
  C4: 'Ambition',
  C5: 'Autodiscipline',
  C6: 'Réflexion',
};

export const LIKERT_LABELS = [
  { value: 1, label: 'Très inexact' },
  { value: 2, label: 'Plutôt inexact' },
  { value: 3, label: 'Neutre' },
  { value: 4, label: 'Plutôt exact' },
  { value: 5, label: 'Très exact' },
];

// ─── 120 items in presentation order ────────────────────────────
// Cycling: N, E, O, A, C — alternating keyed + then - per facet
// Pattern: items 1–10 = facet 1 (5×+, 5×-), items 11–20 = facet 2, etc.
// Items 61–120 repeat pattern for 2nd pair of items per facet.

export const items: BigFiveItem[] = [
  // ── Facet 1, pair 1 ──────────────────
  { id: 1,  text: "Je m'inquiète pour des choses.",                         domain: 'N', facet: 1, keyed: '+' },
  { id: 2,  text: "Je me fais des amis facilement.",                        domain: 'E', facet: 1, keyed: '+' },
  { id: 3,  text: "J'ai une imagination débordante.",                       domain: 'O', facet: 1, keyed: '+' },
  { id: 4,  text: "Je fais confiance aux autres.",                          domain: 'A', facet: 1, keyed: '+' },
  { id: 5,  text: "Je mène mes tâches à bien.",                             domain: 'C', facet: 1, keyed: '+' },
  { id: 6,  text: "Je ne m'inquiète pas facilement.",                       domain: 'N', facet: 1, keyed: '-' },
  { id: 7,  text: "Je garde mes distances avec les autres.",                domain: 'E', facet: 1, keyed: '-' },
  { id: 8,  text: "J'ai rarement la tête dans les nuages.",                 domain: 'O', facet: 1, keyed: '-' },
  { id: 9,  text: "Je me méfie des intentions des autres.",                 domain: 'A', facet: 1, keyed: '-' },
  { id: 10, text: "Je doute souvent de mes capacités.",                     domain: 'C', facet: 1, keyed: '-' },

  // ── Facet 2, pair 1 ──────────────────
  { id: 11, text: "Je me mets facilement en colère.",                       domain: 'N', facet: 2, keyed: '+' },
  { id: 12, text: "J'aime les fêtes et les réunions.",                      domain: 'E', facet: 2, keyed: '+' },
  { id: 13, text: "J'apprécie l'art et la beauté.",                         domain: 'O', facet: 2, keyed: '+' },
  { id: 14, text: "J'essaie de ne pas tricher.",                            domain: 'A', facet: 2, keyed: '+' },
  { id: 15, text: "J'aime l'ordre et la propreté.",                         domain: 'C', facet: 2, keyed: '+' },
  { id: 16, text: "Il est difficile de me mettre en colère.",               domain: 'N', facet: 2, keyed: '-' },
  { id: 17, text: "Je préfère être seul(e).",                               domain: 'E', facet: 2, keyed: '-' },
  { id: 18, text: "L'art ne m'intéresse pas vraiment.",                     domain: 'O', facet: 2, keyed: '-' },
  { id: 19, text: "J'utilise la flatterie pour arriver à mes fins.",        domain: 'A', facet: 2, keyed: '-' },
  { id: 20, text: "Je laisse souvent traîner mes affaires.",                domain: 'C', facet: 2, keyed: '-' },

  // ── Facet 3, pair 1 ──────────────────
  { id: 21, text: "Je me sens souvent triste.",                             domain: 'N', facet: 3, keyed: '+' },
  { id: 22, text: "Je prends les choses en main.",                          domain: 'E', facet: 3, keyed: '+' },
  { id: 23, text: "Je ressens les émotions profondément.",                  domain: 'O', facet: 3, keyed: '+' },
  { id: 24, text: "J'aime aider les autres.",                               domain: 'A', facet: 3, keyed: '+' },
  { id: 25, text: "Je tiens mes promesses.",                                domain: 'C', facet: 3, keyed: '+' },
  { id: 26, text: "Je me sens rarement abattu(e).",                         domain: 'N', facet: 3, keyed: '-' },
  { id: 27, text: "J'attends que les autres décident.",                     domain: 'E', facet: 3, keyed: '-' },
  { id: 28, text: "Je montre rarement mes émotions.",                       domain: 'O', facet: 3, keyed: '-' },
  { id: 29, text: "Je me préoccupe peu des problèmes des autres.",          domain: 'A', facet: 3, keyed: '-' },
  { id: 30, text: "Il m'arrive de ne pas respecter les règles.",            domain: 'C', facet: 3, keyed: '-' },

  // ── Facet 4, pair 1 ──────────────────
  { id: 31, text: "Je suis facilement embarrassé(e).",                      domain: 'N', facet: 4, keyed: '+' },
  { id: 32, text: "Je suis toujours occupé(e).",                            domain: 'E', facet: 4, keyed: '+' },
  { id: 33, text: "J'aime essayer de nouvelles choses.",                    domain: 'O', facet: 4, keyed: '+' },
  { id: 34, text: "J'évite les conflits.",                                  domain: 'A', facet: 4, keyed: '+' },
  { id: 35, text: "Je vise l'excellence.",                                  domain: 'C', facet: 4, keyed: '+' },
  { id: 36, text: "Je suis à l'aise en société.",                           domain: 'N', facet: 4, keyed: '-' },
  { id: 37, text: "J'aime prendre mon temps.",                              domain: 'E', facet: 4, keyed: '-' },
  { id: 38, text: "Je n'aime pas le changement.",                           domain: 'O', facet: 4, keyed: '-' },
  { id: 39, text: "J'ai tendance à contredire les autres.",                 domain: 'A', facet: 4, keyed: '-' },
  { id: 40, text: "Je me contente du minimum.",                             domain: 'C', facet: 4, keyed: '-' },

  // ── Facet 5, pair 1 ──────────────────
  { id: 41, text: "J'ai du mal à résister à mes envies.",                   domain: 'N', facet: 5, keyed: '+' },
  { id: 42, text: "J'aime les sensations fortes.",                          domain: 'E', facet: 5, keyed: '+' },
  { id: 43, text: "J'aime réfléchir à des questions complexes.",            domain: 'O', facet: 5, keyed: '+' },
  { id: 44, text: "Je ne me considère pas meilleur(e) que les autres.",     domain: 'A', facet: 5, keyed: '+' },
  { id: 45, text: "Je commence les tâches immédiatement.",                  domain: 'C', facet: 5, keyed: '+' },
  { id: 46, text: "Je résiste facilement aux tentations.",                  domain: 'N', facet: 5, keyed: '-' },
  { id: 47, text: "Je préfère la routine.",                                 domain: 'E', facet: 5, keyed: '-' },
  { id: 48, text: "Les discussions abstraites m'ennuient.",                  domain: 'O', facet: 5, keyed: '-' },
  { id: 49, text: "Je pense avoir plus de valeur que les autres.",          domain: 'A', facet: 5, keyed: '-' },
  { id: 50, text: "Je remets souvent les choses à plus tard.",              domain: 'C', facet: 5, keyed: '-' },

  // ── Facet 6, pair 1 ──────────────────
  { id: 51, text: "Je panique facilement.",                                 domain: 'N', facet: 6, keyed: '+' },
  { id: 52, text: "Je rayonne de joie.",                                    domain: 'E', facet: 6, keyed: '+' },
  { id: 53, text: "Je remets en question l'autorité.",                      domain: 'O', facet: 6, keyed: '+' },
  { id: 54, text: "Je compatis avec les personnes en difficulté.",          domain: 'A', facet: 6, keyed: '+' },
  { id: 55, text: "Je réfléchis avant d'agir.",                             domain: 'C', facet: 6, keyed: '+' },
  { id: 56, text: "Je gère bien les situations stressantes.",               domain: 'N', facet: 6, keyed: '-' },
  { id: 57, text: "Je ne suis pas très enthousiaste.",                      domain: 'E', facet: 6, keyed: '-' },
  { id: 58, text: "Je respecte la tradition.",                              domain: 'O', facet: 6, keyed: '-' },
  { id: 59, text: "Je suis peu ému(e) par les difficultés des autres.",     domain: 'A', facet: 6, keyed: '-' },
  { id: 60, text: "J'agis souvent sans réfléchir.",                         domain: 'C', facet: 6, keyed: '-' },

  // ── Facet 1, pair 2 ──────────────────
  { id: 61, text: "J'ai peur de beaucoup de choses.",                       domain: 'N', facet: 1, keyed: '+' },
  { id: 62, text: "Je mets les gens à l'aise.",                             domain: 'E', facet: 1, keyed: '+' },
  { id: 63, text: "J'aime rêvasser.",                                       domain: 'O', facet: 1, keyed: '+' },
  { id: 64, text: "Je crois que les gens sont fondamentalement honnêtes.",  domain: 'A', facet: 1, keyed: '+' },
  { id: 65, text: "Je sais comment résoudre les problèmes.",                domain: 'C', facet: 1, keyed: '+' },
  { id: 66, text: "Je suis rarement anxieux(se).",                          domain: 'N', facet: 1, keyed: '-' },
  { id: 67, text: "J'ai du mal à aborder les gens.",                        domain: 'E', facet: 1, keyed: '-' },
  { id: 68, text: "Je préfère les faits concrets.",                          domain: 'O', facet: 1, keyed: '-' },
  { id: 69, text: "Je soupçonne souvent des motivations cachées.",          domain: 'A', facet: 1, keyed: '-' },
  { id: 70, text: "Je sous-estime mes compétences.",                        domain: 'C', facet: 1, keyed: '-' },

  // ── Facet 2, pair 2 ──────────────────
  { id: 71, text: "Je m'irrite facilement.",                                domain: 'N', facet: 2, keyed: '+' },
  { id: 72, text: "J'apprécie être entouré(e) de monde.",                   domain: 'E', facet: 2, keyed: '+' },
  { id: 73, text: "Je suis sensible à la musique et à l'art.",              domain: 'O', facet: 2, keyed: '+' },
  { id: 74, text: "Je suis honnête dans mes relations.",                    domain: 'A', facet: 2, keyed: '+' },
  { id: 75, text: "Je range tout à sa place.",                              domain: 'C', facet: 2, keyed: '+' },
  { id: 76, text: "Je reste calme sous pression.",                          domain: 'N', facet: 2, keyed: '-' },
  { id: 77, text: "J'évite les grands groupes.",                            domain: 'E', facet: 2, keyed: '-' },
  { id: 78, text: "Je ne vois pas l'intérêt de la poésie.",                 domain: 'O', facet: 2, keyed: '-' },
  { id: 79, text: "Il m'arrive de manipuler les autres.",                   domain: 'A', facet: 2, keyed: '-' },
  { id: 80, text: "Je suis souvent en désordre.",                           domain: 'C', facet: 2, keyed: '-' },

  // ── Facet 3, pair 2 ──────────────────
  { id: 81, text: "Je suis souvent découragé(e).",                          domain: 'N', facet: 3, keyed: '+' },
  { id: 82, text: "J'ai une personnalité affirmée.",                        domain: 'E', facet: 3, keyed: '+' },
  { id: 83, text: "Je suis touché(e) par les émotions des autres.",         domain: 'O', facet: 3, keyed: '+' },
  { id: 84, text: "Je consacre du temps aux autres.",                       domain: 'A', facet: 3, keyed: '+' },
  { id: 85, text: "Je respecte mes engagements.",                           domain: 'C', facet: 3, keyed: '+' },
  { id: 86, text: "Je suis rarement de mauvaise humeur.",                   domain: 'N', facet: 3, keyed: '-' },
  { id: 87, text: "J'ai du mal à m'imposer.",                               domain: 'E', facet: 3, keyed: '-' },
  { id: 88, text: "Je ne suis pas très émotif(ve).",                        domain: 'O', facet: 3, keyed: '-' },
  { id: 89, text: "Je suis plutôt indifférent(e) aux besoins d'autrui.",   domain: 'A', facet: 3, keyed: '-' },
  { id: 90, text: "J'oublie parfois mes obligations.",                      domain: 'C', facet: 3, keyed: '-' },

  // ── Facet 4, pair 2 ──────────────────
  { id: 91, text: "Je suis intimidé(e) par les autres.",                    domain: 'N', facet: 4, keyed: '+' },
  { id: 92, text: "Je fais les choses rapidement.",                         domain: 'E', facet: 4, keyed: '+' },
  { id: 93, text: "Je préfère la variété à la routine.",                    domain: 'O', facet: 4, keyed: '+' },
  { id: 94, text: "J'accepte facilement les compromis.",                    domain: 'A', facet: 4, keyed: '+' },
  { id: 95, text: "Je travaille dur pour atteindre mes objectifs.",         domain: 'C', facet: 4, keyed: '+' },
  { id: 96, text: "Je ne suis pas facilement gêné(e).",                     domain: 'N', facet: 4, keyed: '-' },
  { id: 97, text: "Je préfère un rythme tranquille.",                       domain: 'E', facet: 4, keyed: '-' },
  { id: 98, text: "Je m'en tiens à ce que je connais.",                     domain: 'O', facet: 4, keyed: '-' },
  { id: 99, text: "Je suis dur(e) en négociation.",                         domain: 'A', facet: 4, keyed: '-' },
  { id: 100, text: "Je manque de motivation pour réussir.",                 domain: 'C', facet: 4, keyed: '-' },

  // ── Facet 5, pair 2 ──────────────────
  { id: 101, text: "Je mange ou dépense trop.",                             domain: 'N', facet: 5, keyed: '+' },
  { id: 102, text: "Je recherche l'aventure.",                              domain: 'E', facet: 5, keyed: '+' },
  { id: 103, text: "J'ai soif de connaissances.",                           domain: 'O', facet: 5, keyed: '+' },
  { id: 104, text: "Je suis humble.",                                       domain: 'A', facet: 5, keyed: '+' },
  { id: 105, text: "Je finis toujours ce que j'ai commencé.",              domain: 'C', facet: 5, keyed: '+' },
  { id: 106, text: "Je sais me contrôler.",                                 domain: 'N', facet: 5, keyed: '-' },
  { id: 107, text: "J'évite les situations risquées.",                      domain: 'E', facet: 5, keyed: '-' },
  { id: 108, text: "Je ne m'intéresse pas aux idées théoriques.",           domain: 'O', facet: 5, keyed: '-' },
  { id: 109, text: "J'aime être le centre de l'attention.",                 domain: 'A', facet: 5, keyed: '-' },
  { id: 110, text: "J'ai du mal à me mettre au travail.",                   domain: 'C', facet: 5, keyed: '-' },

  // ── Facet 6, pair 2 ──────────────────
  { id: 111, text: "Je me sens dépassé(e) par les événements.",             domain: 'N', facet: 6, keyed: '+' },
  { id: 112, text: "J'ai un tempérament joyeux.",                           domain: 'E', facet: 6, keyed: '+' },
  { id: 113, text: "Je crois que les conventions sont faites pour être brisées.", domain: 'O', facet: 6, keyed: '+' },
  { id: 114, text: "Je suis touché(e) par la souffrance.",                  domain: 'A', facet: 6, keyed: '+' },
  { id: 115, text: "Je planifie à l'avance.",                               domain: 'C', facet: 6, keyed: '+' },
  { id: 116, text: "Je reste calme en situation de crise.",                  domain: 'N', facet: 6, keyed: '-' },
  { id: 117, text: "Je montre rarement mes émotions positives.",            domain: 'E', facet: 6, keyed: '-' },
  { id: 118, text: "Je crois que les règles doivent être suivies.",         domain: 'O', facet: 6, keyed: '-' },
  { id: 119, text: "Je suis plutôt dur(e) avec les gens.",                  domain: 'A', facet: 6, keyed: '-' },
  { id: 120, text: "Je prends des décisions impulsives.",                   domain: 'C', facet: 6, keyed: '-' },
];

// ─── Scoring ────────────────────────────────────────────────────

export interface FacetScore {
  raw: number;    // 4–20
  score: number;  // 0–100
}

export interface DomainScore {
  score: number;  // 0–100 (average of facet scores)
  facets: Record<string, FacetScore>;
}

export interface BigFiveResult {
  domains: Record<Domain, DomainScore>;
  overall: number; // 0–100 average of all domain scores (for composite)
}

export function scoreBigFive(answers: Record<number, number>): BigFiveResult {
  const domains: Domain[] = ['N', 'E', 'O', 'A', 'C'];
  const result: Record<string, DomainScore> = {};

  for (const d of domains) {
    const facets: Record<string, FacetScore> = {};
    for (let f = 1; f <= 6; f++) {
      const facetItems = items.filter(i => i.domain === d && i.facet === f);
      let raw = 0;
      for (const item of facetItems) {
        const val = answers[item.id] ?? 3; // default to neutral
        raw += item.keyed === '+' ? val : (6 - val);
      }
      // raw range: 4–20, normalize to 0–100
      const score = Math.round(((raw - 4) / 16) * 100);
      facets[`${d}${f}`] = { raw, score };
    }
    const facetScores = Object.values(facets).map(f => f.score);
    const domainScore = Math.round(facetScores.reduce((a, b) => a + b, 0) / facetScores.length);
    result[d] = { score: domainScore, facets };
  }

  const allDomainScores = domains.map(d => result[d].score);
  const overall = Math.round(allDomainScores.reduce((a, b) => a + b, 0) / allDomainScores.length);

  return { domains: result as Record<Domain, DomainScore>, overall };
}

/** Number of items per page in the test UI */
export const ITEMS_PER_PAGE = 10;

/** Total number of pages */
export const TOTAL_PAGES = Math.ceil(items.length / ITEMS_PER_PAGE);
