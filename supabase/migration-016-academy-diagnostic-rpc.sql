begin;

drop policy if exists
  academy_diagnostic_attempts_select_own
on public.academy_diagnostic_attempts;

create policy academy_diagnostic_attempts_select_own
on public.academy_diagnostic_attempts
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists
  academy_diagnostic_attempts_insert_own
on public.academy_diagnostic_attempts;

create policy academy_diagnostic_attempts_insert_own
on public.academy_diagnostic_attempts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists academy_rewards_select_own
on public.academy_rewards;

create policy academy_rewards_select_own
on public.academy_rewards
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists academy_rewards_insert_own
on public.academy_rewards;

create policy academy_rewards_insert_own
on public.academy_rewards
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists academy_trophies_select_own
on public.academy_trophies;

create policy academy_trophies_select_own
on public.academy_trophies
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists academy_trophies_insert_own
on public.academy_trophies;

create policy academy_trophies_insert_own
on public.academy_trophies
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create or replace function public.complete_academy_diagnostic(
  p_attempt_id uuid,
  p_score_percent integer,
  p_correct_count integer,
  p_question_count integer,
  p_points_earned integer,
  p_points_possible integer,
  p_elapsed_seconds integer,
  p_overconfidence_errors integer,
  p_slow_answers integer,
  p_unanswered_questions integer,
  p_section_results jsonb,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_xp_awarded integer := 0;
  v_total_xp integer := 0;
  v_trophy_unlocked text := null;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifié'
      using errcode = '28000';
  end if;

  insert into public.academy_rewards (
    user_id,
    reward_key,
    xp
  )
  values (
    v_user_id,
    'academy-diagnostic-module-00-complete-v1',
    100
  )
  on conflict (user_id, reward_key)
  do nothing
  returning xp into v_xp_awarded;

  v_xp_awarded := coalesce(v_xp_awarded, 0);

  if v_xp_awarded > 0 then
    insert into public.academy_progress (
      user_id,
      xp,
      updated_at
    )
    values (
      v_user_id,
      v_xp_awarded,
      now()
    )
    on conflict (user_id)
    do update set
      xp = public.academy_progress.xp + excluded.xp,
      updated_at = now();
  end if;

  insert into public.academy_trophies (
    user_id,
    trophy_id,
    metadata
  )
  values (
    v_user_id,
    'starting-point',
    jsonb_build_object(
      'name', 'Point de départ',
      'module', 'module-00-diagnostic'
    )
  )
  on conflict (user_id, trophy_id)
  do nothing
  returning trophy_id into v_trophy_unlocked;

  insert into public.academy_diagnostic_attempts (
    id,
    user_id,
    score_percent,
    correct_count,
    question_count,
    points_earned,
    points_possible,
    elapsed_seconds,
    overconfidence_errors,
    slow_answers,
    unanswered_questions,
    section_results,
    answers,
    xp_awarded
  )
  values (
    p_attempt_id,
    v_user_id,
    p_score_percent,
    p_correct_count,
    p_question_count,
    p_points_earned,
    p_points_possible,
    greatest(p_elapsed_seconds, 0),
    greatest(p_overconfidence_errors, 0),
    greatest(p_slow_answers, 0),
    greatest(p_unanswered_questions, 0),
    coalesce(p_section_results, '[]'::jsonb),
    coalesce(p_answers, '[]'::jsonb),
    v_xp_awarded
  );

  select xp
  into v_total_xp
  from public.academy_progress
  where user_id = v_user_id;

  return jsonb_build_object(
    'persisted', true,
    'attemptId', p_attempt_id,
    'xpAwarded', v_xp_awarded,
    'totalXp', coalesce(v_total_xp, 0),
    'trophyUnlocked', v_trophy_unlocked
  );
end;
$$;

revoke all on function
  public.complete_academy_diagnostic(
    uuid,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    jsonb,
    jsonb
  )
from public, anon;

grant execute on function
  public.complete_academy_diagnostic(
    uuid,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    jsonb,
    jsonb
  )
to authenticated;

commit;
