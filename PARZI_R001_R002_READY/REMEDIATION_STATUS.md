# PARZI Manage — REMEDIATION STATUS

Version : 1.0  
Date : 22 juillet 2026  
Référentiel : Tomes LXXVI et LXXVII  
Commit de départ audité : `6827199fffd5f5427f40ea0b8fb9f6340680c2cb`  
Branche cible : `hardening/tome-lxxvii-v0`

## Règles de chantier

- Aucun commit direct sur `main`.
- Un ticket à la fois, dans l’ordre R-001 → R-030.
- Aucune fonctionnalité hors backlog avant R-030.
- Toute migration doit être additive, idempotente et testée hors production.
- Aucune donnée personnelle, sauvegarde SQL ou valeur secrète dans GitHub.
- Toute règle d’autorisation sensible doit être appliquée côté serveur.
- Chaque ticket se termine par tests, preuves, risques résiduels et rollback.

## État des tickets

| ID | Vague | Priorité | Effort | Ticket | Statut | Preuve |
|---|---|---|---|---|---|---|
| R-001 | V0 | P1 | XS | Geler le périmètre et créer la baseline de remédiation | EN COURS | À joindre |
| R-002 | V0 | P1 | M | Sauvegarde, restauration et inventaire de production | EN COURS | À joindre |
| R-003 | V0 | P1 | M | Versionner le schéma Supabase réellement déployé | NON COMMENCÉ | À joindre |
| R-004 | V0 | P1 | S | Imposer le flux branche → PR → preview → main | NON COMMENCÉ | À joindre |
| R-005 | V1 | P1 | M | Créer un rôle PostgreSQL serveur à privilèges minimaux | NON COMMENCÉ | À joindre |
| R-006 | V1 | P1 | L | Ajouter NOT NULL, clés étrangères et règles de suppression | NON COMMENCÉ | À joindre |
| R-007 | V1 | P1 | M | Centraliser les autorisations serveur | NON COMMENCÉ | À joindre |
| R-008 | V1 | P1 | L | Construire la suite d’isolation A/B sur Supabase | NON COMMENCÉ | À joindre |
| R-009 | V1 | P1 | M | Compléter le cycle de vie du compte et des sessions | NON COMMENCÉ | À joindre |
| R-010 | V1 | P1 | L | Remplacer l’administration par e-mail par des rôles auditables | NON COMMENCÉ | À joindre |
| R-011 | V1 | P1 | M | Sécuriser et rendre idempotent le cron | NON COMMENCÉ | À joindre |
| R-012 | V1 | P1 | M | Passer les e-mails en opt-in réel et ajouter la désinscription | NON COMMENCÉ | À joindre |
| R-013 | V1 | P1 | M | Pseudonymiser PostHog et offrir un réglage analytics | NON COMMENCÉ | À joindre |
| R-014 | V1 | P1 | M | Encadrer les usages, coûts et données de l’IA | NON COMMENCÉ | À joindre |
| R-015 | V1 | P1 | L | Créer l’espace Données et confidentialité | NON COMMENCÉ | À joindre |
| R-016 | V1 | P2 | M | Ajouter en-têtes de sécurité et observabilité | NON COMMENCÉ | À joindre |
| R-017 | V2 | P1 | L | Structurer les dates de contrat et de mandat | NON COMMENCÉ | À joindre |
| R-018 | V2 | P1 | M | Remplacer la suppression joueur par archivage contrôlé | NON COMMENCÉ | À joindre |
| R-019 | V2 | P1 | L | Refondre les tâches avec dates, statuts et relations | NON COMMENCÉ | À joindre |
| R-020 | V2 | P1 | L | Construire le véritable pipeline Opportunités | NON COMMENCÉ | À joindre |
| R-021 | V2 | P1 | M | Isoler complètement les données de démonstration | NON COMMENCÉ | À joindre |
| R-022 | V2 | P1 | M | Aligner les formulations du dashboard sur les calculs réels | NON COMMENCÉ | À joindre |
| R-023 | V2 | P1 | M | Reconcevoir Agency Health comme indicateur prouvé | NON COMMENCÉ | À joindre |
| R-024 | V2 | P1 | M | Renommer ou masquer le PARZI Score expérimental | NON COMMENCÉ | À joindre |
| R-025 | V3 | P1 | L | Sécuriser les quiz, XP et prérequis Academy | NON COMMENCÉ | À joindre |
| R-026 | V3 | P1 | M | Recalibrer niveaux, badges, trophées et OVR | NON COMMENCÉ | À joindre |
| R-027 | V3 | P1 | L | Rendre les attestations honnêtes et vérifiables | NON COMMENCÉ | À joindre |
| R-028 | V3 | P1 | L | Professionnaliser PARZI ID et la vérification des titres | NON COMMENCÉ | À joindre |
| R-029 | V4 | P1 | L | Effectuer la recette accessibilité, mobile et E2E réelle | NON COMMENCÉ | À joindre |
| R-030 | V4 | P1 | L | Créer la Release Candidate pilote et le dossier Go/No-Go | NON COMMENCÉ | À joindre |

## R-001 — État

- [x] Commit de référence enregistré.
- [x] Branche cible nommée.
- [x] Tableau des 30 tickets préparé.
- [x] Services externes inventoriés sans secret.
- [ ] Branche créée sur GitHub.
- [ ] Protection de `main` activée.
- [ ] Pull request brouillon ouverte.

### Blocage actuel

La connexion GitHub utilisée par ChatGPT a retourné `403 Resource not accessible by integration` lors de la création de la branche. Une création manuelle dans GitHub ou une autorisation d’écriture supplémentaire est nécessaire.

## Services et variables — noms uniquement

Services connus :
- GitHub
- Vercel
- Supabase PostgreSQL/Auth
- Anthropic
- Resend
- PostHog EU
- football-data.org

Variables connues ou déduites du code, sans valeur :
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `CRON_SECRET`
- `ADMIN_EMAILS`
- `FOOTBALL_DATA_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

À vérifier dans Vercel : environnements Production / Preview / Development et présence exacte de chaque nom.
