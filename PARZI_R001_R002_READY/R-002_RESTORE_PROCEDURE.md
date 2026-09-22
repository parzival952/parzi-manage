# R-002 — Procédure de restauration hors production

## Interdictions

- Ne jamais restaurer directement sur la production.
- Ne jamais committer le fichier de sauvegarde.
- Ne jamais afficher les e-mails ou autres données personnelles dans les logs de preuve.
- Ne pas créer de branche Supabase payante sans confirmation du coût.

## Prérequis

1. Une base Supabase de test vide ou une branche de développement autorisée.
2. Les migrations `001..013` complètes et validées.
3. Le fichier `parzi_backup_2026-07-22.sql` conservé localement.
4. Un opérateur autorisé et une fenêtre de test documentée.

## Séquence

1. Enregistrer l’heure de début.
2. Appliquer les migrations dans l’ordre.
3. Vérifier la présence des tables et contraintes attendues.
4. Importer la sauvegarde de données.
5. Vérifier que la transaction se termine sans erreur.
6. Comparer uniquement les agrégats anonymes par table.
7. Vérifier les séquences d’identifiants.
8. Tester la connexion d’un compte de test distinct.
9. Confirmer qu’aucune donnée de production n’est exposée publiquement.
10. Enregistrer l’heure de fin et la durée.
11. Supprimer l’environnement de test selon la politique définie.

## Preuves à conserver

- Date et opérateur.
- Identifiant de l’environnement de test.
- Versions PostgreSQL et migrations.
- Résultat de chaque migration.
- Agrégats avant/après, sans contenu personnel.
- Durée de restauration.
- Erreurs et corrections.
- Confirmation de suppression de l’environnement temporaire.

## Rollback

La production n’étant jamais modifiée, le rollback consiste à abandonner et supprimer uniquement l’environnement de test.
