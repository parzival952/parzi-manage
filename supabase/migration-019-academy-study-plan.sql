begin;

create table if not exists public.academy_lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id) on delete cascade,
  lesson_id text not null,
  score integer not null
    check (score between 0 and 100),
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists
  academy_lesson_attempts_user_created_idx
on public.academy_lesson_attempts (
  user_id,
  created_at desc
);

alter table public.academy_lesson_attempts
  enable row level security;

drop policy if exists
  academy_lesson_attempts_select_own
on public.academy_lesson_attempts;

create policy academy_lesson_attempts_select_own
on public.academy_lesson_attempts
for select
to authenticated
using ((select auth.uid()) = user_id);

create table if not exists
  public.academy_study_plan_days (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
      references auth.users(id)
      on delete cascade,

    diagnostic_attempt_id uuid not null
      references public.academy_diagnostic_attempts(id)
      on delete cascade,

    day_number smallint not null
      check (day_number between 1 and 14),

    focus_section_id text not null,
    focus_label text not null,
    recommended_lesson_id text not null,
    activity text not null,
    scheduled_date date not null,

    status text not null default 'pending'
      check (
        status in ('pending', 'completed')
      ),

    completed_lesson_attempt_id uuid
      references public.academy_lesson_attempts(id)
      on delete set null,

    completed_at timestamptz,

    xp_awarded integer not null default 0
      check (xp_awarded >= 0),

    created_at timestamptz not null default now(),

    unique (
      user_id,
      diagnostic_attempt_id,
      day_number
    )
  );

create index if not exists
  academy_study_plan_days_user_attempt_idx
on public.academy_study_plan_days (
  user_id,
  diagnostic_attempt_id,
  day_number
);

alter table public.academy_study_plan_days
  enable row level security;

drop policy if exists
  academy_study_plan_days_select_own
on public.academy_study_plan_days;

create policy academy_study_plan_days_select_own
on public.academy_study_plan_days
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function
public.ensure_academy_study_plan_rows(
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempt_id uuid;
  v_attempt_created_at timestamptz;
  v_section_results jsonb;
begin
  select
    id,
    created_at,
    section_results
  into
    v_attempt_id,
    v_attempt_created_at,
    v_section_results
  from public.academy_diagnostic_attempts
  where user_id = p_user_id
  order by created_at desc
  limit 1;

  if not found then
    return null;
  end if;

  with ranked_priorities as (
    select
      row_number() over (
        order by
          coalesce(
            (section ->> 'scorePercent')::integer,
            0
          ) asc,
          section ->> 'id' asc
      ) as priority_rank,

      section ->> 'id' as section_id,

      coalesce(
        section ->> 'label',
        section ->> 'id'
      ) as section_label

    from jsonb_array_elements(
      v_section_results
    ) as section
  ),

  selected_priorities as (
    select *
    from ranked_priorities
    where priority_rank <= 3
  ),

  generated_days as (
    select
      day_number,
      ((day_number - 1) % 3) + 1
        as priority_rank,
      ((day_number - 1) % 7) + 1
        as activity_rank
    from generate_series(1, 14)
      as day_number
  )

  insert into public.academy_study_plan_days (
    user_id,
    diagnostic_attempt_id,
    day_number,
    focus_section_id,
    focus_label,
    recommended_lesson_id,
    activity,
    scheduled_date
  )

  select
    p_user_id,
    v_attempt_id,
    generated_days.day_number,
    selected_priorities.section_id,
    selected_priorities.section_label,

    case selected_priorities.section_id
      when 'legal-reading'
        then 'licence'
      when 'contracts'
        then 'mandat'
      when 'sport-environment'
        then 'role'
      when 'football-regulations'
        then 'licence'
      when 'practical-cases'
        then 'mandat'
      when 'exam-method'
        then 'role'
      else 'role'
    end,

    case generated_days.activity_rank
      when 1 then
        'Comprendre la règle et la reformuler avec tes propres mots.'
      when 2 then
        'Étudier deux exemples corrects et un contre-exemple.'
      when 3 then
        'Résoudre un cas pratique guidé.'
      when 4 then
        'Faire un quiz court puis analyser chaque erreur.'
      when 5 then
        'Refaire les questions difficiles sans consulter la correction.'
      when 6 then
        'Travailler sous chronomètre et vérifier la méthode utilisée.'
      else
        'Effectuer une révision espacée et résumer les acquis.'
    end,

    v_attempt_created_at::date
      + (generated_days.day_number - 1)

  from generated_days

  join selected_priorities
    on selected_priorities.priority_rank
      = generated_days.priority_rank

  on conflict (
    user_id,
    diagnostic_attempt_id,
    day_number
  )
  do nothing;

  update public.academy_study_plan_days
    as plan_day

  set
    status = 'completed',
    completed_at = academy_done.created_at,
    xp_awarded = 0

  from public.academy_done

  where plan_day.user_id = p_user_id
    and plan_day.diagnostic_attempt_id
      = v_attempt_id
    and plan_day.day_number = 1
    and plan_day.status = 'pending'
    and academy_done.user_id = p_user_id
    and academy_done.lesson_id
      = plan_day.recommended_lesson_id;

  return v_attempt_id;
end;
$$;

revoke all on function
  public.ensure_academy_study_plan_rows(uuid)
from public, anon, authenticated;

create or replace function
public.get_academy_study_plan()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt_id uuid;
  v_current_day integer;
  v_completed_count integer := 0;
  v_days jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifié'
      using errcode = '28000';
  end if;

  v_attempt_id :=
    public.ensure_academy_study_plan_rows(
      v_user_id
    );

  if v_attempt_id is null then
    return jsonb_build_object(
      'found', false,
      'diagnosticAttemptId', null,
      'completedCount', 0,
      'currentDay', null,
      'totalDays', 14,
      'days', '[]'::jsonb
    );
  end if;

  select min(day_number)
  into v_current_day
  from public.academy_study_plan_days
  where user_id = v_user_id
    and diagnostic_attempt_id = v_attempt_id
    and status = 'pending';

  select count(*)::integer
  into v_completed_count
  from public.academy_study_plan_days
  where user_id = v_user_id
    and diagnostic_attempt_id = v_attempt_id
    and status = 'completed';

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'day',
          plan_day.day_number,

        'focusSectionId',
          plan_day.focus_section_id,

        'focus',
          plan_day.focus_label,

        'recommendedLessonId',
          plan_day.recommended_lesson_id,

        'activity',
          plan_day.activity,

        'scheduledDate',
          plan_day.scheduled_date,

        'status',
          plan_day.status,

        'completedAt',
          plan_day.completed_at,

        'xpAwarded',
          plan_day.xp_awarded,

        'isUnlocked',
          plan_day.status = 'completed'
          or plan_day.day_number
            = v_current_day,

        'isCurrent',
          plan_day.status = 'pending'
          and plan_day.day_number
            = v_current_day
      )
      order by plan_day.day_number
    ),
    '[]'::jsonb
  )
  into v_days
  from public.academy_study_plan_days
    as plan_day
  where plan_day.user_id = v_user_id
    and plan_day.diagnostic_attempt_id
      = v_attempt_id;

  return jsonb_build_object(
    'found', true,
    'diagnosticAttemptId', v_attempt_id,
    'completedCount', v_completed_count,
    'currentDay', v_current_day,
    'totalDays', 14,
    'days', v_days
  );
end;
$$;

revoke all on function
  public.get_academy_study_plan()
from public, anon;

grant execute on function
  public.get_academy_study_plan()
to authenticated;

create or replace function
public.complete_academy_lesson(
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

  v_lesson_attempt_id uuid;
  v_diagnostic_attempt_id uuid;
  v_plan_day_number integer;

  v_index integer;
  v_correct integer := 0;
  v_score integer := 0;

  v_lesson_xp integer := 15;
  v_plan_xp integer := 0;
  v_xp_gained integer := 0;

  v_previous_xp integer := 0;
  v_total_xp integer := 0;

  v_streak integer := 0;
  v_best_streak integer := 0;
  v_last_active date;

  v_new_streak integer := 0;
  v_new_best integer := 0;

  v_already boolean := false;
  v_existing_score integer;
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
    raise exception
      'Leçon inconnue ou inactive';
  end if;

  if jsonb_typeof(p_answers) <> 'array'
    or jsonb_array_length(p_answers)
      <> v_definition.question_count
  then
    raise exception
      'Réponses de quiz invalides';
  end if;

  for v_index in
    0..(v_definition.question_count - 1)
  loop
    if (p_answers ->> v_index)
      !~ '^-?[0-9]+$'
    then
      raise exception
        'Réponse de quiz invalide';
    end if;

    if
      (p_answers ->> v_index)::integer
      =
      (
        v_definition.answer_key
        ->> v_index
      )::integer
    then
      v_correct := v_correct + 1;
    end if;
  end loop;

  v_score := round(
    (
      v_correct::numeric
      / v_definition.question_count::numeric
    ) * 100
  )::integer;

  insert into public.academy_lesson_attempts (
    user_id,
    lesson_id,
    score,
    answers
  )
  values (
    v_user_id,
    p_lesson_id,
    v_score,
    p_answers
  )
  returning id into v_lesson_attempt_id;

  select score
  into v_existing_score
  from public.academy_done
  where user_id = v_user_id
    and lesson_id = p_lesson_id;

  if found then
    v_already := true;

    update public.academy_done
    set score = greatest(score, v_score)
    where user_id = v_user_id
      and lesson_id = p_lesson_id;
  else
    insert into public.academy_done (
      user_id,
      lesson_id,
      score
    )
    values (
      v_user_id,
      p_lesson_id,
      v_score
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

  if not v_already then
    if v_score >= 70 then
      v_lesson_xp :=
        v_lesson_xp + 30;
    end if;

    if v_score >= 100 then
      v_lesson_xp :=
        v_lesson_xp + 15;
    end if;

    v_xp_gained :=
      v_xp_gained + v_lesson_xp;
  end if;

  v_diagnostic_attempt_id :=
    public.ensure_academy_study_plan_rows(
      v_user_id
    );

  if
    v_score >= 70
    and v_diagnostic_attempt_id is not null
  then
    select plan_day.day_number
    into v_plan_day_number
    from public.academy_study_plan_days
      as plan_day

    where plan_day.user_id = v_user_id

      and plan_day.diagnostic_attempt_id
        = v_diagnostic_attempt_id

      and plan_day.status = 'pending'

      and plan_day.recommended_lesson_id
        = p_lesson_id

      and not exists (
        select 1
        from public.academy_study_plan_days
          as earlier_day

        where earlier_day.user_id
            = plan_day.user_id

          and earlier_day.diagnostic_attempt_id
            = plan_day.diagnostic_attempt_id

          and earlier_day.day_number
            < plan_day.day_number

          and earlier_day.status
            <> 'completed'
      )

    order by plan_day.day_number
    limit 1;

    if found then
      v_plan_xp := 5;

      update public.academy_study_plan_days
      set
        status = 'completed',
        completed_lesson_attempt_id =
          v_lesson_attempt_id,
        completed_at = now(),
        xp_awarded = v_plan_xp

      where user_id = v_user_id

        and diagnostic_attempt_id
          = v_diagnostic_attempt_id

        and day_number
          = v_plan_day_number

        and status = 'pending';

      v_xp_gained :=
        v_xp_gained + v_plan_xp;
    end if;
  end if;

  if v_xp_gained > 0 then
    if v_last_active = current_date then
      v_new_streak :=
        greatest(v_streak, 1);

    elsif
      v_last_active = current_date - 1
    then
      v_new_streak := v_streak + 1;

    else
      v_new_streak := 1;
    end if;

    v_new_best :=
      greatest(
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
        public.academy_progress.xp
        + excluded.xp,

      streak =
        excluded.streak,

      best_streak =
        greatest(
          public.academy_progress.best_streak,
          excluded.best_streak
        ),

      last_active =
        excluded.last_active,

      updated_at = now()

    returning xp, streak
    into
      v_total_xp,
      v_new_streak;

  else
    v_total_xp := v_previous_xp;
    v_new_streak := v_streak;
  end if;

  return jsonb_build_object(
    'already',
      v_already,

    'xpGained',
      v_xp_gained,

    'lessonXpGained',
      case
        when v_already then 0
        else v_lesson_xp
      end,

    'planXpAwarded',
      v_plan_xp,

    'planDayCompleted',
      v_plan_day_number is not null,

    'planDayNumber',
      v_plan_day_number,

    'score',
      v_score,

    'previousXp',
      v_previous_xp,

    'totalXp',
      v_total_xp,

    'streak',
      v_new_streak
  );
end;
$$;

revoke all on function
  public.complete_academy_lesson(
    text,
    jsonb
  )
from public, anon;

grant execute on function
  public.complete_academy_lesson(
    text,
    jsonb
  )
to authenticated;

commit;
