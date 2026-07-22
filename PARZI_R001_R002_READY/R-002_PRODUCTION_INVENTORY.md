# R-002 — Inventaire de production et sauvegarde

Date de contrôle : 22 juillet 2026  
Projet Supabase : `Parzi-manage`  
Région : `eu-north-1`  
État observé : `ACTIVE_HEALTHY`  
Moteur : PostgreSQL 17  
Projet Vercel : `parzi-manage`  
Commit production observé : `6827199fffd5f5427f40ea0b8fb9f6340680c2cb`

## Sauvegarde fournie

Fichier local : `parzi_backup_2026-07-22.sql`  
Taille : 20182 octets  
SHA-256 : `96d3030f7486883932bee5f8fb77e9f636867f437d323413efac2b2837ea05e8`  
Type : données uniquement  
Transaction : `BEGIN` / `COMMIT` détectée  
Classification : **CONFIDENTIEL — données personnelles, interdiction de commit**

## Volumes présents dans la sauvegarde

| Table | Nombre de lignes |
|---|---:|
| `academy_done` | 3 |
| `academy_progress` | 1 |
| `ai_messages` | 2 |
| `alerts` | 4 |
| `contacts` | 4 |
| `daily_briefs` | 6 |
| `events` | 4 |
| `opportunities` | 4 |
| `players` | 6 |
| `profiles` | 2 |
| `prospects` | 1 |
| `recommendations` | 15 |
| `tasks` | 9 |

Total calculé : **61 lignes**.

## Limites connues

- La sauvegarde ne contient pas les utilisateurs Supabase Auth.
- Elle dépend de migrations `001..013`, alors que le dépôt audité n’en versionnait que `001..010`.
- Elle ne prouve pas encore qu’une restauration complète aboutit.
- Elle contient des données personnelles et ne doit pas être déposée dans GitHub, Vercel ou une conversation externe.

## Critères R-002

- [x] Sauvegarde de données récente disponible.
- [x] Empreinte cryptographique enregistrée.
- [x] Agrégats non sensibles calculés.
- [x] Projet et version PostgreSQL inventoriés.
- [x] Déploiement Vercel de référence inventorié.
- [ ] Sauvegarde automatique Supabase confirmée par capture du tableau Backups.
- [ ] Noms des variables Vercel vérifiés par environnement.
- [ ] Restauration testée sur environnement non productif.
- [ ] Temps de restauration mesuré.
- [ ] Comparaison post-restauration réussie.

## Décision

R-002 reste **PARTIELLEMENT VALIDÉ** tant qu’une restauration hors production n’a pas été exécutée et comparée.
