# ⚽ Parzi Manage

**Le copilote IA des agents de football.**
Joueurs, mandats, clubs, scouting, veille mercato : Parzi Manage centralise tout — et son assistant IA prépare chaque journée de l'agent.

🌍 **Production : https://parzi-manage-parzi2.vercel.app**

## Modules

| Module | Description |
|---|---|
| Dashboard | KPI, alertes, opportunités, tâches, agenda + **Brief IA du jour** (généré automatiquement chaque matin) |
| Assistant ✦ | Copilote conversationnel connecté aux données de l'agent (jamais celles des autres) |
| Joueurs | Portefeuille complet (contrats, mandats, salaires, notes) + **Dossier joueur PDF** avec argumentaire rédigé par l'IA |
| Clubs | Réseau de clubs : besoins, budgets, contacts |
| Scouting | Cibles suivies avant mandat, filtres poste/âge |
| CRM | Contacts du réseau (DS, avocats, scouts, sponsors) |
| Veille 📡 | Actus foot en direct (RSS), badges « ton portefeuille dans l'actu » |
| Calendrier | Rendez-vous, matchs, échéances |

## Stack

- **Next.js 16** (App Router, Server Actions) · TypeScript · Tailwind v4
- **Données** : double mode — `DATABASE_URL` définie → **PostgreSQL/Supabase** (production, cloisonnement par `user_id`) ; sinon **SQLite** locale via `node:sqlite` (dev, zéro config, seed automatique)
- **Auth** : Supabase Auth (API REST GoTrue, cookies httpOnly + refresh)
- **IA** : API Anthropic (`claude-sonnet-5`) — assistant, brief quotidien, argumentaires
- **Hébergement** : Vercel (déploiement auto sur push, cron quotidien des briefs à 6h UTC)

## Développement local

```bash
npm install
npm run dev        # SQLite + données de démo, aucune config requise
```

Mode production locale (Supabase + IA) : copier `.env.example` → `.env.local` et renseigner les variables.

## Variables d'environnement (production)

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Chaîne Postgres (pooler Supabase, port 6543) |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Clé publique Supabase (auth) |
| `ANTHROPIC_API_KEY` | Clé API Anthropic (fonctions IA) |
| `CRON_SECRET` | *(optionnel)* protège `/api/cron/briefs` |

## Base de données

Les migrations SQL sont dans [`supabase/`](supabase/) (001 → 006), à exécuter dans l'ordre via le SQL Editor de Supabase. Row Level Security activée sur toutes les tables ; l'isolation par agent est appliquée dans la couche de requêtes (`src/lib/queries.ts`).

## Tests

```bash
npx playwright test   # smoke tests e2e (build + parcours clés)
```

Le CI GitHub Actions exécute build + tests à chaque push sur `main`.

---

© 2026 Parzi Manage — Tous droits réservés. Projet en bêta privée.
