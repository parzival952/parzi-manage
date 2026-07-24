begin;

create table if not exists public.academy_diagnostic_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null default 'module-00-diagnostic',
  module_version text not null default '1.0.0',
  status text not null default 'completed'
    check (status in ('completed')),
  score_percent integer not null
    check (score_percent between 0 and 100),
  correct_count integer not null
    check (correct_count >= 0),
  question_count integer not null
    check (question_count > 0),
  points_earned integer not null
    check (points_earned >= 0),
  points_possible integer not null
    check (points_possible > 0),
  elapsed_seconds integer not null default 0
    check (elapsed_seconds >= 0),
  overconfidence_errors integer not null default 0
    check (overconfidence_errors >= 0),
  slow_answers integer not null default 0
    check (slow_answers >= 0),
  unanswered_questions integer not null default 0
    check (unanswered_questions >= 0),
  section_results jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  xp_awarded integer not null default 0
    check (xp_awarded >= 0),
  created_at timestamptz not null default now()
);

create index if not exists
  academy_diagnostic_attempts_user_created_idx
on public.academy_diagnostic_attempts (
  user_id,
  created_at desc
);

alter table public.academy_diagnostic_attempts
  enable row level security;

drop policy if exists
  academy_diagnostic_attempts_select_own
on public.academy_diagnostic_attempts;

create policy academy_diagnostic_attempts_select_own
on public.academy_diagnostic_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists
  academy_diagnostic_attempts_insert_own
on public.academy_diagnostic_attempts;

create policy academy_diagnostic_attempts_insert_own
on public.academy_diagnostic_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

create table if not exists public.academy_rewards (
  user_id uuid not null
    references auth.users(id) on delete cascade,
  reward_key text not null,
  xp integer not null check (xp >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, reward_key)
);

alter table public.academy_rewards
  enable row level security;

drop policy if exists academy_rewards_select_own
on public.academy_rewards;

create policy academy_rewards_select_own
on public.academy_rewards
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists academy_rewards_insert_own
on public.academy_rewards;

create policy academy_rewards_insert_own
on public.academy_rewards
for insert
to authenticated
with check (auth.uid() = user_id);

create table if not exists public.academy_trophies (
  user_id uuid not null
    references auth.users(id) on delete cascade,
  trophy_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, trophy_id)
);

alter table public.academy_trophies
  enable row level security;

drop policy if exists academy_trophies_select_own
on public.academy_trophies;

create policy academy_trophies_select_own
on public.academy_trophies
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists academy_trophies_insert_own
on public.academy_trophies;

create policy academy_trophies_insert_own
on public.academy_trophies
for insert
to authenticated
with check (auth.uid() = user_id);

do $$
begin
  if exists (
    select 1
    from pg_roles
    where rolname = 'parzi_app_runtime'
  ) then
    grant select, insert on table
      public.academy_diagnostic_attempts,
      public.academy_rewards,
      public.academy_trophies
    to parzi_app_runtime;
  end if;
end
$$;

commit;
