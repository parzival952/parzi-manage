-- migration-026 — Notes personnelles par leçon (PARZI Academy).
--
-- Chaque élève peut écrire ses propres notes sous une leçon ; elles sont
-- reprises dans l'aide-mémoire. Une note par (élève, leçon), 4 000 caractères
-- au plus ; une note vidée est supprimée côté application.
--
-- Accès : uniquement par le serveur de l'application (DATABASE_URL, rôle
-- parzi_app), qui filtre toujours sur l'utilisateur connecté — même modèle que
-- academy_done et certifications. RLS activée sans politique + privilèges
-- retirés à anon / authenticated : l'API REST publique ne voit rien.
--
-- Idempotente. Retour arrière : drop table public.academy_lesson_notes;

begin;

create table if not exists public.academy_lesson_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null references public.academy_lesson_definitions(lesson_id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.academy_lesson_notes enable row level security;

revoke all on table public.academy_lesson_notes from anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'parzi_app') then
    grant select, insert, update, delete on table public.academy_lesson_notes to parzi_app;
  end if;
end
$$;

commit;
