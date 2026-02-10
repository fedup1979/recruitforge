# AMBITIA — Dette Technique

Éléments reportés pour de futures sessions. Classés par priorité.

---

## Priorité haute

### i18n FR/EN
- Le site est actuellement 100% français (sauf la privacy policy qui a une section EN)
- Implémenter un vrai système i18n : routing `/fr/`, `/en/` ou switcher client-side
- Bibliothèque suggérée : `astro-i18n` ou solution custom avec JSON de traductions
- Pages à traduire : toutes (navbar, footer, homepage, about, jobs, dashboard, tests, admin)

---

## Priorité moyenne

### Tests E2E (Playwright)
- Tests unitaires en place (63 tests Vitest)
- Besoin de tests E2E pour les parcours critiques (inscription, candidature, tests)
- Playwright configuré, tests de base à étoffer

---

## Priorité basse

### Optimisation images / assets
- Optimiser les images si ajoutées (astro:image)

### PWA / Offline
- Les candidats sont souvent sur mobile avec connexion instable
- Ajouter un service worker basique pour le offline
- Pas critique pour le MVP

### Audit WCAG complet
- Bases d'accessibilité en place (landmarks, aria-labels, skip-to-content, role="alert")
- Reste : audit contrastes, navigation clavier complète, lecteur d'écran

---

## Future Features (notées par François)

### Vrai Big Five
- Actuel : TIPI-10 (démo). Besoin : scores /100, noms complets des dimensions, sous-dimensions

### Présentation vidéo
- Grille d'évaluation admin avec inter-rater agreement

### Matrices de Raven (QI)
- Test démo pour un poste différent (pas Setter)

### Pipeline Setter affiné
- login → CV → expérience → vidéo (éval manuelle) → roleplay (shortlisted only)

---

## Résolu

- ~~Vérification domaine Resend~~ → ambitia.io vérifié (DKIM, SPF, MX)
- ~~Déployer Edge Functions~~ → 3 fonctions ACTIVE (send-email, create-vapi-call, vapi-webhook)
- ~~Rate limiting Edge Functions~~ → In-memory rate limiter (send-email: 20/min, create-vapi-call: 5/min)
- ~~Tests automatisés (unitaires)~~ → 63 tests Vitest (scoring, quiz, countries, status)
- ~~Accessibilité de base~~ → Skip-to-content, landmarks, aria-labels, role="alert"
- ~~Vrais graphiques Chart.js~~ → Funnel bar, doughnut, timeline avec Chart.js 4.4
- ~~Schema.org JobPosting~~ → JSON-LD sur /jobs/detail
- ~~Open Graph meta tags~~ → og:url, og:site_name, canonical URL
- ~~Sitemap.xml~~ → @astrojs/sitemap configuré
- ~~Favicon custom~~ → SVG AMBITIA branded
