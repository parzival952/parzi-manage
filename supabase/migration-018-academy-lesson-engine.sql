begin;

create table if not exists public.academy_lesson_definitions (
  lesson_id text primary key,
  answer_key jsonb not null,
  question_count integer not null
    check (question_count > 0),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.academy_lesson_definitions
  enable row level security;

insert into public.academy_lesson_definitions (
  lesson_id,
  answer_key,
  question_count,
  active
)
values
  ('role', '[1,1]'::jsonb, 2, true),
  ('licence', '[1,2]'::jsonb, 2, true),
  ('mandat', '[1,1]'::jsonb, 2, true),
  ('approche', '[1,1]'::jsonb, 2, true),
  ('negociation', '[1,1]'::jsonb, 2, true)
on conflict (lesson_id)
do update set
  answer_key = excluded.answer_key,
  question_count = excluded.question_count,
  active = excluded.active,
  updated_at = now();

create or replace function public.get_academy_state()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_progress public.academy_progress%rowtype;
  v_done jsonb := '[]'::jsonb;
  v_today_lessons integer := 0;
  v_today_perfect integer := 0;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifié'
      using errcode = '28000';
  end if;

  select *
  into v_progress
  from public.academy_progress
  where user_id = v_user_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'lessonId', lesson_id,
        'score', score,
        'createdAt', created_at
      )
      order by created_at asc
    ),
    '[]'::jsonb
  )
  into v_done
  from public.academy_done
  where user_id = v_user_id;

  select
    count(*)::integer,
    count(*) filter (
      where score >= 100
    )::integer
  into
    v_today_lessons,
    v_today_perfect
  from public.academy_done
  where user_id = v_user_id
    and created_at::date = current_date;

  return jsonb_build_object(
    'xp', coalesce(v_progress.xp, 0),
    'streak', coalesce(v_progress.streak, 0),
    'bestStreak',
      coalesce(v_progress.best_streak, 0),
    'lastActive',
      coalesce(v_progress.last_active::text, ''),
    'done', v_done,
    'todayLessons',
      coalesce(v_today_lessons, 0),
    'todayPerfect',
      coalesce(v_today_perfect, 0)
  );
end;
$$;

revoke all on function
  public.get_academy_state()
from public, anon;

grant execute on function
  public.get_academy_state()
to authenticated;

create or replace function public.complete_academy_lesson(
  p_lesson_id text,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_definition
    public.academy_lesson_definitions%rowtype;
  v_index integer;
  v_correct integer := 0;
  v_score integer := 0;
  v_xp_gained integer := 15;
  v_previous_xp integer := 0;
  v_total_xp integer := 0;
  v_streak integer := 0;
  v_best_streak integer := 0;
  v_last_active date;
  v_new_streak integer := 1;
  v_new_best integer := 1;
  v_inserted boolean := false;
  v_existing_score integer := 0;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifié'
      using errcode = '28000';
  end if;

  select *
  into v_definition
  from public.academy_lesson_definitions
  where lesson_id = p_lesson_id
    and active = true;

  if not found then
    raise exception 'Leçon inconnue ou inactive';
  end if;

  if jsonb_typeof(p_answers) <> 'array'
    or jsonb_array_length(p_answers) <>
      v_definition.question_count then
    raise exception 'Réponses de quiz invalides';
  end if;

  for v_index in
    0..(v_definition.question_count - 1)
  loop
    if (p_answers ->> v_index) !~
      '^-?[0-9]+$' then
      raise exception 'Réponse de quiz invalide';
    end if;

    if (p_answers ->> v_index)::integer =
      (v_definition.answer_key ->>
        v_index)::integer then
      v_correct := v_correct + 1;
    end if;
  end loop;

  v_score := round(
    (
      v_correct::numeric /
      v_definition.question_count::numeric
    ) * 100
  )::integer;

  if v_score >= 70 then
    v_xp_gained := v_xp_gained + 30;
  end if;

  if v_score >= 100 then
    v_xp_gained := v_xp_gained + 15;
  end if;

  insert into public.academy_done (
    user_id,
    lesson_id,
    score
  )
  values (
    v_user_id,
    p_lesson_id,
    v_score
  )
  on conflict (user_id, lesson_id)
  do nothing
  returning true into v_inserted;

  if not coalesce(v_inserted, false) then
    select score
    into v_existing_score
    from public.academy_done
    where user_id = v_user_id
      and lesson_id = p_lesson_id;

    select
      coalesce(xp, 0),
      coalesce(streak, 0)
    into
      v_total_xp,
      v_streak
    from public.academy_progress
    where user_id = v_user_id;

    return jsonb_build_object(
      'already', true,
      'xpGained', 0,
      'score',
        coalesce(v_existing_score, v_score),
      'previousXp',
        coalesce(v_total_xp, 0),
      'totalXp',
        coalesce(v_total_xp, 0),
      'streak',
        coalesce(v_streak, 0)
    );
  end if;

  select
    coalesce(xp, 0),
    coalesce(streak, 0),
    coalesce(best_streak, 0),
    last_active
  into
    v_previous_xp,
    v_streak,
    v_best_streak,
    v_last_active
  from public.academy_progress
  where user_id = v_user_id;

  if not found then
    v_previous_xp := 0;
    v_streak := 0;
    v_best_streak := 0;
    v_last_active := null;
  end if;

  if v_last_active = current_date then
    v_new_streak := greatest(v_streak, 1);
  elsif v_last_active = current_date - 1 then
    v_new_streak := v_streak + 1;
  else
    v_new_streak := 1;
  end if;

  v_new_best := greatest(
    v_best_streak,
    v_new_streak
  );

  insert into public.academy_progress (
    user_id,
    xp,
    streak,
    best_streak,
    last_active,
    updated_at
  )
  values (
    v_user_id,
    v_xp_gained,
    v_new_streak,
    v_new_best,
    current_date,
    now()
  )
  on conflict (user_id)
  do update set
    xp =
      public.academy_progress.xp +
      excluded.xp,
    streak = excluded.streak,
    best_streak = greatest(
      public.academy_progress.best_streak,
      excluded.best_streak
    ),
    last_active = excluded.last_active,
    updated_at = now()
  returning xp into v_total_xp;

  return jsonb_build_object(
    'already', false,
    'xpGained', v_xp_gained,
    'score', v_score,
    'previousXp', v_previous_xp,
    'totalXp', v_total_xp,
    'streak', v_new_streak
  );
end;
$$;

revoke all on function
  public.complete_academy_lesson(text, jsonb)
from public, anon;

grant execute on function
  public.complete_academy_lesson(text, jsonb)
to authenticated;

commit;
