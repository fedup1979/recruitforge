# METHODOLOGY-AMBITIA.md — Guide Claude Code

*Comment travailler sur le projet AMBITIA*

---

## 🎯 CONTEXTE

**AMBITIA** = Plateforme de recrutement international AI-powered.
**Premier use case** = Recruter un Setter pour ESSR (école santé suisse).

Tu construis un MVP en 6 semaines.

---

## 📁 FICHIERS DE RÉFÉRENCE

| Fichier | Description | Priorité |
|---------|-------------|----------|
| `PLAN-AMBITIA-V3-FINAL.md` | **LE PLAN COMPLET** — Architecture, features, roadmap | 🔴 CRITIQUE |
| `SCORECARD-SETTER-ESSR.md` | Scorecard du Setter + scénarios roleplay | 🟡 Important |
| `ESSR-FORMATIONS.md` | Knowledge base formations ESSR | 🟢 Référence |

**Règle absolue : Lis `PLAN-AMBITIA-V3-FINAL.md` EN ENTIER avant de coder.**

---

## 🛠️ STACK TECHNIQUE

| Composant | Choix | Notes |
|-----------|-------|-------|
| Frontend | **Astro** | SSG, islands architecture |
| Backend | **Supabase** | Auth + PostgreSQL + Storage + Edge Functions |
| Hébergement | **GitHub Pages** | Gratuit, CI via GitHub Actions |
| Design | **DaisyUI** | Composants Tailwind, copy-paste |
| Voice AI | **Vapi** | Roleplay téléphonique |
| Emails | **Resend** | Free tier |
| Monitoring | **Sentry** | Free tier |

---

## 🔒 SÉCURITÉ — OBLIGATOIRE

### Row Level Security (RLS)

**CHAQUE table PostgreSQL DOIT avoir des policies RLS.**

Avant de créer une table :
1. Définir qui peut lire/écrire
2. Écrire les policies
3. Écrire les TESTS RLS
4. Tester AVANT de merge

**Template test RLS :**
```sql
-- tests/rls/[table].test.sql
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-123", "role": "candidate"}';

-- Test : Un candidat ne peut PAS voir les autres candidatures
SELECT count(*) FROM applications WHERE user_id != 'user-123';
-- Attendu : 0

ROLLBACK;
```

### Storage RLS

```sql
-- Candidat voit uniquement ses fichiers
CREATE POLICY "candidate_own_files" ON storage.objects
FOR ALL USING (
  bucket_id = 'candidates' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Uploads

- Validation MIME dans **Edge Function** (magic bytes, pas extension)
- Rename en UUID
- Signed URLs (expiration 1h)

---

## 📋 WORKFLOW PAR FEATURE

### Avant de coder une feature :

1. **Lire** la section correspondante dans le PLAN
2. **Identifier** les tables/policies/components nécessaires
3. **Écrire** les tests RLS d'abord
4. **Coder** la feature
5. **Tester** localement
6. **Commit** avec message clair

### Ordre des features (Semaine par semaine)

**Semaine 1 : Foundation**
- [ ] Init projet Astro
- [ ] Setup Supabase (projet, auth, tables base)
- [ ] Config GitHub Pages + Actions
- [ ] Landing page
- [ ] Page liste postes

**Semaine 2 : Auth & Candidature**
- [ ] Auth (Google OAuth + Email)
- [ ] Profil candidat
- [ ] Formulaire candidature
- [ ] Upload CV (validation MIME, UUID)
- [ ] Dashboard candidat + progress bar

**Semaine 3 : Tests**
- [ ] Big Five (version courte)
- [ ] Quiz formation produit
- [ ] Scoring automatique
- [ ] Sauvegarde progression + retry 24h

**Semaine 4 : Voice AI & Admin**
- [ ] Intégration Vapi
- [ ] Interface roleplay candidat
- [ ] Dashboard admin
- [ ] Player audio + scoring

**Semaine 5 : Admin Avancé**
- [ ] Emails transactionnels (Resend)
- [ ] Gestion pool
- [ ] Stats funnel
- [ ] Tests RLS complets

**Semaine 6 : Polish**
- [ ] Tests E2E
- [ ] Mobile responsive
- [ ] Privacy Policy + CGU
- [ ] Sentry actif
- [ ] Soft launch

---

## 🗄️ SCHEMA DATABASE (Base)

```sql
-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs (postes ouverts)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  salary_info TEXT,
  contract_type TEXT DEFAULT 'freelance',
  location TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed')),
  test_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications (candidatures)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'testing', 'review', 'interview', 'hired', 'rejected', 'pool')),
  knockout_answers JSONB,
  cv_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Test Results
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  test_type TEXT NOT NULL,
  answers JSONB,
  score NUMERIC,
  audio_url TEXT,
  transcript TEXT,
  human_score JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consents (GDPR)
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);
```

---

## 🎨 DESIGN SYSTEM

**Couleurs :**
- Primary : `#2D5BFF` (Electric Blue)
- Secondary : `#6C5CE7` (Soft Purple)
- Success : `#00D9A3` (Mint Green)
- Background dark : `#1A1D29` (Deep Space)

**Typographie :** Inter (Google Fonts)

**DaisyUI theme :** Créer theme custom `ambitia`

```js
// tailwind.config.js
daisyui: {
  themes: [{
    ambitia: {
      "primary": "#2D5BFF",
      "secondary": "#6C5CE7", 
      "accent": "#00D9A3",
      "neutral": "#1A1D29",
      "base-100": "#ffffff",
    }
  }]
}
```

---

## 📱 MOBILE FIRST

**Tester sur mobile dès le début** — pas juste à la fin.

- Breakpoints : Mobile (< 768px) → Tablet → Desktop
- Touch targets : min 44px
- Forms : input type approprié (tel, email)
- Progress bar visible sur mobile

---

## 🚨 RED FLAGS — Ne PAS faire

1. ❌ Table sans RLS policies
2. ❌ Upload sans validation MIME côté serveur
3. ❌ Secrets dans le frontend
4. ❌ Merge sans tester
5. ❌ Skip les consentements GDPR
6. ❌ Hardcoder des IDs ou URLs

---

## ✅ DEFINITION OF DONE

Une feature est terminée quand :
- [ ] Code fonctionnel
- [ ] Tests RLS passent
- [ ] Mobile responsive
- [ ] Pas d'erreurs console
- [ ] Commit message clair
- [ ] Documenté si complexe

---

## 🆘 EN CAS DE BLOCAGE

1. Relire le PLAN section concernée
2. Simplifier l'approche
3. Faire une version minimale qui marche
4. Itérer ensuite

**COMPOUND > PERFECTION** — Mieux vaut shipper simple que ne pas shipper du tout.

---

*Bonne chance ! Ship it.* 🚀
