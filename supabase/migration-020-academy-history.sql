begin;

create or replace function public.get_academy_history(
  p_limit integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();

  v_limit integer :=
    greatest(
      1,
      least(coalesce(p_limit, 50), 100)
    );

  v_progress public.academy_progress%rowtype;

  v_completed_lessons integer := 0;
  v_perfect_lessons integer := 0;
  v_completed_plan_days integer := 0;
  v_total_attempts integer := 0;

  v_events jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception
      'Utilisateur non authentifié'
      using errcode = '28000';
  end if;

  select *
  into v_progress
  from public.academy_progress
  where user_id = v_user_id;

  select
    count(*)::integer,
    count(*) filter (
      where score >= 100
    )::integer
  into
    v_completed_lessons,
    v_perfect_lessons
  from public.academy_done
  where user_id = v_user_id;

  select count(*)::integer
  into v_completed_plan_days
  from public.academy_study_plan_days
  where user_id = v_user_id
    and status = 'completed';

  select count(*)::integer
  into v_total_attempts
  from public.academy_lesson_attempts
  where user_id = v_user_id;

  with ranked_attempts as (
    select
      attempt.*,

      row_number() over (
        partition by attempt.lesson_id
        order by
          attempt.created_at asc,
          attempt.id asc
      ) as attempt_rank

    from public.academy_lesson_attempts
      as attempt

    where attempt.user_id = v_user_id
  ),

  history_events as (
    select
      'diagnostic'::text
        as event_type,

      diagnostic.id::text
        as event_id,

      diagnostic.created_at,

      null::text
        as lesson_id,

      diagnostic.score_percent
        as score,

      coalesce(
        diagnostic.xp_awarded,
        0
      ) as xp_gained,

      null::integer
        as plan_day_number,

      null::text
        as plan_focus,

      false
        as is_retry,

      diagnostic.question_count,
      diagnostic.correct_count

    from public.academy_diagnostic_attempts
      as diagnostic

    where diagnostic.user_id = v_user_id
      and diagnostic.status = 'completed'

    union all

    select
      'lesson'::text
        as event_type,

      attempt.id::text
        as event_id,

      attempt.created_at,
      attempt.lesson_id,
      attempt.score,

      (
        case
          when attempt.attempt_rank = 1
          then
            15
            + case
                when attempt.score >= 70
                then 30
                else 0
              end
            + case
                when attempt.score >= 100
                then 15
                else 0
              end
          else 0
        end

        + coalesce(
            plan_day.xp_awarded,
            0
          )
      )::integer
        as xp_gained,

      plan_day.day_number::integer
        as plan_day_number,

      plan_day.focus_label
        as plan_focus,

      attempt.attempt_rank > 1
        as is_retry,

      definition.question_count,

      round(
        definition.question_count::numeric
        * attempt.score::numeric
        / 100
      )::integer
        as correct_count

    from ranked_attempts
      as attempt

    join public.academy_lesson_definitions
      as definition
      on definition.lesson_id =
        attempt.lesson_id

    left join public.academy_study_plan_days
      as plan_day
      on plan_day.user_id =
        attempt.user_id
      and plan_day.completed_lesson_attempt_id =
        attempt.id

    union all

    select
      'lesson'::text
        as event_type,

      ('legacy-' || done.lesson_id)::text
        as event_id,

      done.created_at,
      done.lesson_id,
      done.score,

      (
        15
        + case
            when done.score >= 70
            then 30
            else 0
          end
        + case
            when done.score >= 100
            then 15
            else 0
          end
        + coalesce(
            plan_day.xp_awarded,
            0
          )
      )::integer
        as xp_gained,

      plan_day.day_number::integer
        as plan_day_number,

      plan_day.focus_label
        as plan_focus,

      false
        as is_retry,

      definition.question_count,

      round(
        definition.question_count::numeric
        * done.score::numeric
        / 100
      )::integer
        as correct_count

    from public.academy_done
      as done

    join public.academy_lesson_definitions
      as definition
      on definition.lesson_id =
        done.lesson_id

    left join lateral (
      select candidate.*
      from public.academy_study_plan_days
        as candidate

      where candidate.user_id =
          done.user_id

        and candidate.recommended_lesson_id =
          done.lesson_id

        and candidate.status =
          'completed'

        and candidate.completed_lesson_attempt_id
          is null

      order by candidate.day_number asc
      limit 1
    ) as plan_day
      on true

    where done.user_id = v_user_id

      and not exists (
        select 1
        from public.academy_lesson_attempts
          as existing_attempt

        where existing_attempt.user_id =
            done.user_id

          and existing_attempt.lesson_id =
            done.lesson_id
      )
  ),

  limited_events as (
    select *
    from history_events

    order by
      created_at desc,
      event_id desc

    limit v_limit
  )

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'type',
          event_type,

        'id',
          event_id,

        'createdAt',
          created_at,

        'lessonId',
          lesson_id,

        'score',
          score,

        'xpGained',
          xp_gained,

        'planDayNumber',
          plan_day_number,

        'planFocus',
          plan_focus,

        'isRetry',
          is_retry,

        'questionCount',
          question_count,

        'correctCount',
          correct_count
      )

      order by
        created_at desc,
        event_id desc
    ),

    '[]'::jsonb
  )
  into v_events
  from limited_events;

  return jsonb_build_object(
    'xp',
      coalesce(v_progress.xp, 0),

    'streak',
      coalesce(v_progress.streak, 0),

    'bestStreak',
      coalesce(v_progress.best_streak, 0),

    'completedLessons',
      coalesce(v_completed_lessons, 0),

    'perfectLessons',
      coalesce(v_perfect_lessons, 0),

    'completedPlanDays',
      coalesce(v_completed_plan_days, 0),

    'totalAttempts',
      coalesce(v_total_attempts, 0),

    'events',
      v_events
  );
end;
$$;

revoke all on function
  public.get_academy_history(integer)
from public, anon;

grant execute on function
  public.get_academy_history(integer)
to authenticated;

commit;
