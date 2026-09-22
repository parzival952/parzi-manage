# R-006 — Propriété utilisateur et règles de suppression

- Statut : **VALIDÉ EN PREVIEW — PRODUCTION NON MODIFIÉE**
- Branche : `hardening/tome-lxxvii-v0`
- Migration préparée : `supabase/migration-015-user-ownership-constraints.sql`
- Production : aucune modification effectuée

## Objectif

Empêcher les lignes sans propriétaire et les références vers un utilisateur Auth inexistant. Les 15 tables applicatives portant `user_id` doivent finalement respecter :

- `user_id NOT NULL` ;
- clé étrangère vers la clé primaire `auth.users(id)` ;
- suppression `ON DELETE CASCADE` pour les données appartenant au compte.

Cette règle couvre les données métier, le profil, la progression Academy et les contenus personnels générés. Les futurs journaux d'audit de R-010 ne sont pas concernés : leur conservation et leur pseudonymisation devront suivre une politique séparée.

## Stratégie additive

La migration suit l'ordre imposé par le Tome LXXVII :

1. compter les `user_id` nuls ;
2. compter les références absentes de `auth.users` ;
3. refuser toute exécution si une anomalie existe, sans corriger ni supprimer de ligne ;
4. ajouter chaque clé étrangère en `NOT VALID` ;
5. valider chaque contrainte ;
6. appliquer `NOT NULL` ;
7. conserver une transaction unique avec délais de verrouillage bornés.

La migration est idempotente. Une contrainte déjà présente est acceptée uniquement si elle référence bien `auth.users(id)` avec `ON DELETE CASCADE`. Une définition incompatible bloque l'exécution.

## Précheck Preview du 22 juillet 2026

Résultat sur `parzi-manage-preview` :

- 15 tables avec une colonne `user_id` ;
- aucun `user_id` nul ;
- aucune clé étrangère existante vers `auth.users` ;
- 15 lignes orphelines réparties sur `alerts`, `contacts`, `events`, `opportunities`, `players`, `profiles` et `tasks` ;
- toutes les lignes orphelines utilisent un seul identifiant de propriétaire ;
- cet identifiant n'est pas l'UUID réservé au mode de démonstration local ;
- la table `auth.users` du projet Preview contient zéro utilisateur.

Le parcours Vercel Preview authentifie donc actuellement un compte qui n'existe pas dans l'Auth du projet Supabase Preview utilisé par `DATABASE_URL`. Ajouter les contraintes dans cet état ferait échouer leur validation et rendrait impossible un test représentatif de suppression de compte.

## Décision nécessaire avant application

La configuration Preview doit utiliser le même projet Supabase pour Auth et PostgreSQL. Après cette séparation complète :

1. créer un compte de test dans Supabase Auth Preview ;
2. décider explicitement si les 15 lignes de test actuelles sont supprimées ou réattribuées au nouveau compte Preview ;
3. obtenir zéro null et zéro orphelin ;
4. appliquer la migration `015` uniquement sur Preview ;
5. supprimer un compte de test et confirmer le `CASCADE` sur les 15 tables ;
6. exécuter les conseillers Supabase et la CI.

Aucune de ces actions n'autorise une modification de production.

## Résolution et validation Preview

Validation exécutée le 22 juillet 2026 après autorisation explicite :

- les valeurs Vercel historiques `SUPABASE_URL` et `SUPABASE_ANON_KEY` ont été limitées à Production sans être lues ni remplacées ;
- deux valeurs dédiées au projet `parzi-manage-preview` ont été ajoutées uniquement à l'environnement Vercel Preview ;
- un utilisateur a été créé dans Supabase Auth Preview, sans nouveau portefeuille applicatif ;
- les 15 lignes existantes ont été réattribuées de leur unique propriétaire orphelin à cet unique utilisateur Auth Preview ;
- aucune ligne n'a été supprimée pendant la réattribution ;
- le contrôle après transaction a confirmé zéro propriétaire nul ou orphelin ;
- la migration `015` a été appliquée uniquement sur `parzi-manage-preview` ;
- 15 clés étrangères vers `auth.users(id)` sont présentes et validées ;
- les 15 clés étrangères utilisent `ON DELETE CASCADE` ;
- les 15 colonnes `user_id` sont `NOT NULL` ;
- la suppression du compte de test a supprimé les 15 lignes liées dans une transaction de contrôle ;
- la transaction a été annulée et le contrôle final a confirmé le retour intact de l'utilisateur et des 15 lignes.

Les conseillers Supabase n'ont signalé aucune nouvelle erreur liée à R-006. Les informations sur l'absence de politiques RLS restent attendues avec l'architecture serveur temporaire décrite dans R-005. La protection contre les mots de passe compromis reste un avertissement Auth à traiter dans R-009. L'index encore inutilisé est attendu dans cette base de Preview presque vide.

## Rollback

Si la migration a été appliquée en Preview :

1. retirer uniquement les contraintes nommées `<table>_user_id_auth_users_fkey` ajoutées par R-006 ;
2. retirer `NOT NULL` uniquement sur les 11 colonnes qui étaient auparavant nullables : `ai_messages`, `alerts`, `clubs`, `contacts`, `daily_briefs`, `events`, `opportunities`, `players`, `prospects`, `recommendations` et `tasks` ;
3. conserver les `NOT NULL` préexistants sur `academy_done`, `academy_progress`, `certifications` et `profiles` ;
4. vérifier que l'application Preview fonctionne encore avec le même compte de test.

Ne jamais supprimer de ligne pour effectuer le rollback. Le code actuel continue de fournir `user_id` dans ses écritures et reste compatible avec l'absence temporaire de ces contraintes.
