-- migration-024 — « Rejouer mes erreurs » : ferme la boucle de révision.
--
-- Jusqu'ici, une erreur du carnet (academy_error_notebook) ne pouvait jamais
-- être « résolue » : une bonne réponse ultérieure la passait au mieux en
-- « reviewing ». Ce RPC permet de rejouer UNE question ratée :
--   - correction 100 % serveur contre answer_key (jamais exposée avant réponse) ;
--   - trace dans academy_question_attempts (avec le niveau de certitude), ce qui
--     déclenche apply_academy_question_signal → maîtrise + file de révision ;
--   - bonne réponse  → erreur « resolved » (sort du carnet) ;
--   - mauvaise réponse → l'erreur reste ouverte, récurrence +1, revue demain ;
--     mauvaise réponse avec certitude « certain » → classée false_confidence.
-- Seules les erreurs ouvertes de l'utilisateur sont rejouables (pas de farming
-- de maîtrise sur une question déjà corrigée).
--
-- Additif, idempotent (create or replace). Aucune table modifiée.

begin;

create or replace function public.retry_academy_error(
  p_lesson_id text,
  p_question_index integer,
  p_answer integer,
  p_confidence text default 'unspecified'
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_definition public.academy_lesson_definitions%rowtype;
  v_error public.academy_error_notebook%rowtype;
  v_confidence text;
  v_correct_answer integer;
  v_is_correct boolean;
  v_competency_id text;
  v_remaining integer := 0;
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

  if p_question_index is null
    or p_question_index < 0
    or p_question_index >= v_definition.question_count
  then
    raise exception 'Question invalide';
  end if;

  if p_answer is null or p_answer < 0 then
    raise exception 'Réponse invalide';
  end if;

  select *
  into v_error
  from public.academy_error_notebook
  where user_id = v_user_id
    and lesson_id = p_lesson_id
    and question_index = p_question_index
    and status <> 'resolved';

  if not found then
    raise exception 'Aucune erreur ouverte pour cette question';
  end if;

  v_confidence := case
    when p_confidence in ('certain','rather_certain','hesitant','guess')
      then p_confidence
    else 'unspecified'
  end;

  v_correct_answer :=
    (v_definition.answer_key ->> p_question_index)::integer;
  v_is_correct := p_answer = v_correct_answer;

  select competency_id
  into v_competency_id
  from public.academy_question_definitions
  where lesson_id = p_lesson_id
    and question_index = p_question_index
    and active = true;

  v_competency_id := coalesce(v_competency_id, v_error.competency_id);

  -- Trace de la tentative. Le trigger academy_question_signal_trigger met à
  -- jour la maîtrise, le carnet (récurrence si raté) et la file de révision.
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
  values (
    v_user_id,
    null,
    p_lesson_id,
    p_question_index::smallint,
    v_competency_id,
    p_answer,
    v_is_correct,
    v_confidence,
    case
      when v_is_correct then null
      when v_confidence = 'certain' then 'false_confidence'
      else v_error.mistake_type
    end
  );

  if v_is_correct then
    update public.academy_error_notebook
    set
      status = 'resolved',
      resolved_at = now(),
      next_review_at = null,
      updated_at = now()
    where user_id = v_user_id
      and lesson_id = p_lesson_id
      and question_index = p_question_index;
  elsif v_competency_id is null then
    -- Sans compétence, le trigger ne fait rien : on tient le carnet à jour ici.
    update public.academy_error_notebook
    set
      recurrence_count = recurrence_count + 1,
      status = 'open',
      next_review_at = now() + interval '1 day',
      updated_at = now()
    where user_id = v_user_id
      and lesson_id = p_lesson_id
      and question_index = p_question_index;
  end if;

  select count(*)::integer
  into v_remaining
  from public.academy_error_notebook
  where user_id = v_user_id
    and status <> 'resolved';

  return jsonb_build_object(
    'correct', v_is_correct,
    'correctAnswer', v_correct_answer,
    'resolved', v_is_correct,
    'remainingErrors', v_remaining
  );
end;
$$;

revoke all on function
public.retry_academy_error(text, integer, integer, text)
from public, anon;

grant execute on function
public.retry_academy_error(text, integer, integer, text)
to authenticated;

commit;
