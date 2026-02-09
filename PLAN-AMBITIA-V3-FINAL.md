# PLAN AMBITIA V3 — FINAL

*Version 3.1 — 2026-02-08*
*Intègre les 15 décisions de François + corrections des 5 reviews agents*

---

## 1. VISION & OBJECTIFS

### 1.1 Mission
AMBITIA est une plateforme de recrutement international qui matche des candidats avec des postes, en utilisant des tests standardisés et un scoring évolutif.

**Proposition de valeur :**
- Pour les **candidats** : Trouver un job remote bien payé, process transparent
- Pour les **entreprises** : Accéder à des talents pré-qualifiés, rétention élevée

### 1.2 Premier Use Case
**Poste : Setter pour ESSR (Formation Secrétaire Médicale)**
- Mission : Appeler les leads Meta → Booker RDV avec Yasmine (conseillère formation)
- Localisation : Télétravail (Madagascar, Maroc, Afrique francophone)
- Volume : 20-50 leads/jour
- Salaire : 2.5M Ariary (Madagascar) / 6'000 DH (Maroc)
- **Contrat** : Freelance (facturation mensuelle)
- **Horaires** : Lundi-Vendredi, 9h-18h CET (heure Suisse)
- **Équipement requis** : PC/Mac, casque avec micro, connexion internet stable (min 10 Mbps)
- **Outils fournis** : CRM + formation complète à l'embauche (2-3 jours)

### 1.3 Objectifs Phase 1
1. Recruter le premier Setter fonctionnel
2. Valider le process de recrutement
3. Collecter les premières données pour amélioration continue

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Stack Validé

| Composant | Choix | Justification |
|-----------|-------|---------------|
| **Frontend** | Astro | Statique, rapide, Claude Code friendly |
| **Backend** | Supabase | Auth + PostgreSQL + Storage + Edge Functions |
| **Hébergement** | GitHub Pages | Simple, gratuit, intégré workflow Tiago |
| **Design** | DaisyUI | Composants Tailwind, copy-paste |
| **Voice AI** | Vapi | Roleplay téléphonique temps réel (meilleur DX, pricing clair) |
| **Emails** | Resend | Free tier (3k/mois), fiable, moderne |
| **Monitoring** | Sentry | Free tier (5k erreurs/mois), alertes |

### 2.2 Architecture Sécurité

```
Frontend (GitHub Pages)
    ↓ (anon key publique)
Supabase
    ├── Auth (OAuth Google/Apple + email)
    ├── Database (PostgreSQL + RLS)
    ├── Storage (CVs, audio, vidéos)
    └── Edge Functions (logique sensible, Voice AI)
```

**Principes :**
- Clé anon = publique (by design Supabase)
- Sécurité = Row Level Security (RLS) sur TOUTES les tables
- Secrets = uniquement dans Edge Functions
- 2FA = obligatoire pour admins humains (François, Laura, Yasmine)
- API keys = pour accès IA/backend

### 2.3 Sécurité RLS — Tests Automatisés

**DÉCISION :** Claude Code écrit ET exécute des tests RLS automatisés à chaque PR.

```sql
-- Exemple test RLS (à générer pour chaque table)
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-123", "role": "candidate"}';

-- Test : Un candidat ne peut PAS voir les candidatures des autres
SELECT count(*) FROM applications WHERE user_id != 'user-123';
-- Attendu : 0

ROLLBACK;
```

**Processus :**
1. Claude Code crée fichier `tests/rls/[table].test.sql`
2. Tests exécutés via `supabase test` avant merge
3. CI bloque si test échoue

### 2.4 Coûts Estimés

| Item | Coût mensuel |
|------|-------------|
| Domaines (ambitia.io + .ai) | ~4 CHF |
| Supabase (Free → Pro si besoin) | 0-25 CHF |
| GitHub Pages | Gratuit |
| Resend (Free tier) | Gratuit |
| Sentry (Free tier) | Gratuit |
| Voice AI (~100 candidats) | ~100 CHF |
| **Total mensuel estimé** | **~100 CHF** |

**Budget annuel validé : ~1'200 CHF**

---

## 3. PARCOURS CANDIDAT

### 3.1 Funnel 3 Étapes (Voice AI optimisé)

**DÉCISION :** Voice AI = dernière étape, seulement pour candidats pré-qualifiés.

```
ÉTAPE 1 — GRATUIT (Filtre volume)
├── Découverte poste (sans login)
├── Inscription (OAuth Google/Apple ou email)
├── Candidature + questions knockout
├── Formation produit + Quiz (10 min)
└── Big Five court (10 min)
    ↓
    Score automatique → Si < seuil : Refus poli
    ↓
ÉTAPE 2 — REVIEW HUMAIN (24-48h)
├── François/Laura review profil + Big Five
└── Décision : Avance / Refus / Pool
    ↓
ÉTAPE 3 — VOICE AI (Candidats qualifiés seulement)
├── Invitation email
├── Roleplay IA vocal (10-15 min, ~1 CHF)
├── Score humain sur grille
└── Décision finale : Entretien / Refus / Pool
```

**Économie :** ~600 CHF/an (vs 3'000 CHF si Voice AI pour tous)

### 3.2 Inscription — Friction Minimale

**DÉCISION :** OAuth Google + Email classique (Apple Sign-In = Phase 2)

**Options d'inscription MVP :**
1. **Google** (1 clic) — recommandé
2. **Email** (fallback) — vérification email

*Note : Apple Sign-In ajouté en Phase 2 (économise $99/an Apple Developer Account)*

**Profil minimal :**
- Nom, Prénom
- Pays
- Téléphone (WhatsApp)
- Email (pré-rempli si OAuth)

### 3.3 Tests — Architecture Modulaire

Chaque poste définit ses propres tests :

| Type Poste | Tests | Durée | Outil |
|------------|-------|-------|-------|
| **Setter** | Big Five + Roleplay vocal | 25 min | Vapi |
| Développeur | Big Five + Code challenge | 45 min | CodeSandbox |
| Admin | Big Five + Exercice Excel | 30 min | Upload fichier |
| Designer | Big Five + Brief créatif | 40 min | Upload image |

### 3.3.1 Consentements Spécifiques (GDPR)

**Avant Big Five** (modal obligatoire) :
> "Ce test établit un profil de personnalité utilisé pour évaluer votre compatibilité avec le poste. Vos résultats ne seront pas partagés avec des tiers. En continuant, vous acceptez ce traitement."
> 
> ☐ J'accepte le test de personnalité

**Avant Roleplay vocal** (modal obligatoire) :
> "Cet entretien vocal sera enregistré et analysé pour évaluer vos compétences. L'enregistrement peut être utilisé pour améliorer notre système (anonymisé). En continuant, vous acceptez l'enregistrement."
> 
> ☐ J'accepte l'enregistrement vocal

*Note : Refus = candidature non évaluée (transparence)*

### 3.4 UX — Progress Bar + Badge Salaire

**DÉCISION :** Ajouter UX motivationnelle.

**Progress bar :**
```
[████████░░░░░░░░] 50% — Formation complétée !
```

**Badge salaire sur page poste :**
```
💰 2.5M Ariary/mois (Madagascar)
💰 6'000 DH/mois (Maroc)
```

**Vidéo teaser homepage :**
- François, 15 secondes
- "Bienvenue sur AMBITIA. On cherche des talents motivés pour rejoindre nos équipes."
- Mobile-first (vertical ou carré)

### 3.5 Abandon de Test — Retry Policy

**DÉCISION :** 1 retry dans les 24h.

- Candidat quitte mid-test → État sauvegardé
- Email automatique : "Vous avez 24h pour reprendre votre test"
- Après 24h → Marqué "Abandon" (pas de 2e chance)
- Admin peut override manuellement si cas légitime

---

## 4. SCORING & AMÉLIORATION CONTINUE

### 4.1 Évolution du Scoring (COMPOUND)

**DÉCISION :** L'IA apprend des patterns François/Laura au fil du temps.

| Phase | Période | Méthode |
|-------|---------|---------|
| **Phase 1** | Maintenant | Scoring humain (François/Laura) sur grille |
| **Phase 2** | Après 50 candidats | Humain dédié + accord inter-juges |
| **Phase 3** | Après 100+ data points | ML entraîné sur scores humains |

**Feedback loop :**
```
Tests → Score humain → Embauche → Performance 90J
    ↑                                      ↓
    └──────── Ré-analyse patterns ─────────┘
```

### 4.2 Données Collectées

**À chaque candidature :**
- Résultats Big Five (profil)
- Audio roleplay + transcript
- Scores humains détaillés
- Métadonnées (temps réponse, complétion, device)

**Post-embauche :**
- Rétention J+30, J+60, J+90
- KPIs métier (RDV/jour, taux conversion)
- Feedback manager

---

## 5. STORAGE — Uploads

### 5.1 Limites Fichiers

**DÉCISION :** Limites validées.

| Type | Max Size | Formats |
|------|----------|---------|
| CV (PDF) | 5 MB | .pdf |
| Vidéo | 100 MB | .mp4, .webm, .mov |
| Audio | 50 MB | .mp3, .wav, .webm |
| Image | 10 MB | .jpg, .png, .webp |

### 5.2 Sécurité Uploads

**Règles :**
1. **Validation MIME** — Vérifier type réel via magic bytes **dans Edge Function** (pas juste extension)
2. **Rename UUID** — Tous les fichiers renommés en UUID (pas de filename original exposé)
3. **Bucket privé** — Accès via signed URLs (expiration 1h)
4. **Scan optionnel** — ClamAV si volume important (Phase 2)

**Structure Storage :**
```
/candidates/{user_id}/cv/{uuid}.pdf
/candidates/{user_id}/audio/{uuid}.webm
/candidates/{user_id}/video/{uuid}.mp4
```

**RLS Storage Policies :**
```sql
-- Policy : candidat voit uniquement ses fichiers
CREATE POLICY "candidate_own_files" ON storage.objects
FOR ALL USING (
  bucket_id = 'candidates' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy : admin voit tout
CREATE POLICY "admin_all_files" ON storage.objects
FOR ALL USING (
  bucket_id = 'candidates'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 6. POOL CANDIDATS

### 6.1 Logique Pool

**DÉCISION :** Pool par job, notification respectueuse.

- Candidat "Pool" = qualifié mais pas retenu pour ce poste
- Pool = par poste (un candidat peut être Pool pour Setter, pas pour Dev)
- Durée : Configurable par poste (défaut 6 mois)

### 6.2 Notifications Pool

**Quand notifier :**
- Nouveau poste similaire ouvert
- Poste précédent a de la place

**Message type :**
```
Bonjour [Prénom],

Un nouveau poste [Titre] vient d'ouvrir chez AMBITIA.
Votre profil nous avait marqués — ça vous dit de postuler ?

[CTA : Voir le poste]

Se désabonner : [lien]
```

**Fréquence max :** 1 email/mois (pas de spam)

---

## 7. PÉRIODE D'ESSAI

### 7.1 Configuration

**DÉCISION :** Période d'essai configurable par poste.

| Paramètre | Défaut | Configurable |
|-----------|--------|--------------|
| Durée | 2 semaines | 1-4 semaines |
| KPIs requis | Définis par poste | Oui |
| Check-ins | J+3, J+7, J+14 | Oui |

### 7.2 Suivi Post-Embauche

| Période | Action |
|---------|--------|
| **J+3** | Check adaptation, problèmes techniques |
| **J+7** | Review mi-parcours, coaching si besoin |
| **J+14** | Décision Go/No-Go |
| **J+30** | KPIs atteints ? Rétention ? |
| **J+60** | Performance stable ? |
| **J+90** | Évaluation complète |

---

## 8. BACKEND ADMIN

### 8.1 Rôles

| Rôle | Permissions |
|------|-------------|
| **Super Admin** | Tout (François, Laura) |
| **Recruteur** | Voir candidats de ses postes, scorer |
| **Viewer** | Lecture seule |

### 8.2 Dashboard

- Liste candidats (filtrée par poste, statut, score)
- Détail candidat (profil, résultats tests, historique)
- Player audio roleplay
- Interface scoring
- Stats globales (funnel, conversion, rétention)

### 8.3 Sécurité Admin

- 2FA obligatoire (email code — natif Supabase, TOTP Phase 2)
- Session timeout : comportement Supabase par défaut (JWT 1h, refresh auto)
- Audit logs (qui a vu/modifié quoi)
- RLS strict (admin voit tout, recruteur voit ses postes)
- Rate limiting : 5 tentatives auth/min, 10 uploads/min

---

## 9. CONFORMITÉ & LÉGAL

### 9.1 GDPR — Approche Pragmatique

**DÉCISION :** DPA standard du provider + documenter dans Privacy Policy.

**Principes appliqués :**
- Consentement explicite à l'inscription
- Données utilisées uniquement pour le recrutement
- Suppression sur demande (email → hard delete)
- Pas de revente de données

**Documents à générer :**
- Privacy Policy (FR + EN) — Mention DPA avec Supabase
- Mentions légales
- CGU

**DPA (Data Processing Agreement) :**
- Supabase : Standard DPA intégré (AWS EU-West)
- Vapi/Resend : Signer leur DPA standard
- Documenter dans Privacy Policy section "Sous-traitants"

### 9.2 Données Stockées

| Type | Durée conservation |
|------|-------------------|
| Candidats actifs | 3 ans après dernière activité |
| Employés embauchés | Durée contrat + 5 ans (archivage légal) |
| Candidats refusés | 2 ans |
| Candidats supprimés | Hard delete immédiat |
| Pool inactif | 6 mois puis suppression |
| Audio/vidéos | 2 ans (avec consentement spécifique pour usage ML) |

### 9.3 Transferts Internationaux

**Architecture :** Les données restent dans l'UE (Supabase EU-West / AWS eu-west-1).

Les candidats à Madagascar/Maroc **accèdent** à la plateforme depuis l'étranger, mais leurs données personnelles sont **stockées et traitées** uniquement dans l'UE.

→ Pas de transfert hors UE au sens GDPR. Documenter dans Privacy Policy.

### 9.4 Processus Notification Breach (GDPR Art. 33)

En cas de violation de données :
1. **< 72h** : Notification CNIL (si risque pour les personnes)
2. **Immédiat** : Notification candidats concernés (si risque élevé)
3. **Documentation** : Registre des incidents

Responsable : François Dupuis (Super Admin)

---

## 10. BRANDING

### 10.1 Identité

**Nom :** AMBITIA
**Domaines :** ambitia.io + ambitia.ai (à acheter)
**Tagline EN :** "Find Your Perfect Match"
**Tagline FR :** "Trouvez le poste qui vous correspond"

### 10.2 Couleurs

| Couleur | Code | Usage |
|---------|------|-------|
| Electric Blue | #2D5BFF | Principal |
| Deep Space | #1A1D29 | Texte, fond sombre |
| Soft Purple | #6C5CE7 | Accents |
| Mint Green | #00D9A3 | Succès, CTA positifs |

### 10.3 Logo Concept

"The Match" — Deux formes organiques qui s'emboîtent, formant un A négatif au centre.

### 10.4 Typographie

- Titres : Inter 600-700
- Corps : Inter 400-500
- (Google Fonts, gratuit)

---

## 11. PAGES DU SITE

### 11.1 Pages Publiques

| Page | Contenu |
|------|---------|
| **/** | Landing (vidéo François, mission, CTA vers postes) |
| **/jobs** | Liste des postes ouverts (badge salaire visible) |
| **/jobs/[id]** | Détail poste (mission, salaire, conditions, CTA postuler) |
| **/about** | À propos d'AMBITIA |
| **/privacy** | Privacy Policy (incl. DPA providers) |
| **/terms** | CGU |

### 11.2 Pages Candidat (après login)

| Page | Contenu |
|------|---------|
| **/dashboard** | Mes candidatures, statuts, progress bar |
| **/profile** | Mon profil, documents |
| **/apply/[id]** | Formulaire candidature |
| **/test/[id]** | Interface de test (progress bar) |

### 11.3 Pages Admin (après login admin)

| Page | Contenu |
|------|---------|
| **/admin** | Dashboard global |
| **/admin/candidates** | Liste candidats |
| **/admin/candidates/[id]** | Détail + scoring |
| **/admin/jobs** | Gestion postes |
| **/admin/pool** | Gestion pools |
| **/admin/stats** | Analytics |

---

## 12. MULTI-LANGUE

### 12.1 Stratégie

- **Site :** FR + EN (interface)
- **Postes :** Langue du poste (pas de traduction auto)
- **Priorité :** FR d'abord (cible Afrique francophone)

### 12.2 Implémentation

- Fichiers i18n (Astro built-in)
- Détection navigateur + choix manuel
- URLs : `/fr/jobs`, `/en/jobs`

---

## 13. ROADMAP — 6 Semaines

### Pré-requis (AVANT Semaine 1)

- [ ] **Test latence Vapi** depuis Madagascar et Maroc — Si >500ms, envisager Voice AI async
- [ ] Acheter domaines (ambitia.io + ambitia.ai) — **François**

### Semaine 1 : Foundation

- [ ] Setup Supabase (projet, auth OAuth, tables de base)
- [ ] Setup GitHub repo + GitHub Pages + Actions CI
- [ ] Config Resend + Sentry
- [ ] Landing page + page postes (avec vidéo teaser)

### Semaine 2 : Auth & Candidature

- [ ] Système auth (OAuth Google/Apple + email)
- [ ] Profil candidat
- [ ] Formulaire candidature + questions knockout
- [ ] Upload CV (validation MIME, UUID rename)
- [ ] Dashboard candidat avec progress bar

### Semaine 3 : Tests

- [ ] Intégration Big Five (version courte)
- [ ] Formation produit + Quiz
- [ ] Scoring automatique Big Five
- [ ] Sauvegarde progression + retry 24h

### Semaine 4 : Voice AI & Admin

- [ ] Intégration Voice AI (Vapi/Bland)
- [ ] Interface roleplay candidat
- [ ] Dashboard admin basique
- [ ] Player audio + interface scoring

### Semaine 5 : Admin Avancé & Emails

- [ ] Emails transactionnels (Resend)
- [ ] Gestion pool + notifications
- [ ] Stats funnel
- [ ] Tests RLS automatisés

### Semaine 6 : Polish & Launch

- [ ] Tests end-to-end
- [ ] Mobile testing (responsive)
- [ ] Privacy Policy + CGU
- [ ] Sentry monitoring actif
- [ ] Soft launch avec premiers candidats

### Buffer : +2-3 semaines

**Réaliste :** 8-9 semaines avec imprévus.

---

## 14. DÉCISIONS POUR PLUS TARD

Ces éléments ne sont PAS dans le MVP :

| Feature | Quand | Notes |
|---------|-------|-------|
| Apple Sign-In | Phase 2 | Économise $99/an |
| WhatsApp Business API | Phase 2 | Notifications (Twilio/MessageBird, ~20 CHF/mois) |
| Analytics avancés | Après 100 candidats | |
| Dealbreakers automatiques | Après patterns identifiés | |
| ML scoring | Après 100+ data points | |
| Multi-entreprises | Phase 2 | |
| PWA installable | Phase 2 | +30% rétention mobile |
| TOTP 2FA | Phase 2 | Email code suffit pour MVP |

---

## 15. RISQUES & MITIGATIONS

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| RLS mal configuré | Moyenne | Critique | Tests RLS automatisés par Claude Code |
| Roleplay IA trop cher | Faible | Moyen | Funnel 3 étapes (Voice AI = dernière) |
| Peu de candidats | Moyenne | Élevé | 4 quadrants Hormozi, multicanal |
| Candidats abandonnent tests | Moyenne | Moyen | Tests courts, retry 24h, progress bar |
| GDPR plainte | Faible | Moyen | Privacy policy + DPA documentés |
| Uploads malveillants | Faible | Moyen | Validation MIME + UUID rename |

---

## 16. DÉFINITIONS

- **Setter** : Personne qui appelle les leads pour fixer des RDV
- **Closer** : Personne qui fait l'entretien de vente (Yasmine)
- **Lead** : Prospect ayant rempli un formulaire
- **RDV** : Rendez-vous téléphonique avec le closer
- **Scorecard** : Grille de critères pour évaluer un candidat
- **Roleplay** : Simulation de conversation téléphonique
- **RLS** : Row Level Security (sécurité niveau ligne PostgreSQL)
- **DPA** : Data Processing Agreement (contrat GDPR)
- **Pool** : Candidats qualifiés en attente d'un poste
- **COMPOUND** : Effet cumulatif (chaque action améliore le système)

---

## 17. FICHIERS ASSOCIÉS

| Fichier | Description |
|---------|-------------|
| `knowledge/SCORECARD-SETTER-ESSR.md` | Scorecard complète du Setter + **scénarios roleplay** |
| `knowledge/ESSR-FORMATIONS.md` | Knowledge base formations ESSR |
| `METHODOLOGY-AMBITIA.md` | Guide pour Claude Code (à créer) |

*Note : Les scénarios roleplay (personas, objections, critères) sont déjà documentés dans la Scorecard section "Roleplay IA — Scénarios de Test".*

---

*Document FINAL — Prêt pour review agents puis Claude Code.*
