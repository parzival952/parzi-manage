# R-005 — Rôle PostgreSQL serveur à privilèges minimaux

- Statut : **VALIDÉ SUR PREVIEW — NON ACTIVÉ DANS VERCEL**
- Branche : `hardening/tome-lxxvii-v0`
- Base Supabase : migrations `001` à `014` appliquées uniquement sur `parzi-manage-preview`
- Production Supabase : aucune modification effectuée
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

## Séparation de la preview

Le projet Supabase Free distinct `parzi-manage-preview` a été créé dans la même région que la production. Il contient le schéma issu des migrations `001` à `013` et les rôles préparés par la migration `014`. La production n'a pas été utilisée pendant cette validation.

L'inventaire R-002 montre toujours que Vercel partage une configuration `DATABASE_URL` entre preview et production. La prochaine étape doit donc créer une variable limitée à l'environnement Preview avant tout test applicatif. La variable Production ne doit pas être modifiée.

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

Cette validation prouve le comportement PostgreSQL du script. La validation Supavisor avec une identité de connexion dédiée reste obligatoire avant toute activation dans Vercel.

## Rollback

1. restaurer uniquement l'ancienne variable Preview `DATABASE_URL` depuis le gestionnaire de secrets ;
2. redéployer la preview et confirmer son retour à l'état précédent ;
3. exécuter `ALTER ROLE parzi_app_preview NOLOGIN;` ;
4. conserver les rôles désactivés pendant le diagnostic ;
5. ne supprimer les rôles qu'après vérification de l'absence de connexion active.

## Validation Supabase preview

Test exécuté le 22 juillet 2026 sur le projet `parzi-manage-preview` :

- chaîne `001 → 014` présente dans l'historique des migrations ;
- migration `014` adaptée au rôle `postgres` managé de Supabase : les attributs sensibles sont fixés à la création puis vérifiés, sans `ALTER ROLE` réservé au superutilisateur ;
- trois rôles confirmés `NOLOGIN`, non-superuser, sans création de base, création de rôle ni réplication ;
- `BYPASSRLS` confirmé uniquement pour `parzi_app_preview` et `parzi_app_production` ;
- limites de connexion confirmées à 5 pour preview et 10 pour production ;
- lecture de `public.players` réussie en assumant temporairement le rôle de preview dans une transaction annulée ;
- CREATE dans `public`, TRUNCATE, DELETE sur `tasks` et lecture de `auth.users` refusés ;
- aucun objet de test ni changement temporaire conservé ;
- conseillers Supabase : aucune alerte bloquante ; alertes informatives attendues sur l'absence de politiques RLS et les index encore inutilisés dans cette base vide.

R-005 est validé au niveau PostgreSQL sur la base de preview. L'activation du LOGIN, la création du secret, la séparation de `DATABASE_URL` dans Vercel et les tests applicatifs restent à effectuer avant toute considération de production.
