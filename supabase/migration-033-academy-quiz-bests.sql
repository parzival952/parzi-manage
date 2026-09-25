-- migration-033 — Quiz libre : meilleurs résultats et XP par niveau et par mode.
--
-- Une ligne par (élève, niveau 1-4, mode). Le serveur recorrige les réponses
-- envoyées et garde le meilleur résultat :
--   serie  : bonnes réponses sur 10 (0-10) ; l'XP d'un palier n'est versée qu'une fois ;
--   chrono : points (0-2000), sans XP ;
--   libre  : meilleure série de bonnes réponses d'affilée (0-1000), sans XP.
-- L'XP elle-même s'ajoute à academy_progress.xp.
--
-- Accès : uniquement par le serveur de l'application (DATABASE_URL, rôle
-- parzi_app), filtré sur l'utilisateur connecté. RLS activée sans politique
-- + privilèges retirés à anon / authenticated : l'API REST publique ne voit rien.
--
-- Idempotente. Retour arrière : drop table public.academy_quiz_bests;
-- (l'XP déjà créditée reste sur les comptes).

begin;

create table if not exists public.academy_quiz_bests (
  user_id uuid not null references auth.users(id) on delete cascade,
  level smallint not null check (level between 1 and 4),
  mode text not null check (mode in ('serie', 'chrono', 'libre')),
  best_score integer not null default 0 check (best_score between 0 and 2000),
  xp_awarded integer not null default 0 check (xp_awarded between 0 and 1000),
  plays integer not null default 0 check (plays >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, level, mode)
);

alter table public.academy_quiz_bests enable row level security;

revoke all on table public.academy_quiz_bests from anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'parzi_app') then
    grant select, insert, update, delete on table public.academy_quiz_bests to parzi_app;
  end if;
  if exists (select 1 from pg_roles where rolname = 'parzi_app_runtime') then
    grant select, insert, update, delete on table public.academy_quiz_bests to parzi_app_runtime;
  end if;
end
$$;

commit;
