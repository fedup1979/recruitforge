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

---

## Priorité moyenne

### Rate limiting Edge Functions
- Les Edge Functions Supabase (send-email, create-vapi-call) n'ont pas de rate limiting
- Risque : abus possible sur les endpoints publics
- Solution : ajouter un rate limiter via Redis ou un compteur Supabase

### Vrais graphiques Chart.js dans admin/stats
- Les stats admin utilisent actuellement des divs HTML pour les barres de progression
- Remplacer par des vrais graphiques Chart.js ou Recharts pour un meilleur rendu
- Pages concernées : `/admin/stats`

### Tests automatisés
- Aucun test unitaire ou E2E actuellement
- Priorité : tests RLS Supabase (`tests/rls/`), tests E2E critiques (inscription, candidature, tests)
- Outils suggérés : Vitest (unit), Playwright (E2E)

---

## Priorité basse

### Optimisation images / assets
- Ajouter un vrai logo AMBITIA (SVG) au lieu du favicon par défaut
- Optimiser les images si ajoutées (astro:image)

### PWA / Offline
- Les candidats sont souvent sur mobile avec connexion instable
- Ajouter un service worker basique pour le offline
- Pas critique pour le MVP

### Accessibilité (a11y)
- Audit WCAG à faire
- Vérifier les contrastes, les labels ARIA, la navigation clavier

### SEO avancé
- Sitemap.xml
- Schema.org JobPosting structured data sur les pages d'offres
- Open Graph images personnalisées
