-- migration-022 — Clés de correction de TOUTES les leçons du programme (33 leçons).
--
-- Contexte : le contenu des leçons (questions/options) vit dans le code
-- (src/lib/academy-course.ts), mais la CLÉ DE CORRECTION vit en base
-- (academy_lesson_definitions). Le RPC complete_academy_lesson note les réponses
-- de l'utilisateur (p_answers) contre answer_key, côté serveur — le client ne peut
-- pas s'auto-attribuer un score.
--
-- La migration-018 n'avait semé que 5 leçons ; le programme complet en compte 33.
-- Sans cette migration, les 28 nouvelles leçons (et « licence » passée à 3 questions)
-- ne seraient pas validables.
--
-- Ces clés sont EXTRAITES AUTOMATIQUEMENT du contenu (les `answer:` de chaque quiz),
-- donc elles correspondent exactement aux questions affichées. Idempotent (upsert).
-- Rollback : neutre (on peut re-semer les 5 leçons d'origine si besoin).

begin;

insert into public.academy_lesson_definitions (lesson_id, answer_key, question_count, active)
values
  ('role', '[1,1]'::jsonb, 2, true),
  ('ecosysteme', '[1,0,1]'::jsonb, 3, true),
  ('modele-economique', '[1,1]'::jsonb, 2, true),
  ('deontologie', '[1,1]'::jsonb, 2, true),
  ('licence', '[1,2,1]'::jsonb, 3, true),
  ('lecture-juridique', '[1,1,1]'::jsonb, 3, true),
  ('reglement-agents', '[1,1]'::jsonb, 2, true),
  ('mineurs', '[1,1]'::jsonb, 2, true),
  ('transferts-systeme', '[1,1,1]'::jsonb, 3, true),
  ('mandat', '[1,1]'::jsonb, 2, true),
  ('contrat-joueur', '[1,1,1]'::jsonb, 3, true),
  ('clauses-cles', '[1,1,1]'::jsonb, 3, true),
  ('commission', '[1,1,1]'::jsonb, 3, true),
  ('litiges', '[1,1]'::jsonb, 2, true),
  ('detection', '[1,0,1]'::jsonb, 3, true),
  ('evaluation', '[1,1,0]'::jsonb, 3, true),
  ('data-video', '[1,1]'::jsonb, 2, true),
  ('approche', '[1,1]'::jsonb, 2, true),
  ('relation', '[1,1]'::jsonb, 2, true),
  ('plan-carriere', '[1,1]'::jsonb, 2, true),
  ('image-sponsors', '[1,1]'::jsonb, 2, true),
  ('negociation', '[1,1]'::jsonb, 2, true),
  ('preparer-nego', '[0,1,1]'::jsonb, 3, true),
  ('techniques-nego', '[1,1]'::jsonb, 2, true),
  ('negocier-transfert', '[1,1,1]'::jsonb, 3, true),
  ('structurer-activite', '[1,1]'::jsonb, 2, true),
  ('prospection', '[1,1]'::jsonb, 2, true),
  ('reseau', '[1,1]'::jsonb, 2, true),
  ('finances', '[1,1]'::jsonb, 2, true),
  ('methode-examen', '[1,1]'::jsonb, 2, true),
  ('cas-pratiques', '[1,1,1]'::jsonb, 3, true),
  ('veille', '[1,1]'::jsonb, 2, true),
  ('outils-parzi', '[1,1]'::jsonb, 2, true)
on conflict (lesson_id) do update set
  answer_key = excluded.answer_key,
  question_count = excluded.question_count,
  active = excluded.active,
  updated_at = now();

commit;
