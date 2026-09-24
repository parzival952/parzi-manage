-- PARZI Academy — droits du rôle applicatif sur les notes de leçon.
--
-- La migration 026 n'accordait les droits qu'à `parzi_app` (rôle de la base
-- de production). Sur les bases qui utilisent les rôles R-005
-- (`parzi_app_runtime`, hérité par `parzi_app_preview` / `parzi_app_production`),
-- la lecture des notes échouait avec « permission denied », ce qui faisait
-- planter la page de leçon. On aligne sur le modèle de la migration 015.
-- Idempotent : ne fait rien si les rôles n'existent pas.

begin;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'parzi_app_runtime') then
    grant select, insert, update, delete
      on table public.academy_lesson_notes
      to parzi_app_runtime;
  end if;

  if exists (select 1 from pg_roles where rolname = 'parzi_app') then
    grant select, insert, update, delete
      on table public.academy_lesson_notes
      to parzi_app;
  end if;
end
$$;

commit;
