# AMBITIA — Checklist de Tests Manuels

## 1. Authentification

- [ ] **Inscription email/password** — `/signup` → remplir le formulaire → email de confirmation reçu
- [ ] **Confirmation email** — cliquer le lien dans l'email → redirigé vers `/confirm-email`
- [ ] **Login email/password** — `/login` → connexion avec les identifiants
- [ ] **Login Google OAuth** — `/login` → bouton Google → redirection → connecté
- [ ] **Mot de passe oublié** — `/forgot-password` → email reçu → réinitialisation fonctionne
- [ ] **Déconnexion** — bouton déconnexion dans la navbar → redirigé vers `/`
- [ ] **Protection des routes** — accéder à `/dashboard` sans être connecté → redirigé vers `/login`
- [ ] **Protection admin** — accéder à `/admin` en tant que candidat → refusé/redirigé

## 2. Pages publiques

- [ ] **Accueil** — `/` → hero, sections, CTA fonctionnels
- [ ] **Postes** — `/jobs` → liste des postes avec drapeaux pays, salaires
- [ ] **Détail poste** — `/jobs/detail?id=XXX` → infos complètes, bouton "Postuler"
- [ ] **À propos** — `/about` → contenu affiché
- [ ] **Conditions** — `/terms` → contenu affiché
- [ ] **Confidentialité** — `/privacy` → contenu RGPD affiché
- [ ] **SEO** — Schema.org JSON-LD sur `/jobs/detail`, OG meta tags, sitemap.xml

## 3. Candidature

- [ ] **Postuler (nouveau candidat)** — `/apply?job=XXX` → remplir knockout questions + uploader CV PDF → candidature envoyée
- [ ] **Validation CV** — uploader un fichier non-PDF → message d'erreur
- [ ] **Validation taille** — uploader un fichier > 5 Mo → message d'erreur
- [ ] **Réutilisation CV** — postuler à un 2e poste → les CV existants apparaissent en radio buttons
- [ ] **Doublon candidature** — postuler 2x au même poste → message "déjà postulé"
- [ ] **Email confirmation candidature** — après soumission → email "application_received" reçu
- [ ] **Parsing CV (IA)** — après upload d'un nouveau CV → vérifier dans admin que les données parsées apparaissent (compétences, expérience, formation) — peut prendre quelques secondes

## 4. Dashboard candidat

- [ ] **Accès dashboard** — `/dashboard` → voir les candidatures en cours
- [ ] **CTAs selon statut** — boutons d'action appropriés selon le statut de la candidature
- [ ] **Lien profil** — accéder à `/profile` → modifier téléphone, pays, nom
- [ ] **Lien documents** — `/documents` → voir les CVs et vidéos uploadés
- [ ] **Suppression document** — supprimer un document → retiré du storage et de la DB

## 5. Tests candidat — Pipeline dynamique

- [ ] **Page tests** — `/tests?app=XXX` → les tests assignés au poste s'affichent (pas hardcodé)
- [ ] **Ordre des tests** — les tests apparaissent dans l'ordre `sort_order` de `job_tests`
- [ ] **Test Big Five (IPIP-NEO-120)** — `/test/bigfive?app=XXX` → consentement → 120 questions → résultats 5 dimensions /100
- [ ] **Test Intelligence (Sandia)** — `/test/intelligence?app=XXX` → matrices progressives → score correct/total
- [ ] **Test Quiz** — `/test/quiz?app=XXX` → questions → score %
- [ ] **Score composite** — après tous les tests auto → score composite calculé avec les poids dynamiques du poste

## 6. Roleplay vocal (Vapi)

- [ ] **Consentement** — modal de consentement vocal s'affiche au premier accès
- [ ] **Refuser consentement** — redirigé vers la page des tests
- [ ] **Scénario facile (Sophie)** — `/test/roleplay?app=XXX&scenario=easy` → appel démarre → IA parle français → timer tourne → indicateur "IA parle"
- [ ] **Scénario moyen (Marie)** — `/test/roleplay?app=XXX&scenario=medium` → objections de Marie → appel fonctionne
- [ ] **Raccrocher** — bouton "Raccrocher" → appel terminé → durée affichée → résultat sauvegardé
- [ ] **Permission micro** — le navigateur demande l'accès au micro → appel fonctionne si accepté
- [ ] **Erreur micro refusé** — refuser le micro → message d'erreur clair avec bouton "Réessayer"
- [ ] **Résultat sauvegardé** — après raccrocher → `test_results` contient roleplay_easy ou roleplay_medium

## 7. Présentation vidéo

- [ ] **Page vidéo** — `/test/video?app=XXX` → instructions + consentement
- [ ] **Enregistrement webcam** — onglet "Enregistrer" → démarrer → timer → arrêter → preview → valider
- [ ] **Upload fichier** — onglet "Importer" → uploader MP4/WebM (max 100 Mo) → barre de progression
- [ ] **Réutilisation vidéo** — si une vidéo existe déjà → option "Réutiliser" apparaît
- [ ] **Transcription (IA)** — après upload → vérifier dans admin que la transcription apparaît sous le lecteur vidéo (peut prendre 10-30s)
- [ ] **Résultat sauvegardé** — `test_results` contient video_presentation avec storage_path

## 8. Admin — Gestion des postes

- [ ] **Liste des postes** — `/admin/jobs` → tableau avec tous les postes
- [ ] **Créer un poste** — bouton "Nouveau poste" → modal → remplir → poste créé
- [ ] **Modifier un poste** — bouton "Modifier" → modal pré-rempli → sauvegarder
- [ ] **Supprimer un poste** — bouton "Supprimer" → confirmation → poste supprimé
- [ ] **Configurer tests** — bouton "Tests" sur un poste → modal avec checkboxes, poids, seuils, ordre → sauvegarder
- [ ] **Total des poids** — dans la modal tests → le total des poids s'affiche en temps réel
- [ ] **Profil personnalité** — bouton "Big Five" sur un poste → sliders min/max pour N/E/O/A/C → sauvegarder

## 9. Admin — Catalogue de tests

- [ ] **Liste des tests** — `/admin/tests` → 5 tests (big_five, intelligence, quiz, roleplay, video_presentation)
- [ ] **Modifier un test** — cliquer "Modifier" → changer label, description, durée, config JSON → sauvegarder
- [ ] **Activer/Désactiver** — toggle "Actif" → test désactivé n'apparaît plus dans le pipeline candidat

## 10. Admin — Candidats

- [ ] **Liste candidats** — `/admin/candidates` → tableau avec nom, email, poste, score, badges dimensions
- [ ] **Badges dimensions** — mini badges (BF, IQ, Q, V, RP) selon les tests complétés
- [ ] **Tri par score** — les candidats sont triés par score composite décroissant
- [ ] **Filtre par statut** — filtrer par pending/testing/review/interview/hired/rejected/pool
- [ ] **Détail candidat** — cliquer sur un candidat → page détail complète

## 11. Admin — Détail candidat

- [ ] **Infos profil** — nom, email, téléphone, pays, date inscription
- [ ] **Infos candidature** — poste, pays du poste, date, statut actuel
- [ ] **CV téléchargeable** — bouton "Télécharger le CV" → PDF s'ouvre dans un nouvel onglet
- [ ] **CV parsé (IA)** — si parsing fait → compétences en badges, expérience, formation, langues affichés
- [ ] **Réponses knockout** — disponibilité, internet, français, expérience appels
- [ ] **Résultats tests** — Big Five (5 dimensions /100), Intelligence (correct/total), Quiz (%), etc.
- [ ] **Score composite** — banner avec score /100, breakdown par test, verdict (Fast-track/Review/Rejeté)
- [ ] **Lecteur vidéo** — si vidéo uploadée → lecteur vidéo intégré avec la vidéo du candidat
- [ ] **Transcription vidéo** — texte de transcription sous le lecteur vidéo
- [ ] **Enregistrements roleplay** — audio/transcript des appels Vapi
- [ ] **Grille évaluation roleplay** — 6 critères dynamiques (Ouverture, Qualification, Objections, Closing, Ton, Écoute) → étoiles 1-5
- [ ] **Grille évaluation vidéo** — 5 critères (Présentation, Motivation, Expérience, Communication, Impression) → étoiles 1-5
- [ ] **Reset étoiles** — bouton ✕ pour remettre un critère à 0, "Tout réinitialiser" pour tout remettre
- [ ] **Sauvegarder évaluation** — score total/max + % calculé → sauvegardé dans `evaluations`
- [ ] **Multi-évaluateurs** — si plusieurs admins ont évalué → banner info affiché
- [ ] **Changer statut** — dropdown statut → sauvegarder → email envoyé au candidat
- [ ] **Notes internes** — textarea → sauvegarder → persiste au rechargement

## 12. Admin — Autres pages

- [ ] **Stats** — `/admin/stats` → graphiques Chart.js (funnel, doughnut, timeline)
- [ ] **Vivier** — `/admin/pool` → candidats au statut "pool"
- [ ] **Navigation** — sidebar avec liens : Dashboard, Postes, Tests, Vivier, Statistiques, Candidats

## 13. Emails

- [ ] **Welcome** — inscription → email de bienvenue reçu
- [ ] **Application received** — candidature → email de confirmation
- [ ] **Status interview** — admin change statut → "interview" → email reçu par candidat
- [ ] **Status hired** — admin change statut → "hired" → email reçu
- [ ] **Status rejected** — admin change statut → "rejected" → email reçu
- [ ] **Status pool** — admin change statut → "pool" → email reçu
- [ ] **Status review** — admin change statut → "review" → email reçu

## 14. Sécurité & RGPD

- [ ] **RLS candidats** — un candidat ne peut pas voir les données d'un autre candidat
- [ ] **RLS admin** — seuls les admins peuvent accéder aux pages admin et aux données admin
- [ ] **Consentement Big Five** — modal de consentement avant le test de personnalité
- [ ] **Consentement vidéo** — modal de consentement avant l'enregistrement vidéo
- [ ] **Consentement roleplay** — modal de consentement avant l'appel vocal
- [ ] **Pas de secrets dans le frontend** — vérifier que seules les variables `PUBLIC_*` sont utilisées côté client
- [ ] **ESSR incognito** — AUCUNE mention de ESSR, École de Santé, Secrétaire Médicale, FSM, François, Laura, Yasmine sur AUCUNE page publique

## 15. Mobile & Accessibilité

- [ ] **Responsive mobile** — toutes les pages sont lisibles sur mobile (320px - 768px)
- [ ] **Skip-to-content** — lien "Skip to content" visible au focus clavier
- [ ] **Navigation clavier** — tous les formulaires et boutons sont accessibles au clavier
- [ ] **aria-labels** — les icônes ont des `aria-hidden="true"`, les boutons ont des labels
- [ ] **role="alert"** — les messages d'erreur ont le rôle alert

## 16. Edge Functions

- [ ] **send-email** — déclenché automatiquement → emails reçus
- [ ] **create-vapi-call** — (backup server-side) appel Vapi créé correctement
- [ ] **vapi-webhook** — recordings/transcripts reçus après un appel
- [ ] **transcribe-video** — après upload vidéo → transcription apparaît (nécessite DEEPGRAM_API_KEY)
- [ ] **parse-cv** — après upload CV → données parsées apparaissent (nécessite OPENAI_API_KEY)

## Priorité de test

1. **CRITIQUE** : Auth (1), Candidature (3), Roleplay (6), Admin candidats (10-11)
2. **IMPORTANT** : Pipeline tests (5), Vidéo (7), Admin postes (8)
3. **SECONDAIRE** : Emails (13), Sécurité (14), Mobile (15)
4. **NICE-TO-HAVE** : Edge Functions AI (16), Catalogue tests (9), Stats (12)
