# AMBITIA

Plateforme de recrutement international AI-powered pour ESSR (European School of Health Sciences).

**Site:** [https://ambitia.io](https://ambitia.io)

## Tech Stack

| Composant | Technologie |
|-----------|-------------|
| Frontend | Astro (static site generator) |
| Styling | Tailwind CSS v4 + DaisyUI 5 |
| Backend | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| Hosting | GitHub Pages |
| Voice AI | Vapi (roleplay vocal) |
| Emails | Resend |
| Monitoring | Sentry |

## Installation

### Prerequis

- Node.js 22+ (`node --version`)
- npm 10+ (`npm --version`)
- Git

### Setup

```bash
# Cloner le repo
git clone https://github.com/fedup1979/recruitforge.git
cd recruitforge

# Installer les dependances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos valeurs (voir section Configuration ci-dessous)
```

### Configuration

Creer un fichier `.env` a partir de `.env.example` et renseigner:

| Variable | Description |
|----------|-------------|
| `PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | Cle anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle service role (Edge Functions uniquement) |
| `GOOGLE_CLIENT_ID` | OAuth Google (configure dans Supabase dashboard) |
| `GOOGLE_CLIENT_SECRET` | Secret OAuth Google |
| `VAPI_API_KEY` | Cle API Vapi pour le roleplay vocal |
| `RESEND_API_KEY` | Cle API Resend pour les emails transactionnels |
| `PUBLIC_SENTRY_DSN` | DSN Sentry pour le monitoring |
| `PUBLIC_SITE_URL` | URL du site (`https://ambitia.io`) |

### Supabase

1. Creer un projet sur [supabase.com](https://supabase.com)
2. Activer Google OAuth dans Authentication > Providers
3. Executer les migrations SQL dans `supabase/migrations/` (dans l'ordre numerique)
4. Configurer le bucket Storage `candidates` pour les CVs

### Developpement

```bash
# Serveur de dev
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

### Deploiement

Le deploiement se fait automatiquement via GitHub Actions sur push a `main`:

1. Le workflow `.github/workflows/deploy.yml` build le projet
2. Le site statique est deploye sur GitHub Pages
3. Le domaine custom `ambitia.io` est configure via le fichier `public/CNAME`

**Secrets GitHub requis** (Settings > Secrets and variables > Actions):
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_SENTRY_DSN`

## Structure du projet

```
src/
  components/     # Composants Astro reutilisables
  data/           # Donnees statiques (jobs mock)
  layouts/        # BaseLayout, AdminLayout
  lib/            # Supabase client
  pages/          # Routes Astro
    admin/        # Pages admin (candidats, postes, vivier, stats)
    apply/        # Formulaire de candidature
    jobs/         # Liste et detail des postes
    test/         # Tests candidats (Big Five, Quiz, Roleplay)
  styles/         # CSS global + theme DaisyUI
supabase/
  functions/      # Edge Functions (emails, Vapi)
  migrations/     # Migrations SQL
tests/
  rls/            # Tests RLS par table
public/
  CNAME           # Domaine custom GitHub Pages
```

## Pages principales

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/jobs` | Liste des postes |
| `/jobs/[id]` | Detail d'un poste |
| `/about` | A propos |
| `/login` | Connexion |
| `/signup` | Inscription |
| `/dashboard` | Tableau de bord candidat |
| `/profile` | Profil candidat |
| `/apply/[id]` | Candidature |
| `/tests` | Tests requis |
| `/test/bigfive` | Test Big Five |
| `/test/quiz` | Quiz produit |
| `/test/roleplay` | Roleplay vocal |
| `/admin` | Dashboard admin |
| `/admin/candidates` | Gestion candidats (table + kanban) |
| `/admin/jobs` | Gestion postes |
| `/admin/pool` | Vivier de candidats |
| `/admin/stats` | Statistiques funnel |
| `/privacy` | Politique de confidentialite |
| `/terms` | CGU |

## RALPH (Build Automatique)

RALPH est la methodologie de build autonome utilisee pour construire AMBITIA:

```bash
# Lancer RALPH (Git Bash)
chmod +x ralph.sh
./ralph.sh 50
```

Voir `CLAUDE.md` pour les instructions detaillees.

## Equipe

- **Francois Dupuis** - Fondateur
- **Laura Escariz** - Co-fondatrice
