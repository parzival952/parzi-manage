-- migration-031 — Inscription progressive PARZI Academy : « Faisons connaissance ».
--
-- Une ligne par élève, remplie en 3 étapes après la création du compte :
--   1. prénom, nom, tranche d'âge, pays, ville / région ;
--   2. objectif, échéance de l'examen ;
--   3. (facultatif) téléphone, comment l'élève a connu PARZI.
-- `step` = prochaine étape à afficher (1 à 3 ; 4 = terminé), `completed_at`
-- posé à la fin. Les valeurs à choix sont des codes courts, vérifiés ici ET
-- par l'application (src/lib/academy-onboarding-fields.ts).
--
-- Table séparée de `profiles` (partagée avec Parzi Manage) : ces données
-- personnelles (dont le téléphone) ne concernent que l'Academy.
--
-- Accès : uniquement par le serveur de l'application (DATABASE_URL, rôle
-- parzi_app), filtré sur l'utilisateur connecté. RLS activée sans politique
-- + privilèges retirés à anon / authenticated : l'API REST publique ne voit rien.
-- Suppression du compte → ligne supprimée (on delete cascade).
--
-- Idempotente. Retour arrière : drop table public.academy_member_profiles;

begin;

create table if not exists public.academy_member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text check (first_name is null or char_length(first_name) between 1 and 60),
  last_name text check (last_name is null or char_length(last_name) between 1 and 60),
  age_range text check (age_range is null or age_range in ('moins-18', '18-25', '26-35', '36-plus')),
  country text check (country is null or char_length(country) between 1 and 60),
  region text check (region is null or char_length(region) <= 80),
  phone text check (phone is null or char_length(phone) <= 30),
  goal text check (goal is null or goal in ('licence', 'lancer', 'proche', 'decouvrir')),
  exam_horizon text check (exam_horizon is null or exam_horizon in ('moins-3-mois', '3-6-mois', 'plus-6-mois', 'pas-prevu')),
  referral_source text check (
    referral_source is null
    or referral_source in ('instagram', 'tiktok', 'youtube', 'google', 'bouche-a-oreille', 'club-agent', 'autre')
  ),
  step smallint not null default 1 check (step between 1 and 4),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Jamais de téléphone pour un élève de moins de 18 ans.
  constraint academy_member_profiles_no_phone_minor check (age_range is distinct from 'moins-18' or phone is null)
);

alter table public.academy_member_profiles enable row level security;

revoke all on table public.academy_member_profiles from anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'parzi_app') then
    grant select, insert, update, delete on table public.academy_member_profiles to parzi_app;
  end if;
  if exists (select 1 from pg_roles where rolname = 'parzi_app_runtime') then
    grant select, insert, update, delete on table public.academy_member_profiles to parzi_app_runtime;
  end if;
end
$$;

commit;
