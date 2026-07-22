# R-002 / R-003 — Preuve de restauration hors production

- Date du test : 22 juillet 2026
- Opérateur : Codex, sous le contrôle du propriétaire du dépôt
- Environnement : PostgreSQL 17.10 local temporaire
- Exposition réseau : aucune (`listen_addresses` vide)
- Port local : `55432`

## Périmètre

Le test couvre deux objectifs :

- reconstruire une base vide uniquement depuis les migrations GitHub `001 → 013` ;
- restaurer la sauvegarde de données locale sans l'ajouter au dépôt ni afficher de donnée personnelle.

La sauvegarde est restée à son emplacement local d'origine. Seuls son nom, sa taille, son empreinte et des agrégats anonymes sont consignés.

## Source de restauration

- Fichier local : `parzi_backup_2026-07-22.sql`
- Type : SQL de données uniquement
- Taille inventoriée : 20 182 octets
- SHA-256 : `96d3030f7486883932bee5f8fb77e9f636867f437d323413efac2b2837ea05e8`
- Classification : **CONFIDENTIEL — interdit de commit**

## Résultats

| Contrôle | Résultat |
|---|---|
| Initialisation d'une base PostgreSQL vide | Réussie |
| Application séquentielle des migrations `001 → 013` | Réussie, sans erreur |
| Import SQL avec arrêt à la première erreur | Réussi |
| Transaction de sauvegarde | Terminée sans erreur |
| Tables publiques après reconstruction | 15 |
| Clés primaires | 15 |
| Séquences `nextval` à recalibrer | 0 |
| Total de lignes restaurées | 61 |
| Seconde reconstruction indépendante | Réussie |
| Durée de la seconde reconstruction et restauration | 1 seconde, serveur local déjà initialisé |

## Comparaison des agrégats

| Table | Inventaire source | Après restauration | Écart |
|---|---:|---:|---:|
| `academy_done` | 3 | 3 | 0 |
| `academy_progress` | 1 | 1 | 0 |
| `ai_messages` | 2 | 2 | 0 |
| `alerts` | 4 | 4 | 0 |
| `contacts` | 4 | 4 | 0 |
| `daily_briefs` | 6 | 6 | 0 |
| `events` | 4 | 4 | 0 |
| `opportunities` | 4 | 4 | 0 |
| `players` | 6 | 6 | 0 |
| `profiles` | 2 | 2 | 0 |
| `prospects` | 1 | 1 | 0 |
| `recommendations` | 15 | 15 | 0 |
| `tasks` | 9 | 9 | 0 |
| **Total** | **61** | **61** | **0** |

Les tables `clubs` et `certifications`, créées par les migrations mais absentes de l'export de données, sont présentes et vides après restauration.

## Limites

- La sauvegarde ne contient pas les utilisateurs Supabase Auth ; aucun test de connexion utilisateur n'est donc possible avec cet export.
- Le test ne valide pas l'existence d'une sauvegarde automatique Supabase, absente du plan Free observé.
- Les noms des variables Vercel par environnement restent à inventorier.
- Aucun appel à Supabase et aucune mutation de production n'ont été effectués.

## Décision

- Le volet restauration hors production de R-002 est **VALIDÉ**.
- La reproductibilité du schéma demandée par R-003 est **VALIDÉE**.
- R-002 est globalement **VALIDÉ AVEC LIMITES** après l'inventaire Vercel consigné dans `docs/hardening/R-002_VERCEL_ENV_INVENTORY.md`.
