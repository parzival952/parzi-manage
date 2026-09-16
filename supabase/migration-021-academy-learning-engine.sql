begin;

create table if not exists public.academy_competencies (
  competency_id text primary key,
  title text not null,
  domain text not null,
  jurisdiction text not null,
  target_level smallint not null
    check (target_level between 1 and 5),
  criticality text not null
    check (criticality in ('C1','C2','C3','C4')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists
public.academy_lesson_competencies (
  lesson_id text not null
    references public.academy_lesson_definitions(lesson_id)
    on delete cascade,
  competency_id text not null
    references public.academy_competencies(competency_id)
    on delete cascade,
  weight numeric(4,3) not null default 1
    check (weight > 0 and weight <= 1),
  primary key (lesson_id, competency_id)
);

create table if not exists
public.academy_user_competency_mastery (
  user_id uuid not null
    references auth.users(id) on delete cascade,
  competency_id text not null
    references public.academy_competencies(competency_id),
  mastery_score numeric(5,2) not null default 0
    check (mastery_score between 0 and 100),
  status text not null default 'not_started'
    check (status in (
      'not_started','fragile','developing',
      'operational','mastered','review_due'
    )),
  attempts_count integer not null default 0,
  correct_count integer not null default 0,
  false_confidence_count integer not null default 0,
  last_practiced_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, competency_id)
);

alter table public.academy_user_competency_mastery
  enable row level security;

drop policy if exists academy_mastery_select_own
on public.academy_user_competency_mastery;

create policy academy_mastery_select_own
on public.academy_user_competency_mastery
for select to authenticated
using ((select auth.uid()) = user_id);

create table if not exists
public.academy_question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id) on delete cascade,
  lesson_attempt_id uuid
    references public.academy_lesson_attempts(id)
    on delete cascade,
  lesson_id text not null,
  question_index smallint not null
    check (question_index >= 0),
  competency_id text
    references public.academy_competencies(competency_id),
  selected_answer integer,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

alter table public.academy_question_attempts
  add column if not exists confidence text
  not null default 'unspecified'
  check (confidence in (
    'certain',
    'rather_certain',
    'hesitant',
    'guess',
    'unspecified'
  ));

alter table public.academy_question_attempts
  add column if not exists response_time_ms integer
  check (response_time_ms is null or response_time_ms >= 0);

alter table public.academy_question_attempts
  add column if not exists mistake_type text
  check (
    mistake_type is null
    or mistake_type in (
      'unknown_rule',
      'confusion',
      'forgotten_exception',
      'misreading',
      'incomplete_reasoning',
      'rushed_answer',
      'false_confidence'
    )
  );

create index if not exists
academy_question_attempts_user_created_idx
on public.academy_question_attempts (
  user_id,
  created_at desc
);

create index if not exists
academy_question_attempts_competency_idx
on public.academy_question_attempts (
  user_id,
  competency_id
);

create unique index if not exists
academy_question_attempts_unique_question_idx
on public.academy_question_attempts (
  lesson_attempt_id,
  question_index
);

alter table public.academy_question_attempts
  enable row level security;

create policy academy_question_attempts_select_own
on public.academy_question_attempts
for select to authenticated
using ((select auth.uid()) = user_id);

create table if not exists
public.academy_error_notebook (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id) on delete cascade,
  question_attempt_id uuid not null unique
    references public.academy_question_attempts(id)
    on delete cascade,
  competency_id text
    references public.academy_competencies(competency_id),
  lesson_id text not null,
  question_index smallint not null,
  mistake_type text not null,
  recurrence_count integer not null default 1,
  status text not null default 'open'
    check (status in ('open','reviewing','resolved')),
  next_review_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.academy_error_notebook
  enable row level security;

create policy academy_error_notebook_select_own
on public.academy_error_notebook
for select to authenticated
using ((select auth.uid()) = user_id);

create index if not exists
academy_error_notebook_user_status_idx
on public.academy_error_notebook (
  user_id,
  status,
  next_review_at
);

create table if not exists
public.academy_review_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id) on delete cascade,
  competency_id text not null
    references public.academy_competencies(competency_id),
  error_id uuid
    references public.academy_error_notebook(id)
    on delete cascade,
  scheduled_for timestamptz not null,
  interval_days smallint not null default 1
    check (interval_days between 1 and 365),
  priority smallint not null default 50
    check (priority between 1 and 100),
  status text not null default 'pending'
    check (status in (
      'pending','completed','snoozed','cancelled'
    )),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.academy_review_queue
  enable row level security;

create policy academy_review_queue_select_own
on public.academy_review_queue
for select to authenticated
using ((select auth.uid()) = user_id);

create index if not exists
academy_review_queue_user_due_idx
on public.academy_review_queue (
  user_id,
  status,
  scheduled_for,
  priority desc
);

create table if not exists
public.academy_question_definitions (
  lesson_id text not null
    references public.academy_lesson_definitions(lesson_id),
  question_index smallint not null
    check (question_index >= 0),
  competency_id text
    references public.academy_competencies(competency_id),
  source_id text,
  source_section text,
  difficulty smallint not null default 1
    check (difficulty between 1 and 5),
  active boolean not null default true,
  primary key (lesson_id, question_index)
);

alter table public.academy_question_definitions
  enable row level security;

revoke all on public.academy_question_definitions
from public, anon, authenticated;

insert into public.academy_competencies
(competency_id,title,domain,jurisdiction,target_level,criticality)
values
('FND-MET-001','Expliquer le rôle réel de l agent','metier','France',4,'C2'),
('FOO-AGE-001','Identifier les conditions d exercice','reglementation','France',5,'C4'),
('FRA-MAN-001','Expliquer la fonction du mandat','mandat','France',4,'C3'),
('PRO-REL-001','Établir des attentes réalistes','relation','International',5,'C3'),
('PRO-NEG-001','Préparer une négociation','negociation','International',5,'C4')
on conflict (competency_id) do nothing;

insert into public.academy_lesson_competencies
(lesson_id,competency_id,weight)
values
('role','FND-MET-001',1),
('licence','FOO-AGE-001',1),
('mandat','FRA-MAN-001',1),
('approche','PRO-REL-001',1),
('negociation','PRO-NEG-001',1)
on conflict (lesson_id,competency_id) do nothing;

alter table public.academy_question_attempts
drop constraint if exists
academy_question_attempts_mistake_type_check;

alter table public.academy_question_attempts
add constraint academy_question_attempts_mistake_type_check
check (
  mistake_type is null or mistake_type in (
    'unclassified','unknown_rule','confusion',
    'forgotten_exception','misreading',
    'incomplete_reasoning','rushed_answer',
    'false_confidence'
  )
);

create unique index if not exists
academy_review_queue_one_pending_idx
on public.academy_review_queue (
  user_id,
  competency_id
)
where status = 'pending';

create unique index if not exists
academy_error_notebook_question_idx
on public.academy_error_notebook (
  user_id,
  lesson_id,
  question_index
);

create or replace function
public.apply_academy_question_signal()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old_score numeric(5,2) := 0;
  v_delta numeric(5,2) := 0;
  v_new_score numeric(5,2) := 0;
  v_interval smallint := 1;
  v_priority smallint := 50;
  v_status text := 'fragile';
  v_error_id uuid;
begin
  if new.competency_id is null then
    return new;
  end if;

  select mastery_score
  into v_old_score
  from public.academy_user_competency_mastery
  where user_id = new.user_id
    and competency_id = new.competency_id;

  v_old_score := coalesce(v_old_score, 0);

  if new.is_correct then
    v_delta := case new.confidence
      when 'certain' then 8
      when 'rather_certain' then 7
      when 'hesitant' then 5
      when 'guess' then 2
      else 4
    end;
  else
    v_delta := case new.confidence
      when 'certain' then -12
      when 'rather_certain' then -10
      when 'hesitant' then -7
      when 'guess' then -4
      else -6
    end;
  end if;

  v_new_score := greatest(
    0,
    least(100, v_old_score + v_delta)
  );

  v_status := case
    when v_new_score < 25 then 'fragile'
    when v_new_score < 55 then 'developing'
    when v_new_score < 80 then 'operational'
    else 'mastered'
  end;

  v_interval := case
    when not new.is_correct then 1
    when v_new_score < 40 then 2
    when v_new_score < 60 then 4
    when v_new_score < 80 then 7
    else 14
  end;

  v_priority := case
    when not new.is_correct
      and new.confidence = 'certain' then 95
    when not new.is_correct then 85
    when new.confidence = 'guess' then 60
    when new.confidence = 'hesitant' then 50
    else 35
  end;

  insert into public.academy_user_competency_mastery
    as mastery (
      user_id,
      competency_id,
      mastery_score,
      status,
      attempts_count,
      correct_count,
      false_confidence_count,
      last_practiced_at,
      next_review_at
    )
  values (
    new.user_id,
    new.competency_id,
    v_new_score,
    v_status,
    1,
    case when new.is_correct then 1 else 0 end,
    case when not new.is_correct
      and new.confidence = 'certain' then 1 else 0 end,
    now(),
    now() + make_interval(days => v_interval)
  )

  on conflict (user_id, competency_id)
  do update set
    mastery_score = excluded.mastery_score,
    status = excluded.status,
    attempts_count = mastery.attempts_count + 1,
    correct_count = mastery.correct_count
      + case when new.is_correct then 1 else 0 end,
    false_confidence_count =
      mastery.false_confidence_count
      + case when not new.is_correct
        and new.confidence = 'certain' then 1 else 0 end,
    last_practiced_at = now(),
    next_review_at = excluded.next_review_at,
    updated_at = now();

  if not new.is_correct then
    insert into public.academy_error_notebook
      as notebook (
        user_id,
        question_attempt_id,
        competency_id,
        lesson_id,
        question_index,
        mistake_type,
        next_review_at
      )
    values (
      new.user_id,
      new.id,
      new.competency_id,
      new.lesson_id,
      new.question_index,
      coalesce(new.mistake_type, 'unclassified'),
      now() + interval '1 day'
    )
    on conflict (user_id, lesson_id, question_index)
    do update set
      question_attempt_id = excluded.question_attempt_id,
      competency_id = excluded.competency_id,
      mistake_type = excluded.mistake_type,
      recurrence_count = notebook.recurrence_count + 1,
      status = 'open',
      next_review_at = excluded.next_review_at,
      resolved_at = null,
      updated_at = now();

  else
    update public.academy_error_notebook
    set
      status = 'reviewing',
      updated_at = now()
    where user_id = new.user_id
      and lesson_id = new.lesson_id
      and question_index = new.question_index
      and status = 'open';
  end if;

  select id
  into v_error_id
  from public.academy_error_notebook
  where user_id = new.user_id
    and lesson_id = new.lesson_id
    and question_index = new.question_index;

  insert into public.academy_review_queue as review (
    user_id,
    competency_id,
    error_id,
    scheduled_for,
    interval_days,
    priority,
    status
  )
  values (
    new.user_id,
    new.competency_id,
    v_error_id,
    now() + make_interval(days => v_interval),
    v_interval,
    v_priority,
    'pending'
  )
  on conflict (user_id, competency_id)
    where status = 'pending'
  do update set
    error_id = coalesce(excluded.error_id, review.error_id),
    scheduled_for = case
      when new.is_correct
        then greatest(review.scheduled_for, excluded.scheduled_for)
      else least(review.scheduled_for, excluded.scheduled_for)
    end,
    interval_days = excluded.interval_days,
    priority = excluded.priority,
    updated_at = now();

  return new;
end;
$$;

revoke all on function
public.apply_academy_question_signal()
from public, anon, authenticated;

drop trigger if exists
academy_question_signal_trigger
on public.academy_question_attempts;

create trigger academy_question_signal_trigger
after insert on public.academy_question_attempts
for each row
execute function public.apply_academy_question_signal();

create unique index if not exists
academy_error_notebook_question_idx
on public.academy_error_notebook (
  user_id,
  lesson_id,
  question_index
);


insert into public.academy_question_definitions
(lesson_id, question_index, competency_id, difficulty, active)
select
  mapping.lesson_id,
  question.number::smallint,
  mapping.competency_id,
  1,
  true
from (
  values
    ('role','FND-MET-001'),
    ('licence','FOO-AGE-001'),
    ('mandat','FRA-MAN-001'),
    ('approche','PRO-REL-001'),
    ('negociation','PRO-NEG-001')
) as mapping(lesson_id, competency_id)
join public.academy_lesson_definitions as lesson
  on lesson.lesson_id = mapping.lesson_id
cross join lateral generate_series(
  0,
  lesson.question_count - 1
) as question(number)
on conflict (lesson_id, question_index)
do update set
  competency_id = excluded.competency_id,
  active = true;

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
    'unspecified',
    case
      when (new.answers ->> question.number)::integer <>
        (v_definition.answer_key ->> question.number)::integer
      then 'unclassified'
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

drop trigger if exists
academy_capture_lesson_questions_trigger
on public.academy_lesson_attempts;

create trigger academy_capture_lesson_questions_trigger
after insert on public.academy_lesson_attempts
for each row
execute function
public.capture_academy_lesson_questions();

alter table public.academy_competencies
  enable row level security;

alter table public.academy_lesson_competencies
  enable row level security;

revoke all on public.academy_competencies
from public, anon, authenticated;

revoke all on public.academy_lesson_competencies
from public, anon, authenticated;

create or replace function
public.get_academy_learning_state()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_competencies jsonb := '[]'::jsonb;
  v_reviews jsonb := '[]'::jsonb;
  v_errors jsonb := '[]'::jsonb;
  v_due_count integer := 0;
  v_open_error_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifié'
      using errcode = '28000';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'competencyId', competency.competency_id,
        'title', competency.title,
        'domain', competency.domain,
        'criticality', competency.criticality,
        'masteryScore', coalesce(mastery.mastery_score, 0),
        'status', coalesce(mastery.status, 'not_started'),
        'attemptsCount', coalesce(mastery.attempts_count, 0),
        'nextReviewAt', mastery.next_review_at
      )
      order by competency.domain, competency.title
    ),
    '[]'::jsonb
  )
  into v_competencies
  from public.academy_competencies as competency
  left join public.academy_user_competency_mastery as mastery
    on mastery.competency_id = competency.competency_id
    and mastery.user_id = v_user_id
  where competency.active = true;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'reviewId', review.id,
        'competencyId', review.competency_id,
        'title', review.title,
        'scheduledFor', review.scheduled_for,
        'priority', review.priority,
        'intervalDays', review.interval_days
      )
      order by review.priority desc, review.scheduled_for
    ),
    '[]'::jsonb
  )
  into v_reviews
  from (
    select queue.*, competency.title
    from public.academy_review_queue as queue
    join public.academy_competencies as competency
      on competency.competency_id = queue.competency_id
    where queue.user_id = v_user_id
      and queue.status = 'pending'
    order by queue.priority desc, queue.scheduled_for
    limit 10
  ) as review;

  select count(*)::integer
  into v_due_count
  from public.academy_review_queue
  where user_id = v_user_id
    and status = 'pending'
    and scheduled_for <= now();

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'errorId', error.id,
        'lessonId', error.lesson_id,
        'questionIndex', error.question_index,
        'competencyId', error.competency_id,
        'competencyTitle', error.competency_title,
        'mistakeType', error.mistake_type,
        'recurrenceCount', error.recurrence_count,
        'status', error.status,
        'nextReviewAt', error.next_review_at
      )
      order by error.recurrence_count desc
    ),
    '[]'::jsonb
  )
  into v_errors
  from (
    select
      notebook.*,
      competency.title as competency_title
    from public.academy_error_notebook as notebook
    left join public.academy_competencies as competency
      on competency.competency_id = notebook.competency_id
    where notebook.user_id = v_user_id
      and notebook.status <> 'resolved'
    order by notebook.recurrence_count desc
    limit 10
  ) as error;

  select count(*)::integer
  into v_open_error_count
  from public.academy_error_notebook
  where user_id = v_user_id
    and status <> 'resolved';

  return jsonb_build_object(
    'competencies', v_competencies,
    'reviews', v_reviews,
    'errors', v_errors,
    'dueReviewCount', v_due_count,
    'openErrorCount', v_open_error_count,
    'generatedAt', now()
  );
end;
$$;

revoke all on function
public.get_academy_learning_state()
from public, anon;

grant execute on function
public.get_academy_learning_state()
to authenticated;

commit;
