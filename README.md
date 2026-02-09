# AMBITIA - Setup RALPH

## 📁 Contenu du dossier

| Fichier | Description |
|---------|-------------|
| `prd.json` | 40 user stories pour construire AMBITIA |
| `progress.txt` | Journal des learnings (append-only) |
| `CLAUDE.md` | Instructions pour Claude Code |
| `PLAN-AMBITIA-V3-FINAL.md` | Plan complet du projet |
| `METHODOLOGY-AMBITIA.md` | Guide de développement |
| `SCORECARD-SETTER-ESSR.md` | Scorecard du Setter |
| `ESSR-FORMATIONS.md` | Knowledge base ESSR |

## 🚀 Installation

### 1. Prérequis

```powershell
# Node.js 18+ requis
node --version

# Installer Claude Code
npm install -g @anthropic-ai/claude-code

# Installer jq (pour RALPH)
# Sur Windows avec Chocolatey:
choco install jq

# Ou télécharger manuellement: https://jqlang.github.io/jq/download/
```

### 2. Cloner RALPH

```powershell
# Dans ton dossier RecruitForge
git clone https://github.com/snarktank/ralph.git ralph-scripts
```

### 3. Copier le script RALPH

```powershell
# Copier ralph.sh dans ton projet
copy ralph-scripts\ralph.sh .
```

### 4. Structure finale

```
RecruitForge/
├── prd.json              # ✅ Tes 40 stories
├── progress.txt          # ✅ Journal
├── CLAUDE.md             # ✅ Instructions Claude
├── ralph.sh              # Script RALPH
├── PLAN-AMBITIA-V3-FINAL.md
├── METHODOLOGY-AMBITIA.md
├── SCORECARD-SETTER-ESSR.md
└── ESSR-FORMATIONS.md
```

## ▶️ Lancement

### Option A: RALPH automatique (recommandé)

```bash
# Git Bash ou WSL
chmod +x ralph.sh
./ralph.sh --tool claude 50
```

Cela va:
1. Créer une branche `feature/ambitia-mvp`
2. Lancer Claude Code pour la première story
3. Commit si tests passent
4. Recommencer jusqu'à ce que tout soit fait (max 50 itérations)

### Option B: Manuel (une story à la fois)

```powershell
# Lancer Claude Code
claude

# Puis coller:
Lis CLAUDE.md et prd.json. Implémente la prochaine story non complétée.
```

## 📊 Suivre la progression

```bash
# Voir les stories complétées
cat prd.json | jq '.userStories[] | select(.passes == true) | .title'

# Voir les stories restantes  
cat prd.json | jq '.userStories[] | select(.passes == false) | .title'

# Voir les learnings
cat progress.txt
```

## ⚙️ Configuration Supabase (manuel)

Avant de lancer, tu dois:

1. **Créer un projet Supabase** sur https://supabase.com
2. **Activer Google OAuth** dans Authentication > Providers
3. **Noter les clés**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. **Créer `.env`**:
```
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

## 🆘 En cas de problème

- Claude Code se perd → Arrête, lis `progress.txt`, relance
- Story trop grosse → Claude la marquera comme done et notera ce qui reste
- Build échoue → Claude ne committera pas, réessaie

## 📞 Support

Contacte Nigel (moi) via Telegram si blocage!
