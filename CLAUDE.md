# CLAUDE.md — Instructions for Ralph / Claude Code

You are building **AMBITIA**, an AI-powered international recruitment platform.

## Your Mission This Iteration

1. Read `prd.json` to find the highest priority story where `passes: false`
2. Read `progress.txt` (check Codebase Patterns section first)
3. Implement ONLY that single story
4. Run quality checks: `npm run build`
5. If checks pass, commit ALL changes with message: `feat(STORY_ID): STORY_TITLE`
6. Update `prd.json` to set `passes: true` for the completed story
7. Append learnings to `progress.txt`
8. If ALL stories pass, output `<promise>COMPLETE</promise>`

## Key Reference Files

Read these BEFORE starting:
- `PLAN-AMBITIA-V3-FINAL.md` — Complete project specification
- `METHODOLOGY-AMBITIA.md` — Development guidelines
- `SCORECARD-SETTER-ESSR.md` — Setter job details and evaluation criteria
- `ESSR-FORMATIONS.md` — ESSR product knowledge base
- `progress.txt` — Learnings from previous iterations

## Tech Stack

| Component | Choice |
|-----------|--------|
| **Frontend** | Astro (static site generator) |
| **Styling** | Tailwind CSS + DaisyUI (custom 'ambitia' theme) |
| **Backend** | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| **Hosting** | GitHub Pages |
| **Voice AI** | Vapi (roleplay vocal) |
| **Emails** | Resend |
| **Monitoring** | Sentry |

## Environment

All credentials are in `.env` (already configured):
- `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
- `SUPABASE_SERVICE_ROLE_KEY` — Admin operations (Edge Functions only)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth (configured in Supabase dashboard)
- `RESEND_API_KEY` — Transactional emails
- `PUBLIC_SENTRY_DSN` — Error monitoring
- `PUBLIC_SITE_URL` — https://ambitia.io

## Critical Rules

### Security (NON-NEGOTIABLE)
- RLS (Row Level Security) on EVERY Supabase table
- Create RLS test file for each table in `tests/rls/`
- MIME validation for uploads in Edge Functions
- No secrets in frontend code — only `PUBLIC_*` variables in client code
- `SUPABASE_SERVICE_ROLE_KEY` only in Edge Functions, never in frontend

### Database — Multi-Country Jobs
- The `jobs` table has per-country rows: same title, different country/salary/currency
- Fields: `country` (ISO code), `salary_amount` (numeric), `salary_currency` (code), `salary_label` (display text)
- Example: Setter ESSR exists as 2 rows — one for MG (Madagascar), one for MA (Morocco)

### Design
- Mobile-first (users are on phones in Africa)
- Theme: primary #2D5BFF, secondary #6C5CE7, accent #00D9A3, neutral #1A1D29
- Font: Inter (Google Fonts)
- French is primary language

### GDPR
- Consent modal BEFORE Big Five test
- Consent modal BEFORE voice recording
- Data retention: 3 years active, 2 years rejected, 6 months pool

## Quality Checks

Run before committing:
```bash
npm run build
```

## Progress Report Format

APPEND to progress.txt (never replace, always append):
```
## [Date] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---
```

## Consolidate Patterns

If you discover a **reusable pattern**, add it to the `## Codebase Patterns` section at the TOP of progress.txt:
```
## Codebase Patterns
- Pattern description here
```

Only add patterns that are **general and reusable**, not story-specific details.

## Story Size

Each story should be completable in ONE context window. If a story seems too big:
1. Complete as much as you can
2. Note what's left in progress.txt
3. Mark story as `passes: true` if core functionality works

## Stop Condition

When ALL stories in `prd.json` have `passes: true`, output:
```
<promise>COMPLETE</promise>
```
