-- migration-030 — Simulation de négociation : meilleur score et XP par palier.
--
-- Une ligne par (élève, scénario). Le serveur rejoue les choix de l'élève,
-- recalcule le score, garde le meilleur, et crédite l'XP d'un palier une seule
-- fois (xp_awarded = XP déjà versée pour ce scénario). L'XP elle-même s'ajoute
-- à academy_progress.xp.
--
-- Accès : uniquement par le serveur de l'application (DATABASE_URL, rôle
-- parzi_app), filtré sur l'utilisateur connecté. RLS activée sans politique
-- + privilèges retirés à anon / authenticated : l'API REST publique ne voit rien.
--
-- Idempotente. Retour arrière : drop table public.academy_simulation_runs;
-- (l'XP déjà créditée reste sur les comptes).

begin;

create table if not exists public.academy_simulation_runs (
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null check (char_length(scenario_id) between 1 and 64),
  best_score integer not null default 0 check (best_score between 0 and 100),
  xp_awarded integer not null default 0 check (xp_awarded between 0 and 1000),
  plays integer not null default 0 check (plays >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, scenario_id)
);

alter table public.academy_simulation_runs enable row level security;

revoke all on table public.academy_simulation_runs from anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'parzi_app') then
    grant select, insert, update, delete on table public.academy_simulation_runs to parzi_app;
  end if;
  if exists (select 1 from pg_roles where rolname = 'parzi_app_runtime') then
    grant select, insert, update, delete on table public.academy_simulation_runs to parzi_app_runtime;
  end if;
end
$$;

commit;
