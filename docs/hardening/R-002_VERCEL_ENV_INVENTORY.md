# R-002 — Inventaire des variables Vercel

- Date du contrôle : 22 juillet 2026
- Compte Vercel : `parzival952`
- Équipe : `parzi2` (`parzimanage`)
- Projet : `parzi-manage`
- Méthode : Vercel CLI, métadonnées uniquement
- Valeurs consultées ou exportées : **aucune**

## Variables configurées

| Nom | Type Vercel | Production | Preview | Development |
|---|---|:---:|:---:|:---:|
| `ANTHROPIC_API_KEY` | sensible | oui | oui | non |
| `DATABASE_URL` | sensible | oui | oui | non |
| `FOOTBALL_DATA_KEY` | sensible | oui | oui | non |
| `RESEND_API_KEY` | sensible | oui | oui | non |
| `SUPABASE_ANON_KEY` | sensible | oui | oui | non |
| `SUPABASE_URL` | sensible | oui | oui | non |

Total : **6 variables**, toutes marquées sensibles.

## Écarts observés

Chaque variable est définie par une configuration unique ciblant simultanément `production` et `preview`. Les previews utilisent donc la même configuration que la production pour la base de données et les fournisseurs externes.

Ce partage doit être supprimé avant le pilote :

- une `DATABASE_URL` dédiée et à privilèges minimaux doit être utilisée en preview dans R-005 ;
- les clés de fournisseurs doivent être isolées ou limitées pour éviter qu'une preview consomme les quotas de production ;
- aucune variable n'est actuellement affectée à `development`.

## Noms utilisés par le code mais absents de Vercel

- `ADMIN_EMAILS`
- `CRON_SECRET`
- `EMAIL_FROM`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `PARZI_AI_MODEL`

Cette liste ne signifie pas que chaque variable est immédiatement obligatoire : certaines fonctionnalités peuvent avoir un fallback ou rester désactivées. En revanche, l'absence de `CRON_SECRET` confirme le bloqueur traité par R-011.

## Autres observations

- Le projet Vercel indique actuellement Node.js `24.x`, tandis que `package.json` et la CI demandent Node.js `22.x`.
- Aucun fichier `.env` contenant des valeurs n'a été créé.
- La liaison locale `.vercel/project.json` est ignorée par Git.

## Décision

Le critère R-002 « noms des variables Vercel vérifiés par environnement » est **VALIDÉ**. Les écarts relevés deviennent des entrées de remédiation pour la vague V1 ; aucune valeur ni configuration distante n'a été modifiée pendant cet inventaire.
