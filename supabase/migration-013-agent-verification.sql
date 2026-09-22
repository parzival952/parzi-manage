-- Parzi Manage — migration 013 : vérification des agents
-- Reconstitution fidèle de la migration Supabase production
-- Version Supabase enregistrée : 20260721131430 (agent_verification)
-- Ne pas réappliquer manuellement sur la production existante.

alter table profiles
  add column if not exists agent_status text not null default 'none',
  add column if not exists full_name text not null default '',
  add column if not exists license_number text not null default '',
  add column if not exists license_country text not null default '',
  add column if not exists license_submitted_at text not null default '',
  add column if not exists verified_at text not null default '',
  add column if not exists verify_note text not null default '';

create index if not exists idx_profiles_agent_status
  on profiles (agent_status);
