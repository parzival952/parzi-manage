# R-003 — Réconciliation du schéma Supabase de production

Date : 22 juillet 2026  
Branche cible : `hardening/tome-lxxvii-v0`  
Production Supabase : `Parzi-manage`

## Objectif

Versionner dans GitHub les changements de schéma déjà présents en production, sans les réappliquer et sans modifier les données.

## Registre Supabase observé

| Version Supabase | Nom enregistré | Correspondance GitHub |
|---|---|---|
| `20260721123449` | `academy_progression` | Déjà couvert par `supabase/migration-009-academy.sql` |
| `20260721124333` | `certifications` | Ajouté par `supabase/migration-011-certifications.sql` |
| `20260721130107` | `player_transfermarkt_link` | Ajouté par `supabase/migration-012-player-transfermarkt-link.sql` |
| `20260721131430` | `agent_verification` | Ajouté par `supabase/migration-013-agent-verification.sql` |

## Pourquoi aucune migration 011 Academy n’est créée

Le SQL affiché par Supabase pour `academy_progression` correspond déjà au contenu de `supabase/migration-009-academy.sql` :

- création de `academy_progress` ;
- création de `academy_done` ;
- mêmes colonnes et valeurs par défaut ;
- mêmes clés primaires ;
- activation de RLS sur les deux tables.

Créer un second fichier rejouant exactement ce SQL serait redondant et brouillerait l’historique.

## Limite importante

Les fichiers 011 à 013 sont des **snapshots historiques fidèles**, pas des correctifs de sécurité.

Ils reproduisent volontairement l’état existant, notamment :

- absence de clés étrangères vers `auth.users` ;
- RLS activé sans politique sur `certifications` ;
- `code` de certification non unique globalement ;
- `transfermarkt_url` stocké comme texte obligatoire avec chaîne vide ;
- dates de vérification stockées comme texte ;
- absence de contraintes sur les statuts et scores.

Ces améliorations doivent être traitées dans les tickets ultérieurs, principalement R-006, R-007, R-017, R-027 et R-028.

## Consigne d’exploitation

- Ne pas exécuter manuellement ces fichiers sur la production actuelle.
- Les intégrer uniquement dans la branche de remédiation.
- Les utiliser pour reconstruire une base vierge ou un environnement de test.
- Toute restauration complète reste bloquée tant que la chaîne 001 → 013 n’a pas été testée hors production.

## État R-003

- [x] Quatre migrations enregistrées dans Supabase inventoriées.
- [x] SQL de chaque migration contrôlé.
- [x] Correspondance de `academy_progression` avec migration 009 établie.
- [x] Trois migrations absentes reconstituées fidèlement.
- [x] Fichiers ajoutés à la branche GitHub.
- [x] CI et Preview Vercel validées après commit.
- [x] Reconstruction 001 → 013 testée sur une base vide hors production.

R-003 est **VALIDÉ** pour la réconciliation et la reconstruction du schéma hors production. La preuve d'exécution est consignée dans `docs/hardening/R-002_R-003_RESTORE_TEST.md`.
