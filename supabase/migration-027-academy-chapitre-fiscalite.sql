-- migration-027 — Chapitre « Fiscalité & statut de l'agent » (4 leçons).
--
-- 1) Clés de correction des 4 nouvelles leçons (correction serveur par
--    complete_academy_lesson, comme migration-022).
-- 2) Rattachement au domaine Business (DOM-BUS) + définitions de questions,
--    pour que le moteur de révision suive ces leçons (comme migration-023).
-- Généré depuis src/lib/academy-course.ts. Data-only, idempotente.
-- Retour arrière : delete des lignes ci-dessous (lesson_id listés).

begin;

insert into public.academy_lesson_definitions (lesson_id, answer_key, question_count, active)
values
  ('choisir-statut', '[1,0,1]'::jsonb, 3, true),
  ('micro-entreprise-agent', '[1,1,1]'::jsonb, 3, true),
  ('tva-commissions', '[1,1,1]'::jsonb, 3, true),
  ('facturer-commission', '[1,1,1]'::jsonb, 3, true)
on conflict (lesson_id) do update set
  answer_key = excluded.answer_key,
  question_count = excluded.question_count,
  active = excluded.active,
  updated_at = now();

insert into public.academy_lesson_competencies (lesson_id, competency_id, weight)
values
  ('choisir-statut','DOM-BUS',1),
  ('micro-entreprise-agent','DOM-BUS',1),
  ('tva-commissions','DOM-BUS',1),
  ('facturer-commission','DOM-BUS',1)
on conflict (lesson_id, competency_id) do nothing;

insert into public.academy_question_definitions
  (lesson_id, question_index, competency_id, difficulty, active)
select
  m.lesson_id,
  q.number::smallint,
  m.competency_id,
  1,
  true
from (values
  ('choisir-statut','DOM-BUS'),
  ('micro-entreprise-agent','DOM-BUS'),
  ('tva-commissions','DOM-BUS'),
  ('facturer-commission','DOM-BUS')
) as m(lesson_id, competency_id)
join public.academy_lesson_definitions as l
  on l.lesson_id = m.lesson_id and l.active = true
cross join lateral generate_series(0, l.question_count - 1) as q(number)
on conflict (lesson_id, question_index) do update set
  competency_id = excluded.competency_id,
  active = true;

commit;
