-- migration-025 — Jauge d'assurance (1 à 5) dans le quiz des leçons.
--
-- Avant : complete_academy_lesson ne recevait que les réponses ; chaque
-- question était tracée avec confidence = 'unspecified', donc le moteur de
-- révision ne distinguait jamais une bonne réponse « au hasard » d'une réponse
-- maîtrisée, ni une fausse certitude d'une simple erreur.
--
-- Cette migration :
--  1) ajoute academy_lesson_attempts.confidences (jsonb, tableau d'entiers 1..5) ;
--  2) remplace complete_academy_lesson(text, jsonb) par
--     complete_academy_lesson(text, jsonb, jsonb default null) — corps IDENTIQUE,
--     + validation et enregistrement des niveaux d'assurance. Les appels à 2
--     arguments restent valides (défaut null → 'unspecified', comme avant) ;
--  3) capture_academy_lesson_questions traduit le niveau en confidence
--     (5 certain · 4 rather_certain · 3/2 hesitant · 1 guess) ; une erreur à 5/5
--     est classée false_confidence.
-- Droits reproduits à l'identique (authenticated + service_role, jamais anon).

begin;

alter table public.academy_lesson_attempts
  add column if not exists confidences jsonb;

drop function if exists public.complete_academy_lesson(text, jsonb);

create or replace function public.complete_academy_lesson(
  p_lesson_id text,
  p_answers jsonb,
  p_confidences jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_user_id uuid := auth.uid();
  v_definition public.academy_lesson_definitions%rowtype;
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
    raise exception 'Utilisateur non authentifié' using errcode = '28000';
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
    or jsonb_array_length(p_answers) <> v_definition.question_count then
    raise exception 'Réponses de quiz invalides';
  end if;

  for v_index in 0..(v_definition.question_count - 1) loop
    if (p_answers ->> v_index) !~ '^-?[0-9]+$' then
      raise exception 'Réponse de quiz invalide';
    end if;

    if (p_answers ->> v_index)::integer =
       (v_definition.answer_key ->> v_index)::integer then
      v_correct := v_correct + 1;
    end if;
  end loop;

  if p_confidences is not null then
    if jsonb_typeof(p_confidences) <> 'array'
      or jsonb_array_length(p_confidences) <> v_definition.question_count then
      raise exception 'Niveaux d''assurance invalides';
    end if;

    for v_index in 0..(v_definition.question_count - 1) loop
      if (p_confidences ->> v_index) !~ '^[1-5]$' then
        raise exception 'Niveau d''assurance invalide';
      end if;
    end loop;
  end if;

  v_score := round(
    (v_correct::numeric / v_definition.question_count::numeric) * 100
  )::integer;

  insert into public.academy_lesson_attempts (
    user_id,
    lesson_id,
    score,
    answers,
    confidences
  )
  values (
    v_user_id,
    p_lesson_id,
    v_score,
    p_answers,
    p_confidences
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
      v_lesson_xp := v_lesson_xp + 30;
    end if;

    if v_score >= 100 then
      v_lesson_xp := v_lesson_xp + 15;
    end if;

    v_xp_gained := v_xp_gained + v_lesson_xp;
  end if;

  v_diagnostic_attempt_id :=
    public.ensure_academy_study_plan_rows(v_user_id);

  if v_score >= 70 and v_diagnostic_attempt_id is not null then
    select plan_day.day_number
    into v_plan_day_number
    from public.academy_study_plan_days as plan_day
    where plan_day.user_id = v_user_id
      and plan_day.diagnostic_attempt_id = v_diagnostic_attempt_id
      and plan_day.status = 'pending'
      and plan_day.recommended_lesson_id = p_lesson_id
      and not exists (
        select 1
        from public.academy_study_plan_days as earlier_day
        where earlier_day.user_id = plan_day.user_id
          and earlier_day.diagnostic_attempt_id = plan_day.diagnostic_attempt_id
          and earlier_day.day_number < plan_day.day_number
          and earlier_day.status <> 'completed'
      )
    order by plan_day.day_number
    limit 1;

    if found then
      v_plan_xp := 5;

      update public.academy_study_plan_days
      set
        status = 'completed',
        completed_lesson_attempt_id = v_lesson_attempt_id,
        completed_at = now(),
        xp_awarded = v_plan_xp
      where user_id = v_user_id
        and diagnostic_attempt_id = v_diagnostic_attempt_id
        and day_number = v_plan_day_number
        and status = 'pending';

      v_xp_gained := v_xp_gained + v_plan_xp;
    end if;
  end if;

  if v_xp_gained > 0 then
    if v_last_active = current_date then
      v_new_streak := greatest(v_streak, 1);
    elsif v_last_active = current_date - 1 then
      v_new_streak := v_streak + 1;
    else
      v_new_streak := 1;
    end if;

    v_new_best := greatest(v_best_streak, v_new_streak);

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
      xp = public.academy_progress.xp + excluded.xp,
      streak = excluded.streak,
      best_streak = greatest(
        public.academy_progress.best_streak,
        excluded.best_streak
      ),
      last_active = excluded.last_active,
      updated_at = now()
    returning xp, streak
    into v_total_xp, v_new_streak;
  else
    v_total_xp := v_previous_xp;
    v_new_streak := v_streak;
  end if;

  return jsonb_build_object(
    'already', v_already,
    'xpGained', v_xp_gained,
    'lessonXpGained', case when v_already then 0 else v_lesson_xp end,
    'planXpAwarded', v_plan_xp,
    'planDayCompleted', v_plan_day_number is not null,
    'planDayNumber', v_plan_day_number,
    'score', v_score,
    'previousXp', v_previous_xp,
    'totalXp', v_total_xp,
    'streak', v_new_streak
  );
end;
$function$;

revoke all on function
public.complete_academy_lesson(text, jsonb, jsonb)
from public, anon;

grant execute on function
public.complete_academy_lesson(text, jsonb, jsonb)
to authenticated, service_role;

create or replace function
public.capture_academy_lesson_questions()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_definition
    public.academy_lesson_definitions%rowtype;
begin
  select *
  into v_definition
  from public.academy_lesson_definitions
  where lesson_id = new.lesson_id
    and active = true;

  if not found then
    return new;
  end if;

  insert into public.academy_question_attempts (
    user_id,
    lesson_attempt_id,
    lesson_id,
    question_index,
    competency_id,
    selected_answer,
    is_correct,
    confidence,
    mistake_type
  )
  select
    new.user_id,
    new.id,
    new.lesson_id,
    question.number::smallint,
    definition.competency_id,
    (new.answers ->> question.number)::integer,
    (new.answers ->> question.number)::integer =
      (v_definition.answer_key ->> question.number)::integer,
    case new.confidences ->> question.number
      when '5' then 'certain'
      when '4' then 'rather_certain'
      when '3' then 'hesitant'
      when '2' then 'hesitant'
      when '1' then 'guess'
      else 'unspecified'
    end,
    case
      when (new.answers ->> question.number)::integer <>
        (v_definition.answer_key ->> question.number)::integer
      then
        case
          when new.confidences ->> question.number = '5'
            then 'false_confidence'
          else 'unclassified'
        end
      else null
    end
  from generate_series(
    0,
    v_definition.question_count - 1
  ) as question(number)
  left join public.academy_question_definitions
    as definition
    on definition.lesson_id = new.lesson_id
    and definition.question_index = question.number
    and definition.active = true
  on conflict (lesson_attempt_id, question_index)
  do nothing;

  return new;
end;
$$;

revoke all on function
public.capture_academy_lesson_questions()
from public, anon, authenticated;

commit;
