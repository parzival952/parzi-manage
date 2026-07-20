-- Parzi Manage — migration 009 : PARZI Academy (progression)
create table if not exists academy_progress (
  user_id uuid primary key,
  xp integer not null default 0,
  streak integer not null default 0,
  best_streak integer not null default 0,
  last_active date,
  updated_at timestamptz not null default now()
);
alter table academy_progress enable row level security;

create table if not exists academy_done (
  user_id uuid not null,
  lesson_id text not null,
  score integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table academy_done enable row level security;
