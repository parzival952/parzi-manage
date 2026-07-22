-- Parzi Manage — migration 011 : certifications
-- Reconstitution fidèle de la migration Supabase production
-- Version Supabase enregistrée : 20260721124333 (certifications)
-- Ne pas réappliquer manuellement sur la production existante.

create table if not exists certifications (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  cert_id text not null,
  score integer not null,
  code text not null,
  created_at timestamptz not null default now(),
  unique (user_id, cert_id)
);

alter table certifications enable row level security;
