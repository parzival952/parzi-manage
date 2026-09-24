-- Sécurité — audit Supabase du 24/09/2026.
--
-- 1. `public.opportunity_events` (historique des opportunités, Parzi Manage) :
--    RLS désactivée et droits complets pour `anon` et `authenticated` → la table
--    était lisible/modifiable/vidable via l'API REST publique avec la clé anon.
--    L'application y accède côté serveur (rôles `postgres` propriétaire /
--    `parzi_app` BYPASSRLS), jamais via l'API REST : on active la RLS (sans
--    politique = refus pour anon/authenticated) et on retire leurs droits.
-- 2. `public.audit_log_immutable()` : search_path figé (avertissement 0011).
--
-- Rollback : alter table public.opportunity_events disable row level security;
--            grant select, insert, update, delete on public.opportunity_events to anon, authenticated;
--            alter function public.audit_log_immutable() reset search_path;

begin;

alter table public.opportunity_events enable row level security;
revoke all on table public.opportunity_events from anon, authenticated;

alter function public.audit_log_immutable() set search_path = public, pg_temp;

commit;
