-- migration-022 — Clés de correction de TOUTES les leçons du programme (41 leçons).
--
-- La CLÉ DE CORRECTION vit en base (academy_lesson_definitions) : le RPC
-- complete_academy_lesson note les réponses (p_answers) contre answer_key côté
-- serveur. Régénéré automatiquement depuis src/lib/academy-course.ts — idempotent.

begin;

insert into public.academy_lesson_definitions (lesson_id, answer_key, question_count, active)
values
  ('role', '[1,1,1]'::jsonb, 3, true),
  ('ecosysteme', '[1,0,1]'::jsonb, 3, true),
  ('modele-economique', '[1,1,1]'::jsonb, 3, true),
  ('deontologie', '[1,1,1]'::jsonb, 3, true),
  ('licence', '[1,2,1]'::jsonb, 3, true),
  ('lecture-juridique', '[1,1,1]'::jsonb, 3, true),
  ('reglement-agents', '[1,1,1]'::jsonb, 3, true),
  ('mineurs', '[1,1,1]'::jsonb, 3, true),
  ('transferts-systeme', '[1,1,1,1]'::jsonb, 4, true),
  ('mandat', '[1,1,1]'::jsonb, 3, true),
  ('contrat-joueur', '[1,1,1]'::jsonb, 3, true),
  ('clauses-cles', '[1,1,1]'::jsonb, 3, true),
  ('commission', '[1,1,1]'::jsonb, 3, true),
  ('litiges', '[1,1,1]'::jsonb, 3, true),
  ('detection', '[1,0,1]'::jsonb, 3, true),
  ('evaluation', '[1,1,0]'::jsonb, 3, true),
  ('data-video', '[1,1,1]'::jsonb, 3, true),
  ('approche', '[1,1,1]'::jsonb, 3, true),
  ('relation', '[1,1,1]'::jsonb, 3, true),
  ('plan-carriere', '[1,1,1]'::jsonb, 3, true),
  ('image-sponsors', '[1,1,1]'::jsonb, 3, true),
  ('negociation', '[1,1,1]'::jsonb, 3, true),
  ('preparer-nego', '[0,1,1]'::jsonb, 3, true),
  ('techniques-nego', '[1,1,1]'::jsonb, 3, true),
  ('negocier-transfert', '[1,1,1]'::jsonb, 3, true),
  ('structurer-activite', '[1,1,1]'::jsonb, 3, true),
  ('prospection', '[1,1,1]'::jsonb, 3, true),
  ('reseau', '[1,1,1]'::jsonb, 3, true),
  ('finances', '[1,1,1]'::jsonb, 3, true),
  ('mental-performance', '[1,1,1]'::jsonb, 3, true),
  ('gerer-entourage', '[1,0,1]'::jsonb, 3, true),
  ('conversations-difficiles', '[1,1,1]'::jsonb, 3, true),
  ('jeune-argent-celebrite', '[1,1,1]'::jsonb, 3, true),
  ('jouer-a-letranger', '[1,1,1]'::jsonb, 3, true),
  ('mecanique-transfert-int', '[1,1,0]'::jsonb, 3, true),
  ('formation-solidarite', '[1,1,1]'::jsonb, 3, true),
  ('montages-a-eviter', '[1,0,1]'::jsonb, 3, true),
  ('methode-examen', '[1,1,1]'::jsonb, 3, true),
  ('cas-pratiques', '[1,1,1]'::jsonb, 3, true),
  ('veille', '[1,1,1]'::jsonb, 3, true),
  ('outils-parzi', '[1,1,1]'::jsonb, 3, true)
on conflict (lesson_id) do update set
  answer_key = excluded.answer_key,
  question_count = excluded.question_count,
  active = excluded.active,
  updated_at = now();

commit;
