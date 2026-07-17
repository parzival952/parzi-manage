-- Parzi Manage — migration 007 : moteur de priorisation (actions du jour)
create table if not exists recommendations (
  id bigint generated always as identity primary key,
  user_id uuid,
  rec_date date not null default current_date,
  title text not null,
  why text not null default '',
  impact text not null default '',
  effort text not null default '',
  probability text not null default '',
  priority integer not null default 3,
  created_at timestamptz not null default now()
);
alter table recommendations enable row level security;
create index if not exists recommendations_user_idx on recommendations(user_id, rec_date);
