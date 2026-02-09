# AMBITIA — Dette Technique

Éléments reportés pour de futures sessions. Classés par priorité.

---

## Priorité haute

### i18n FR/EN
- Le site est actuellement 100% français (sauf la privacy policy qui a une section EN)
- Implémenter un vrai système i18n : routing `/fr/`, `/en/` ou switcher client-side
- Bibliothèque suggérée : `astro-i18n` ou solution custom avec JSON de traductions
- Pages à traduire : toutes (navbar, footer, homepage, about, jobs, dashboard, tests, admin)

### Vérification domaine email Resend
- Le domaine `ambitia.io` doit être vérifié dans le dashboard Resend pour que les emails transactionnels arrivent (pas en spam)
- Configuration DNS requise : SPF, DKIM, DMARC
- Action : Resend Dashboard > Domains > Add domain > Copier les records DNS > Ajouter dans GoDaddy
- **NOTE** : Les templates email sont prêts (welcome, application_received, status_*, test_reminder, roleplay_invitation)

### Déployer les Edge Functions sur Supabase
- 3 Edge Functions prêtes dans le repo : `send-email`, `create-vapi-call`, `vapi-webhook`
- À déployer via : `supabase functions deploy send-email` (etc.) ou depuis le dashboard Supabase
- Le webhook Vapi doit être configuré dans le dashboard Vapi : URL = `https://gdvdvjymkakuoepyhajk.supabase.co/functions/v1/vapi-webhook`

---

## Priorité moyenne

### Rate limiting Edge Functions
- Les Edge Functions Supabase (send-email, create-vapi-call) n'ont pas de rate limiting
- Risque : abus possible sur les endpoints publics
- Solution : ajouter un rate limiter via Redis ou un compteur Supabase

### Tests automatisés
- Aucun test unitaire ou E2E actuellement
- Priorité : tests RLS Supabase (`tests/rls/`), tests E2E critiques (inscription, candidature, tests)
- Outils suggérés : Vitest (unit), Playwright (E2E)

---

## Priorité basse

### Optimisation images / assets
- Optimiser les images si ajoutées (astro:image)

### PWA / Offline
- Les candidats sont souvent sur mobile avec connexion instable
- Ajouter un service worker basique pour le offline
- Pas critique pour le MVP

### Accessibilité (a11y)
- Audit WCAG à faire
- Vérifier les contrastes, les labels ARIA, la navigation clavier

---

## Résolu (cette session)

- ~~Vrais graphiques Chart.js dans admin/stats~~ → Funnel bar, doughnut, timeline line chart avec Chart.js 4.4
- ~~Schema.org JobPosting structured data~~ → JSON-LD injecté sur /jobs/detail
- ~~Open Graph meta tags~~ → og:url, og:site_name, canonical URL dans BaseLayout
- ~~Sitemap.xml~~ → @astrojs/sitemap configuré
- ~~Favicon custom~~ → SVG AMBITIA branded
