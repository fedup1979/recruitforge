-- Seed: Setter ESSR jobs (one per country)
-- Story: S6-005
-- Run this after migrations to populate initial job data

-- Setter ESSR - Madagascar
INSERT INTO jobs (title, description, requirements, country, salary_amount, salary_currency, salary_label, contract_type, location, status, test_config) VALUES (
  'Setter - Formation Secrétaire Médicale',
  'Appeler les leads Meta Ads et booker des rendez-vous téléphoniques avec Yasmine (conseillère formation) pour la Formation Secrétaire Médicale de l''École de Santé de Suisse Romande (ESSR).

Vos missions :
- Contacter les prospects ayant demandé des informations via Facebook/Instagram
- Qualifier les leads (motivation, disponibilité, budget)
- Gérer les objections avec empathie et professionnalisme
- Booker des rendez-vous de 15 minutes avec Yasmine, notre conseillère formation
- Atteindre un objectif de 8-12 RDV bookés par jour

Volume : ~50 leads/jour, 80-120 appels/jour, 25-40 conversations/jour

KPIs :
- Taux de contact : >50%
- Taux de RDV : >20%
- Qualité RDV (prospect présent) : >70%',
  ARRAY[
    'Français fluide avec accent compréhensible',
    'Voix agréable et ton chaleureux',
    'Écoute active et capacité à reformuler',
    'Résilience face au rejet',
    'Connexion internet stable (min 10 Mbps)',
    'Ordinateur avec casque audio',
    'Disponible du lundi au vendredi, 9h-18h (heure suisse)',
    'Expérience en appels téléphoniques (call center, téléprospection) est un plus'
  ],
  'MG',
  2500000,
  'MGA',
  '2.5M Ariary/mois',
  'Freelance',
  'Remote (Télétravail 100%)',
  'open',
  '{"tests": ["bigfive", "quiz", "roleplay_easy", "roleplay_medium"], "min_quiz_score": 60, "min_roleplay_score": 18}'::jsonb
) ON CONFLICT DO NOTHING;

-- Setter ESSR - Morocco
INSERT INTO jobs (title, description, requirements, country, salary_amount, salary_currency, salary_label, contract_type, location, status, test_config) VALUES (
  'Setter - Formation Secrétaire Médicale',
  'Appeler les leads Meta Ads et booker des rendez-vous téléphoniques avec Yasmine (conseillère formation) pour la Formation Secrétaire Médicale de l''École de Santé de Suisse Romande (ESSR).

Vos missions :
- Contacter les prospects ayant demandé des informations via Facebook/Instagram
- Qualifier les leads (motivation, disponibilité, budget)
- Gérer les objections avec empathie et professionnalisme
- Booker des rendez-vous de 15 minutes avec Yasmine, notre conseillère formation
- Atteindre un objectif de 8-12 RDV bookés par jour

Volume : ~50 leads/jour, 80-120 appels/jour, 25-40 conversations/jour

KPIs :
- Taux de contact : >50%
- Taux de RDV : >20%
- Qualité RDV (prospect présent) : >70%',
  ARRAY[
    'Français fluide avec accent compréhensible',
    'Voix agréable et ton chaleureux',
    'Écoute active et capacité à reformuler',
    'Résilience face au rejet',
    'Connexion internet stable (min 10 Mbps)',
    'Ordinateur avec casque audio',
    'Disponible du lundi au vendredi, 9h-18h (heure suisse)',
    'Expérience en appels téléphoniques (call center, téléprospection) est un plus'
  ],
  'MA',
  6000,
  'MAD',
  '6 000 DH/mois',
  'Freelance',
  'Remote (Télétravail 100%)',
  'open',
  '{"tests": ["bigfive", "quiz", "roleplay_easy", "roleplay_medium"], "min_quiz_score": 60, "min_roleplay_score": 18}'::jsonb
) ON CONFLICT DO NOTHING;
