# PROMPT POUR CLAUDE CODE

Copie-colle ce prompt quand tu lances Claude Code dans le dossier RecruitForge.

---

## 🚀 LE PROMPT

```
Tu es le développeur principal du projet AMBITIA, une plateforme de recrutement AI-powered.

**Avant toute chose, lis ces fichiers dans l'ordre :**
1. PLAN-AMBITIA-V3-FINAL.md — Le plan complet du projet
2. METHODOLOGY-AMBITIA.md — Comment travailler
3. SCORECARD-SETTER-ESSR.md — Le premier poste à créer

**Stack :**
- Frontend : Astro + DaisyUI
- Backend : Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- Hébergement : GitHub Pages
- Voice AI : Vapi
- Emails : Resend
- Monitoring : Sentry

**Ta mission maintenant :**
Commence par la Semaine 1 — Foundation :
1. Initialiser le projet Astro
2. Créer la structure de base
3. Configurer DaisyUI avec le theme AMBITIA
4. Créer la landing page avec le bon branding

Travaille feature par feature. Montre-moi ce que tu fais à chaque étape.

**Règles importantes :**
- Mobile first (teste sur petit écran)
- RLS obligatoire sur toutes les tables
- Pas de secrets dans le frontend
- Commit après chaque feature fonctionnelle

Go !
```

---

## 📁 FICHIERS À METTRE DANS LE DOSSIER

Copie ces fichiers depuis ton serveur OpenClaw (`/root/.openclaw/workspace/`) vers ton dossier `RecruitForge` :

| Fichier | Chemin source |
|---------|---------------|
| `PLAN-AMBITIA-V3-FINAL.md` | `/root/.openclaw/workspace/PLAN-AMBITIA-V3-FINAL.md` |
| `METHODOLOGY-AMBITIA.md` | `/root/.openclaw/workspace/METHODOLOGY-AMBITIA.md` |
| `SCORECARD-SETTER-ESSR.md` | `/root/.openclaw/workspace/knowledge/SCORECARD-SETTER-ESSR.md` |
| `ESSR-FORMATIONS.md` | `/root/.openclaw/workspace/knowledge/ESSR-FORMATIONS.md` |

---

## 🖥️ COMMANDES WINDOWS

### 1. Créer le dossier
```powershell
mkdir "$env:USERPROFILE\Desktop\RecruitForge"
cd "$env:USERPROFILE\Desktop\RecruitForge"
```

### 2. Installer Claude Code (si pas fait)
```powershell
npm install -g @anthropic-ai/claude-code
```

### 3. Lancer Claude Code
```powershell
claude
```

### 4. Coller le prompt ci-dessus

---

## ⚠️ PRÉ-REQUIS

Avant de lancer :
- [ ] Node.js installé (v18+)
- [ ] npm fonctionnel
- [ ] Compte Anthropic avec API key configurée
- [ ] Les 4 fichiers copiés dans le dossier

---

## 🔄 APRÈS LE LANCEMENT

Claude Code va :
1. Lire les fichiers
2. Initialiser le projet Astro
3. Te montrer sa progression
4. Te demander validation aux étapes clés

**Tu peux lui dire :**
- "Continue" — pour avancer
- "Montre-moi le code de X" — pour inspecter
- "Teste sur mobile" — pour vérifier responsive
- "Commit et push" — pour sauvegarder

---

*Bonne chance !* 🚀
