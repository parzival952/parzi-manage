-- Parzi Manage — migration 005 : brief IA du jour (cache par utilisateur et par date)
create table if not exists daily_briefs (
  id bigint generated always as identity primary key,
  user_id uuid,
  brief_date date not null default current_date,
  content text not null,
  created_at timestamptz not null default now()
);
alter table daily_briefs enable row level security;
create index if not exists daily_briefs_user_idx on daily_briefs(user_id, brief_date);
