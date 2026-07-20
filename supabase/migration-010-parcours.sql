-- Parzi Manage — migration 010 : parcours utilisateur (aspirant / agent licencié)
-- '' = non choisi · 'aspirant' = se forme (Academy) · 'agent' = licencié (Manage)
alter table profiles add column if not exists path text not null default '';
