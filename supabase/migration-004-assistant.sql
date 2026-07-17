-- Parzi Manage — migration 004 : conversations de l'assistant IA
create table if not exists ai_messages (
  id bigint generated always as identity primary key,
  user_id uuid,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table ai_messages enable row level security;
create index if not exists ai_messages_user_idx on ai_messages(user_id);
