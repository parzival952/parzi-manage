-- Parzi Manage — migration 006 : argumentaire IA du dossier joueur
alter table players add column if not exists pitch text not null default '';
