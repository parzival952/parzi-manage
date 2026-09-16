# R-007 — Centraliser les autorisations serveur

## Statut

**PRÊT LOCALEMENT — VALIDATION PREVIEW REQUISE AVANT CLÔTURE**

- Branche : `hardening/tome-lxxvii-v0`
- Production : non modifiée
- Supabase : aucune mutation exécutée pour ce ticket
- Vercel : aucune configuration modifiée pour ce ticket
- Commit : non créé, en attente d’autorisation

## Objectif

Appliquer les règles « connecté », « agent vérifié », « administrateur » et « propriétaire de la ressource » au niveau serveur, y compris lorsqu’une Server Action est appelée directement sans passer par l’interface.

## Décisions d’implémentation

### Session connectée

Le helper existant `requireUser` reste la source unique de l’utilisateur authentifié. Il valide le jeton auprès de Supabase Auth via l’endpoint `/auth/v1/user` et tente un rafraîchissement de session si nécessaire.

### Agent vérifié

`requireVerifiedAgent` combine la session authentifiée avec le statut persistant du profil. Les Server Actions de création et suppression de Clubs ainsi que la création de contacts CRM l’appellent désormais directement. Le gate visuel reste présent pour l’expérience utilisateur, mais n’est plus la frontière de sécurité.

### Administrateur

`requireAdminRole` centralise le contrôle administrateur des pages et mutations de vérification. Sa source reste provisoirement la liste d’e-mails existante ; R-010 la remplacera par un RBAC persistant et audité.

### Propriété des ressources

- Les lectures individuelles utilisent `requireOwnedResource` après une requête filtrée par `user_id`.
- Les mutations par identifiant restent atomiquement filtrées par `id` et `user_id`.
- Les mutations retournent désormais si une ligne appartenant à l’utilisateur a réellement été affectée.
- `requireOwnedMutation` transforme zéro ligne affectée en réponse « introuvable », ce qui masque l’existence éventuelle d’une ressource d’un autre compte.

Les protections couvrent les joueurs, tâches, clubs, prospects et événements. La génération d’argumentaire vérifie aussi la propriété du joueur avant tout appel externe.

## Audit des points d’entrée

- 28 Server Actions recensées.
- Les actions de connexion et d’inscription restent publiques par définition.
- Les actions métier ordinaires appellent `requireUser`.
- Les actions Clubs et CRM appellent `requireVerifiedAgent`.
- Les actions de vérification administrative appellent `requireAdminRole`.
- Les mutations portant un identifiant fourni par le client contrôlent la propriété ou le nombre de lignes affectées.
- La route de statut de veille reste publique et ne retourne que des agrégats non personnels.
- La route cron conserve sa protection dédiée ; son durcissement complet appartient à R-011.

## Vérifications locales

Exécutées le 22 juillet 2026 :

- TypeScript : réussi.
- ESLint : réussi.
- Tests ciblés R-007 : 4 réussis sur 4.
- Recette Playwright complète : 20 réussis sur 20.
- Build Next.js 16.2.10 : réussi.
- `git diff --check` : à exécuter avant commit.

Les tests R-007 couvrent les règles de lecture, création, modification et suppression. La preuve dynamique entre deux comptes Supabase distincts sera exécutée en Preview avec R-008, qui dépend explicitement de R-007.

## Validation Preview restant à faire

Après autorisation de commit et déploiement Preview :

1. vérifier qu’un compte non vérifié ne peut pas appeler directement les mutations Clubs et CRM ;
2. vérifier qu’un identifiant appartenant à un autre compte retourne « introuvable » ;
3. rejouer création, modification et suppression avec un compte propriétaire ;
4. confirmer `build-and-test` et Vercel ;
5. ne rien exécuter sur la production.

## Rollback

Revenir aux versions précédentes des Server Actions et des helpers uniquement si la Preview bloque un parcours légitime. Ne pas déployer sans tests d’autorisation. Aucune suppression de donnée ni modification de schéma n’est nécessaire au rollback.
