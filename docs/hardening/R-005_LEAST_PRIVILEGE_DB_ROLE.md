# R-005 — Rôle PostgreSQL serveur à privilèges minimaux

- Statut : **PRÉPARÉ — NON EXÉCUTÉ**
- Branche : `hardening/tome-lxxvii-v0`
- Base Supabase : aucune modification effectuée
- Variables Vercel : aucune modification effectuée

## Objectif

Remplacer la connexion PostgreSQL privilégiée utilisée par le serveur par deux identités séparées :

- `parzi_app_preview` pour les déploiements de preview ;
- `parzi_app_production` pour la production.

Les deux identités héritent des permissions DML du groupe sans connexion `parzi_app_runtime`. Le fichier `supabase/migration-014-runtime-role.sql` crée ces rôles en mode `NOLOGIN` : aucun accès n'est possible avant l'étape opérationnelle autorisée.

## Audit des accès applicatifs

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|:---:|:---:|:---:|:---:|
| `players` | oui | oui | oui | oui |
| `tasks` | oui | oui | oui | non |
| `alerts` | oui | oui | non | non |
| `events` | oui | oui | non | oui |
| `opportunities` | oui | oui | non | non |
| `contacts` | oui | oui | non | non |
| `clubs` | oui | oui | non | oui |
| `prospects` | oui | oui | non | oui |
| `ai_messages` | oui | oui | non | oui |
| `daily_briefs` | oui | oui | non | oui |
| `recommendations` | oui | oui | non | oui |
| `profiles` | oui | oui | oui | non |
| `academy_progress` | oui | oui | oui | non |
| `academy_done` | oui | oui | non | non |
| `certifications` | oui | oui | non | non |

Le rôle ne reçoit aucun droit sur `auth`, `storage` ou les schémas internes Supabase. Il ne reçoit ni ownership, DDL, TRUNCATE, création de rôle, création de base ni réplication.

## Justification temporaire de BYPASSRLS

Les tables publiques ont RLS activée mais aucune politique. L'application :

1. valide la session auprès de Supabase Auth ;
2. récupère l'UUID utilisateur côté serveur ;
3. filtre les requêtes métier par `user_id`.

Sans `BYPASSRLS`, le rôle applicatif ne verrait aucune ligne. L'attribut reste donc temporairement nécessaire pour `parzi_app_preview` et `parzi_app_production`, mais pas pour le groupe de permissions.

Cette architecture ne constitue pas la cible finale : R-007 doit centraliser les autorisations serveur, puis des politiques RLS ou une architecture Data API permettront de réévaluer et supprimer `BYPASSRLS`.

## Connexion recommandée

Vercel exécute des fonctions à connexions transitoires. La cible est le pooler partagé Supavisor en mode transaction, port `6543`, avec SSL obligatoire et requêtes préparées désactivées.

Le client actuel respecte déjà ces contraintes :

- `ssl: "require"` ;
- `prepare: false` ;
- `max: 5`.

Format à confirmer dans le panneau **Connect** de Supabase avant utilisation :

```text
postgresql://parzi_app_preview.<PROJECT_REF>:<PASSWORD_URL_ENCODED>@<REGION>.pooler.supabase.com:6543/postgres?sslmode=require
```

Le mot de passe doit être généré dans un gestionnaire de mots de passe, encodé pour une URL et ne jamais être écrit dans Git, un ticket ou cette documentation.

## Ordre d'application proposé

### Phase 1 — Préchecks en lecture seule

- confirmer l'identité de l'opérateur et la base ciblée ;
- vérifier la présence des 15 tables et 12 séquences listées ;
- vérifier les privilèges actuels de `PUBLIC` sur le schéma `public` ;
- confirmer le format du nom d'utilisateur Supavisor pour un rôle personnalisé ;
- disposer d'une base de preview distincte de la production.

### Phase 2 — Préparation des rôles

- exécuter `migration-014-runtime-role.sql` uniquement après approbation ;
- contrôler que les rôles restent `NOLOGIN` ;
- vérifier l'absence de DDL, TRUNCATE, ownership et accès aux schémas internes.

### Phase 3 — Preview uniquement

- générer un mot de passe distinct pour `parzi_app_preview` ;
- activer `LOGIN` sur ce rôle sans consigner le mot de passe ;
- remplacer uniquement la variable Vercel Preview `DATABASE_URL` ;
- ne pas modifier la variable Production ;
- redéployer une preview et exécuter les parcours lecture/écriture/suppression ;
- vérifier qu'une opération non accordée échoue.

### Phase 4 — Production

La production ne peut être basculée qu'après une période d'observation réussie en preview et une décision explicite. Elle utilise un mot de passe différent avec `parzi_app_production`.

## Bloqueur actuel

L'inventaire R-002 montre que Vercel partage aujourd'hui une configuration `DATABASE_URL` unique entre preview et production. Une preview distincte doit d'abord disposer de sa propre base ou branche autorisée. Tant que ce point n'est pas résolu, aucune activation de rôle ni modification de `DATABASE_URL` ne doit être effectuée.

## Validation attendue

- connexion réussie avec le rôle de preview via Supavisor ;
- parcours applicatifs autorisés réussis ;
- DDL et TRUNCATE refusés ;
- accès aux schémas `auth` et `storage` refusé ;
- journal `pg_stat_activity` attribuable au rôle de preview ;
- CI et Vercel réussis ;
- production inchangée pendant toute la validation preview.

## Validation locale du script

Test exécuté le 22 juillet 2026 sur PostgreSQL 17.10, dans une base locale vide et sans écoute réseau :

- chaîne `001 → 014` appliquée sans erreur ;
- rôles `preview` et `production` confirmés `NOLOGIN`, non-superuser, sans création de base, rôle ou réplication ;
- `BYPASSRLS` présent uniquement sur les deux identités de connexion ;
- INSERT avec colonne identity, SELECT, UPDATE et DELETE autorisés : réussis puis annulés par rollback ;
- CREATE TABLE, TRUNCATE et DELETE non accordé : refusés ;
- accès aux schémas de test `auth` et `storage` : refusé ;
- limites de connexion : 5 pour preview, 10 pour production.

Cette validation prouve le comportement PostgreSQL du script, pas sa compatibilité opérationnelle avec le pooler du projet Supabase. La validation Supavisor reste obligatoire avant toute activation.

## Rollback

1. restaurer uniquement l'ancienne variable Preview `DATABASE_URL` depuis le gestionnaire de secrets ;
2. redéployer la preview et confirmer son retour à l'état précédent ;
3. exécuter `ALTER ROLE parzi_app_preview NOLOGIN;` ;
4. conserver les rôles désactivés pendant le diagnostic ;
5. ne supprimer les rôles qu'après vérification de l'absence de connexion active.

R-005 reste **PRÉPARÉ**, mais non appliqué et non validé.
