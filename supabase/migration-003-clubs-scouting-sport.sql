-- Parzi Manage — migration 003 : clubs, cibles de scouting, champ multi-sports
-- À exécuter dans le SQL Editor de Supabase. Rejouable sans danger.

create table if not exists clubs (
  id          bigint generated always as identity primary key,
  user_id     uuid,
  name        text not null,
  league      text not null default '',
  need        text not null default '',
  budget      text not null default '',
  contact_name text not null default '',
  notes       text not null default '',
  sport       text not null default 'football',
  created_at  timestamptz not null default now()
);

create table if not exists prospects (
  id           bigint generated always as identity primary key,
  user_id      uuid,
  name         text not null,
  position     text not null default '',
  age          integer not null default 18,
  club         text not null default '',
  league       text not null default '',
  contract_end text not null default '',
  note         text not null default '',
  sport        text not null default 'football',
  created_at   timestamptz not null default now()
);

alter table clubs     enable row level security;
alter table prospects enable row level security;

create index if not exists clubs_user_idx     on clubs(user_id);
create index if not exists prospects_user_idx on prospects(user_id);

-- Champ multi-sports sur les tables existantes (décision d'architecture :
-- vision large, exécution étroite — 'football' par défaut partout)
alter table players       add column if not exists sport text not null default 'football';
alter table opportunities add column if not exists sport text not null default 'football';
alter table contacts      add column if not exists sport text not null default 'football';
