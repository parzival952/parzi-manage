# R-005 — Rôle PostgreSQL serveur à privilèges minimaux

- Statut : **VALIDÉ EN PREVIEW — PRODUCTION NON ACTIVÉE**
- Branche : `hardening/tome-lxxvii-v0`
- Base Supabase : migrations `001` à `014` appliquées uniquement sur `parzi-manage-preview`
- Production Supabase : aucune modification effectuée
- Variables Vercel : `DATABASE_URL` séparée entre Production et Preview ; valeur Preview dédiée et sensible

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

La configuration Vercel contient désormais deux entrées sensibles distinctes :

- la valeur historique, limitée à Production et laissée inchangée ;
- une valeur limitée à Preview, utilisant `parzi_app_preview` et le pooler transactionnel Supavisor.

Le rôle `parzi_app_production` reste `NOLOGIN`. Aucun secret n'est consigné dans Git ou dans cette preuve.

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

1. exécuter `ALTER ROLE parzi_app_preview NOLOGIN;` ;
2. supprimer uniquement l'entrée Vercel `DATABASE_URL` limitée à Preview ;
3. redéployer la preview et confirmer que la production reste inchangée ;
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

Le rôle de preview a ensuite été activé avec un secret dédié, immédiatement tourné avant utilisation définitive. La valeur Vercel historique a été limitée à Production sans être lue ni remplacée, puis une seconde `DATABASE_URL` sensible a été créée uniquement pour Preview.

Le commit de redéploiement `ca46d00` a produit une preview Vercel `READY` pour la branche `hardening/tome-lxxvii-v0`. Le contrôle HTTP de `/dashboard` a répondu correctement avec la redirection d'authentification attendue et aucune erreur d'exécution Vercel n'a été détectée. `build-and-test` et Vercel ont réussi.

## Validation applicative authentifiée

Test exécuté le 22 juillet 2026 sur la preview Vercel de la branche `hardening/tome-lxxvii-v0` :

- création de session réussie et arrivée sur `/bienvenue` avec l'action de déconnexion disponible ;
- accès authentifié direct à `/dashboard` réussi ;
- chargement complet du tableau de bord et de ses données réussi ;
- navigation authentifiée disponible ;
- aucune erreur détectée dans la console du navigateur pendant le parcours ;
- aucune action d'écriture déclenchée pendant ce contrôle.

R-005 est validé au niveau PostgreSQL et le parcours applicatif authentifié est opérationnel dans l'environnement Preview. Les derniers contrôles d'attribution, d'écriture et de refus sont consignés ci-dessous.

## Validation finale des privilèges en Preview

Contrôles exécutés le 22 juillet 2026, uniquement sur `parzi-manage-preview` :

- `pg_stat_activity` a attribué cinq connexions inactives à `parzi_app_preview`, avec `Supavisor` comme application ;
- aucune connexion n'a été observée pour `parzi_app_production` ;
- création d'un joueur temporaire réussie depuis le parcours applicatif authentifié ;
- lecture du joueur temporaire réussie dans le portefeuille ;
- suppression du même joueur réussie depuis le parcours applicatif ;
- absence de l'enregistrement temporaire confirmée ensuite directement en base ;
- `INSERT` et `DELETE` sur `players` confirmés accordés au rôle de Preview ;
- `DELETE` et `TRUNCATE` sur `tasks` confirmés refusés ;
- création d'objet dans le schéma `public` confirmée refusée ;
- usage du schéma `auth` et lecture de `auth.users` confirmés refusés ;
- `parzi_app_preview` confirmé avec `LOGIN` ;
- `parzi_app_production` confirmé avec `NOLOGIN`.

R-005 est désormais validé dans l'environnement Preview. Cette validation n'autorise pas le basculement de la production : celui-ci reste soumis à une décision explicite et à une procédure distincte.
