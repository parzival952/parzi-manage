-- Parzi Manage — migration 012 : lien Transfermarkt des joueurs
-- Reconstitution fidèle de la migration Supabase production
-- Version Supabase enregistrée : 20260721130107 (player_transfermarkt_link)
-- Ne pas réappliquer manuellement sur la production existante.

alter table players
  add column if not exists transfermarkt_url text not null default '';
