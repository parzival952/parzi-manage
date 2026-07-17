-- Parzi Manage — migration 002 : comptes utilisateurs
-- À exécuter dans le SQL Editor de Supabase.
-- Ajoute le cloisonnement par agent (user_id) sur toutes les tables.

alter table players       add column if not exists user_id uuid;
alter table tasks         add column if not exists user_id uuid;
alter table alerts        add column if not exists user_id uuid;
alter table events        add column if not exists user_id uuid;
alter table opportunities add column if not exists user_id uuid;
alter table contacts      add column if not exists user_id uuid;

create index if not exists players_user_idx       on players(user_id);
create index if not exists tasks_user_idx         on tasks(user_id);
create index if not exists alerts_user_idx        on alerts(user_id);
create index if not exists events_user_idx        on events(user_id);
create index if not exists opportunities_user_idx on opportunities(user_id);
create index if not exists contacts_user_idx      on contacts(user_id);

-- Les anciennes données de démo (sans propriétaire) ne sont plus visibles
-- par personne : on les supprime — chaque nouveau compte reçoit son propre
-- portefeuille de démonstration à l'inscription.
delete from players       where user_id is null;
delete from tasks         where user_id is null;
delete from alerts        where user_id is null;
delete from events        where user_id is null;
delete from opportunities where user_id is null;
delete from contacts      where user_id is null;
