-- Parzi Manage — migration initiale Postgres/Supabase
-- À exécuter dans le SQL Editor de Supabase (ou via psql).
-- Schéma identique à la version SQLite de dev, en types Postgres.

create table if not exists players (
  id          bigint generated always as identity primary key,
  name        text not null,
  position    text not null,
  age         integer not null,
  club        text not null,
  contract_end text not null,
  est_value   text not null,
  status      text not null check (status in ('ok','soon','urgent')),
  status_label text not null,
  salary      text not null,
  mandate     text not null,
  strong_foot text not null,
  height      text not null,
  nationality text not null,
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists tasks (
  id        bigint generated always as identity primary key,
  title     text not null,
  due_label text not null,
  is_late   boolean not null default false,
  is_done   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id       bigint generated always as identity primary key,
  severity text not null check (severity in ('critical','serious','warning','good')),
  body     text not null,
  meta     text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id         bigint generated always as identity primary key,
  day_label  text not null,
  time_label text not null,
  title      text not null,
  location   text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists opportunities (
  id      bigint generated always as identity primary key,
  club    text not null,
  fit_pct integer not null,
  body    text not null,
  created_at timestamptz not null default now()
);

create table if not exists contacts (
  id            bigint generated always as identity primary key,
  name          text not null,
  role          text not null,
  org           text not null,
  last_exchange text not null default '',
  next_step     text not null default '',
  created_at    timestamptz not null default now()
);

-- Sécurité : Row Level Security activée dès le jour 1 (cf. registre des risques).
-- En attendant l'authentification multi-comptes, on bloque l'accès anonyme :
-- seules les requêtes server-side (connection string / service role) passent.
alter table players       enable row level security;
alter table tasks         enable row level security;
alter table alerts        enable row level security;
alter table events        enable row level security;
alter table opportunities enable row level security;
alter table contacts      enable row level security;
