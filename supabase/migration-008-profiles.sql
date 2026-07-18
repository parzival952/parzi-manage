-- Parzi Manage — migration 008 : profils (e-mail + préférences de notification)
create table if not exists profiles (
  user_id uuid primary key,
  email text not null default '',
  notify_brief boolean not null default true,
  last_brief_sent date,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
