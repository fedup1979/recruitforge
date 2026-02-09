RecruitForge

Nigel, \[08-Feb-26 11:38\]  
📋 PLAN COMPLET AMBITIA — Résumé Final

1\. 🎯 VISION

AMBITIA est une entreprise de recrutement international qui utilise l'IA pour matcher des candidats avec des postes.

Ce qu'on construit : Une plateforme web (SaaS) où :

• Des entreprises publient des postes  
• Des candidats postulent et passent des tests automatisés  
• L'IA pré-qualifie et score les candidats  
• Les humains font la décision finale  
Modèle business :

• Phase 1 : ESSR utilise la plateforme (client interne)  
• Phase 2 : Autres entreprises clientes (SaaS payant)  
Ambition : Devenir leader du recrutement AI-powered pour l'Afrique francophone, puis scale mondial.

2\. 🧪 PREMIER USE CASE : Setter ESSR

Pour valider la plateforme, on recrute d'abord un Setter pour ESSR.

Le poste

| Élément      | Détail                                                            |  
| \------------ | \----------------------------------------------------------------- |  
| Mission      | Appeler les leads Meta Ads → Booker des RDV avec Yasmine (closer) |  
| Volume       | 20-50 leads/jour, 80-120 appels/jour                              |  
| Objectif     | 8-12 RDV bookés/jour                                              |  
| Localisation | Télétravail (Madagascar, Maroc, Afrique francophone)              |  
| Contrat      | Freelance, facturation mensuelle                                  |  
| Horaires     | Lundi-Vendredi, 9h-18h heure Suisse (CET)                         |  
| Salaire      | 2.5M Ariary (Madagascar) / 6'000 DH (Maroc)                       |  
| Équipement   | PC/Mac, casque micro, connexion 10+ Mbps                          |  
| Langue       | Français uniquement                                               |

Profil recherché

• Français fluide, accent compréhensible  
• Voix agréable, ton chaleureux  
• Écoute active, pose des questions  
• Résilient face au rejet  
• Fiable, ponctuel  
Red flags (éliminatoires)

• Accent incompréhensible  
• Ton robotique ou agressif  
• Incapable de gérer une objection  
• Retard aux tests  
• Connexion instable

3\. 🔄 PARCOURS CANDIDAT (6 étapes)

Étape 1 — Découverte (sans login)

• Candidat voit la liste des postes  
• Détails complets visibles : mission, salaire, conditions  
• Badge salaire affiché (transparence)  
• CTA "Postuler"  
Étape 2 — Inscription (login requis)

• Google OAuth (1 clic, recommandé)  
• Email classique (fallback avec vérification)  
• Apple Sign-In → Phase 2  
• Profil minimal : nom, pays, téléphone, email  
Étape 3 — Candidature

• Questions knockout (dispo, internet, langue)  
• Upload CV (optionnel, PDF max 5MB)  
• Validation MIME \+ rename UUID  
Étape 4 — Tests (\~25 min pour Setter)

4a. Formation produit (10 min)

• Vidéo présentation ESSR \+ Formation Secrétaire Médicale  
• Document : arguments clés \+ objections  
• Quiz de compréhension (5-10 questions)  
4b. Test Big Five (10 min)

• Version courte (TIPI ou similaire)  
• Profil recherché : Extraversion↑, Conscienciosité↑, Stabilité émotionnelle↑  
• Consentement granulaire obligatoire avant le test  
• Score automatique → Si trop bas \= refus poli  
4c. Sauvegarde progression

• Si abandon mid-test → état sauvegardé  
• Email : "Vous avez 24h pour reprendre"  
• 1 seul retry autorisé  
• Progress bar visible pour motiver  
Étape 5 — Review humain (24-48h)

• François/Laura examinent profil \+ Big Five  
• Décision : Avance / Refus / Pool  
• Seulement les qualifiés passent au Voice AI (économie \~80% coûts)  
Étape 6 — Roleplay vocal IA (10-15 min)

• Consentement enregistrement obligatoire  
• Candidat clique "Je suis prêt"  
• IA (Vapi) joue un prospect avec 2 scénarios :  • Facile : prospect motivée, répond bien  
  • Moyen : prospect hésitante, objections

• Conversation temps réel enregistrée  
• Transcript généré automatiquement  
Grille d'évaluation (/30) :

| Critère            | Points |  
| \------------------ | \------ |  
| Ouverture          | /5     |  
| Qualification      | /5     |  
| Gestion objections | /5     |  
| Closing            | /5     |  
| Ton général        | /5     |  
| Écoute             | /5     |

Nigel, \[08-Feb-26 11:38\]  
Score minimum : 18/30

Étape 7 — Décision finale

• Top candidats (score 25+) → Entretien final avec François/Laura  
• Bons candidats (18-24) → Pool ou embauche directe  
• Insuffisants (\<18) → Refus poli  
Étape 8 — Embauche

• Période d'essai : 2 semaines (configurable 1-4 semaines)  
• Formation complète CRM \+ process (2-3 jours)  
• Check-ins : J+3, J+7, J+14  
Étape 9 — Suivi post-embauche

| Période | Action                                      |  
| \------- | \------------------------------------------- |  
| J+30    | KPIs atteints ? Rétention ?                 |  
| J+60    | Performance stable ? Coaching ?             |  
| J+90    | Évaluation complète, confirmer ou remercier |

4\. 🗄️ TYPES DE POSTES SUPPORTÉS

La plateforme est générique — chaque poste configure ses propres tests :

| Type             | Tests                     | Durée    | Outil          |  
| \---------------- | \------------------------- | \-------- | \-------------- |  
| Setter/Sales     | Big Five \+ Roleplay vocal | 25 min   | Vapi           |  
| Développeur      | Big Five \+ Code challenge | 45 min   | CodeSandbox    |  
| Admin/Secrétaire | Big Five \+ Exercice Excel | 30 min   | Upload fichier |  
| Designer         | Big Five \+ Brief créatif  | 40 min   | Upload image   |  
| Autre            | Configurable              | Variable | Variable       |

5\. 🏗️ ARCHITECTURE TECHNIQUE

Stack

| Composant   | Choix              | Pourquoi                                     |  
| \----------- | \------------------ | \-------------------------------------------- |  
| Frontend    | Astro              | Statique, rapide, Claude Code friendly       |  
| UI          | DaisyUI \+ Tailwind | Composants prêts, mobile-first               |  
| Backend     | Supabase           | Auth \+ PostgreSQL \+ Storage \+ Edge Functions |  
| Hébergement | GitHub Pages       | Gratuit, intégré workflow dev                |  
| Voice AI    | Vapi               | Meilleur DX, pricing clair                   |  
| Emails      | Resend             | Free tier 3k/mois                            |  
| Monitoring  | Sentry             | Free tier 5k erreurs/mois                    |

Schéma Database

profiles (utilisateurs)  
├── id, email, full\_name, phone, country  
├── role (candidate / recruiter / admin)  
└── created\_at, updated\_at

jobs (postes)  
├── id, title, description, requirements  
├── salary\_info, contract\_type, location  
├── status (draft / open / closed)  
└── test\_config (JSON : quels tests, durées, seuils)

applications (candidatures)  
├── id, user\_id, job\_id  
├── status (pending → testing → review → interview → hired/rejected/pool)  
├── knockout\_answers, cv\_url  
└── created\_at, updated\_at

test\_results (résultats tests)  
├── id, application\_id, test\_type  
├── answers (JSON), score  
├── audio\_url, transcript (pour roleplay)  
├── human\_score (JSON)  
└── completed\_at

consents (GDPR)  
├── id, user\_id, consent\_type  
├── granted (boolean)  
└── granted\_at, ip\_address

Sécurité

Row Level Security (RLS) :

• Candidat voit uniquement SES candidatures et fichiers  
• Recruteur voit les candidats de SES postes  
• Admin voit tout  
• Tests automatisés obligatoires avant chaque deploy  
Uploads :

• Validation MIME dans Edge Function (magic bytes)  
• Rename en UUID (pas de filename exposé)  
• Bucket privé, accès via signed URLs (expiration 1h)  
• Limites : PDF 5MB, Vidéo 100MB, Audio 50MB  
Admin :

• 2FA obligatoire (email code pour MVP, TOTP Phase 2\)  
• Rate limiting : 5 auth/min, 10 uploads/min  
• Audit logs (qui a vu/modifié quoi)

6\. 🛡️ CONFORMITÉ GDPR

Principes

• Consentement explicite à l'inscription  
• Consentements granulaires avant Big Five et Voice AI  
• Données utilisées uniquement pour recrutement  
• Suppression sur demande (hard delete)  
• Pas de revente  
Conservation

| Type              | Durée                         |  
| \----------------- | \----------------------------- |  
| Candidats actifs  | 3 ans après dernière activité |  
| Employés          | Durée contrat \+ 5 ans         |  
| Candidats refusés | 2 ans                         |

Nigel, \[08-Feb-26 11:38\]  
| Pool inactif      | 6 mois                        |  
| Audio/vidéos      | 2 ans (consentement ML)       |

Transferts internationaux

• Données stockées dans l'UE (Supabase EU-West)  
• Candidats accèdent depuis Madagascar/Maroc mais données restent en UE  
• Pas de transfert hors UE au sens GDPR  
Breach notification

• \< 72h : notification CNIL si risque  
• Immédiat : notification candidats si risque élevé  
• Responsable : François Dupuis  
Documents à générer

• Privacy Policy (FR \+ EN)  
• CGU  
• Mentions légales

7\. 🎨 BRANDING

Identité

• Nom : AMBITIA  
• Domaines : ambitia.io (http://ambitia.io/) \+ ambitia.ai (http://ambitia.ai/) (à acheter)  
• Tagline EN : "Find Your Perfect Match"  
• Tagline FR : "Trouvez le poste qui vous correspond"  
Couleurs

| Couleur       | Code    | Usage              |  
| \------------- | \------- | \------------------ |  
| Electric Blue | \#2D5BFF | Principal, CTA     |  
| Deep Space    | \#1A1D29 | Texte, fond sombre |  
| Soft Purple   | \#6C5CE7 | Accents            |  
| Mint Green    | \#00D9A3 | Succès, validation |

Logo

"The Match" — Deux formes organiques qui s'emboîtent, formant un A négatif.

Typographie

Inter (Google Fonts) — 400/500 corps, 600/700 titres

UX Mobile-First

• Progress bar motivationnelle pendant les tests  
• Badge salaire visible sur les postes  
• OAuth 1-clic (Google)  
• Tests courts (max 30 min)  
• Vidéo teaser François sur homepage (15 sec)

8\. 📄 PAGES DU SITE

Publiques (sans login)

| Page       | Contenu                                            |  
| \---------- | \-------------------------------------------------- |  
| /          | Landing : vidéo François, mission, CTA vers postes |  
| /jobs      | Liste postes ouverts (badge salaire)               |  
| /jobs/\[id\] | Détail poste : mission, salaire, conditions, CTA   |  
| /about     | À propos d'AMBITIA                                 |  
| /privacy   | Privacy Policy                                     |  
| /terms     | CGU                                                |

Candidat (après login)

| Page        | Contenu                                 |  
| \----------- | \--------------------------------------- |  
| /dashboard  | Mes candidatures, statuts, progress bar |  
| /profile    | Mon profil, mes documents               |  
| /apply/\[id\] | Formulaire candidature                  |  
| /test/\[id\]  | Interface de test                       |

Admin (après login admin)

| Page                   | Contenu                                |  
| \---------------------- | \-------------------------------------- |  
| /admin                 | Dashboard global                       |  
| /admin/candidates      | Liste candidats (filtres, recherche)   |  
| /admin/candidates/\[id\] | Détail candidat, player audio, scoring |  
| /admin/jobs            | Gestion postes (CRUD)                  |  
| /admin/pool            | Gestion pools                          |  
| /admin/stats           | Analytics funnel                       |

9\. 📈 SCORING & AMÉLIORATION CONTINUE

Évolution

| Phase | Quand              | Méthode                                    |  
| \----- | \------------------ | \------------------------------------------ |  
| 1     | Maintenant         | Scoring humain (François/Laura) sur grille |  
| 2     | Après 50 candidats | Humain dédié \+ accord inter-juges          |  
| 3     | Après 100+ data    | ML entraîné sur patterns humains           |

Feedback loop

Tests → Score humain → Embauche → Performance 90J  
   ↑                                         ↓  
   └──────── Ré-analyse patterns ────────────┘

L'IA apprend quels profils Big Five et quels scores roleplay prédisent la réussite.

10\. 👥 POOL CANDIDATS

• Candidat "Pool" \= qualifié mais pas retenu maintenant  
• Pool \= par poste (Setter Pool ≠ Dev Pool)  
• Durée : 6 mois puis suppression  
• Notification : max 1 email/mois quand poste similaire ouvre  
• Lien désabonnement obligatoire

11\. 🗓️ ROADMAP (6 semaines)

Pré-requis (AVANT de commencer)

• \[ \] Acheter domaines ambitia.io (http://ambitia.io/) \+ ambitia.ai (http://ambitia.ai/) — François  
• \[ \] Test latence Vapi depuis Madagascar/Maroc

Nigel, \[08-Feb-26 11:38\]  
Semaine 1 — Foundation

• \[ \] Init projet Astro \+ DaisyUI  
• \[ \] Setup Supabase (auth, tables)  
• \[ \] Setup GitHub Pages \+ Actions CI  
• \[ \] Config Resend \+ Sentry  
• \[ \] Landing page \+ liste postes  
Semaine 2 — Auth & Candidature

• \[ \] Auth Google OAuth \+ Email  
• \[ \] Profil candidat  
• \[ \] Formulaire candidature  
• \[ \] Upload CV (MIME, UUID)  
• \[ \] Dashboard candidat \+ progress bar  
Semaine 3 — Tests

• \[ \] Big Five \+ consentement  
• \[ \] Quiz formation produit  
• \[ \] Scoring automatique  
• \[ \] Sauvegarde progression \+ retry 24h  
Semaine 4 — Voice AI & Admin

• \[ \] Intégration Vapi \+ consentement  
• \[ \] Interface roleplay  
• \[ \] Dashboard admin  
• \[ \] Player audio \+ scoring  
Semaine 5 — Admin Avancé

• \[ \] Emails transactionnels (Resend)  
• \[ \] Gestion pool  
• \[ \] Stats funnel  
• \[ \] Tests RLS complets  
Semaine 6 — Polish & Launch

• \[ \] Tests E2E  
• \[ \] Mobile responsive final  
• \[ \] Privacy Policy \+ CGU  
• \[ \] Sentry monitoring  
• \[ \] Soft launch premiers candidats  
Buffer réaliste : \+2-3 semaines

12\. 💰 BUDGET

Coûts fixes (\~100 CHF/mois)

| Item                 | Coût                |  
| \-------------------- | \------------------- |  
| Domaines (.io \+ .ai) | \~4 CHF/mois         |  
| Supabase             | 0-25 CHF/mois       |  
| GitHub Pages         | Gratuit             |  
| Resend               | Gratuit (free tier) |  
| Sentry               | Gratuit (free tier) |

Coûts variables

| Item            | Coût                     |  
| \--------------- | \------------------------ |  
| Voice AI (Vapi) | \~1 CHF/candidat qualifié |

Budget annuel estimé : \~1'200 CHF

13\. 📋 DÉCISIONS PHASE 2 (pas dans MVP)

| Feature                  | Quand                      |  
| \------------------------ | \-------------------------- |  
| Apple Sign-In            | Phase 2 (économise $99/an) |  
| WhatsApp notifications   | Phase 2 (\~20 CHF/mois)     |  
| Analytics avancés        | Après 100 candidats        |  
| ML scoring automatique   | Après 100+ data            |  
| Multi-entreprises (SaaS) | Phase 2                    |  
| PWA installable          | Phase 2                    |  
| TOTP 2FA                 | Phase 2                    |

14\. ⚠️ RISQUES & MITIGATIONS

| Risque                   | Mitigation                                |  
| \------------------------ | \----------------------------------------- |  
| RLS mal configuré        | Tests automatisés CI                      |  
| Latence Voice AI Afrique | Test terrain AVANT de coder               |  
| Peu de candidats         | 4 quadrants Hormozi (warm/cold × 1:1/1:N) |  
| Abandon tests            | Progress bar, retry 24h, tests courts     |  
| GDPR plainte             | Consentements granulaires, hard delete    |

15\. 📁 FICHIERS LIVRÉS

| Fichier                  | Contenu                                        |  
| \------------------------ | \---------------------------------------------- |  
| PLAN-AMBITIA-V3-FINAL.md | Ce plan en format technique                    |  
| METHODOLOGY-AMBITIA.md   | Guide pour Claude Code                         |  
| SCORECARD-SETTER-ESSR.md | Scorecard complète Setter \+ scénarios roleplay |  
| ESSR-FORMATIONS.md       | Knowledge base formations ESSR                 |  
| PROMPT-CLAUDE-CODE.md    | Prompt à copier-coller                         |

✅ CHECKLIST VALIDATION

• \[x\] Vision claire (entreprise de recrutement, pas juste un hire)  
• \[x\] Premier use case détaillé (Setter ESSR)  
• \[x\] Plateforme générique (multi-postes, multi-tests)  
• \[x\] Architecture technique complète  
• \[x\] Sécurité et GDPR  
• \[x\] Branding défini  
• \[x\] Roadmap réaliste  
• \[x\] Budget validé  
• \[x\] Reviewé par 5 agents experts  
• \[x\] Toutes corrections intégrées

C'est ça le plan. J'ai bien compris ? 🎯  
