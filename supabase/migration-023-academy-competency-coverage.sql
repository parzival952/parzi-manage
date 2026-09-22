-- migration-023 — Couverture compétences du moteur de révision (33 leçons).
--
-- Contexte : le moteur d'apprentissage (migration-021) est complet côté base
-- (triggers capture + signal, RPC get_academy_learning_state), et
-- complete_academy_lesson (migration-019) insère bien un academy_lesson_attempts à
-- chaque validation → le pipeline SE DÉCLENCHE déjà. MAIS il ne produisait de la
-- maîtrise / des erreurs / des révisions que pour 5 leçons (les seules ayant une
-- academy_question_definitions avec competency_id). Les 28 autres leçons donnaient
-- des academy_question_attempts avec competency_id NULL → le trigger signal sortait
-- sans rien faire.
--
-- Cette migration :
--  1) crée 6 compétences de DOMAINE, alignées sur la carte d'attributs de l'agent
--     (Scouting / Négociation / Juridique / Business / IA / Management) ;
--  2) désactive les 5 compétences fines d'origine (remplacées par les domaines) ;
--  3) rattache chaque leçon à sa compétence de domaine ;
--  4) régénère academy_question_definitions pour TOUTES les questions de TOUTES les
--     leçons (au question_count courant), de sorte que chaque réponse alimente la
--     bonne compétence.
--
-- Data-only, idempotent (upserts). Aucun changement de fonction/trigger.

begin;

-- 1) Compétences de domaine.
insert into public.academy_competencies
  (competency_id, title, domain, jurisdiction, target_level, criticality, active)
values
  ('DOM-SCO', 'Scouting & évaluation',       'scouting',     'International', 4, 'C2', true),
  ('DOM-NEG', 'Négociation',                 'negociation',  'International', 5, 'C3', true),
  ('DOM-JUR', 'Juridique & réglementation',  'juridique',    'France',       5, 'C4', true),
  ('DOM-BUS', 'Business & réseau',           'business',     'International', 4, 'C2', true),
  ('DOM-IA',  'Data, vidéo & outils',        'data',         'International', 3, 'C1', true),
  ('DOM-MGT', 'Gestion & relation',          'management',   'International', 4, 'C3', true)
on conflict (competency_id) do update set
  title = excluded.title,
  domain = excluded.domain,
  jurisdiction = excluded.jurisdiction,
  target_level = excluded.target_level,
  criticality = excluded.criticality,
  active = true,
  updated_at = now();

-- 2) Les 5 compétences fines d'origine sont remplacées par les domaines.
update public.academy_competencies
set active = false, updated_at = now()
where competency_id in
  ('FND-MET-001','FOO-AGE-001','FRA-MAN-001','PRO-REL-001','PRO-NEG-001');

-- 3) Rattachement leçon -> compétence de domaine (les 33 leçons).
insert into public.academy_lesson_competencies (lesson_id, competency_id, weight)
values
  ('role','DOM-MGT',1),
  ('ecosysteme','DOM-MGT',1),
  ('modele-economique','DOM-BUS',1),
  ('deontologie','DOM-JUR',1),
  ('licence','DOM-JUR',1),
  ('lecture-juridique','DOM-JUR',1),
  ('reglement-agents','DOM-JUR',1),
  ('mineurs','DOM-JUR',1),
  ('transferts-systeme','DOM-JUR',1),
  ('mandat','DOM-JUR',1),
  ('contrat-joueur','DOM-JUR',1),
  ('clauses-cles','DOM-JUR',1),
  ('commission','DOM-BUS',1),
  ('litiges','DOM-JUR',1),
  ('detection','DOM-SCO',1),
  ('evaluation','DOM-SCO',1),
  ('data-video','DOM-IA',1),
  ('approche','DOM-SCO',1),
  ('relation','DOM-MGT',1),
  ('plan-carriere','DOM-MGT',1),
  ('image-sponsors','DOM-BUS',1),
  ('negociation','DOM-NEG',1),
  ('preparer-nego','DOM-NEG',1),
  ('techniques-nego','DOM-NEG',1),
  ('negocier-transfert','DOM-NEG',1),
  ('structurer-activite','DOM-BUS',1),
  ('prospection','DOM-BUS',1),
  ('reseau','DOM-BUS',1),
  ('finances','DOM-BUS',1),
  ('methode-examen','DOM-MGT',1),
  ('cas-pratiques','DOM-JUR',1),
  ('veille','DOM-IA',1),
  ('outils-parzi','DOM-IA',1),
  ('mental-performance','DOM-MGT',1),
  ('gerer-entourage','DOM-MGT',1),
  ('conversations-difficiles','DOM-NEG',1),
  ('jeune-argent-celebrite','DOM-MGT',1),
  ('jouer-a-letranger','DOM-JUR',1),
  ('mecanique-transfert-int','DOM-JUR',1),
  ('formation-solidarite','DOM-BUS',1),
  ('montages-a-eviter','DOM-JUR',1)
on conflict (lesson_id, competency_id) do nothing;

-- 4) Définition de question -> compétence, pour TOUTES les questions de TOUTES les
--    leçons actives (au question_count courant). Remplace/complète l'existant.
insert into public.academy_question_definitions
  (lesson_id, question_index, competency_id, difficulty, active)
select
  m.lesson_id,
  q.number::smallint,
  m.competency_id,
  1,
  true
from (values
  ('role','DOM-MGT'),
  ('ecosysteme','DOM-MGT'),
  ('modele-economique','DOM-BUS'),
  ('deontologie','DOM-JUR'),
  ('licence','DOM-JUR'),
  ('lecture-juridique','DOM-JUR'),
  ('reglement-agents','DOM-JUR'),
  ('mineurs','DOM-JUR'),
  ('transferts-systeme','DOM-JUR'),
  ('mandat','DOM-JUR'),
  ('contrat-joueur','DOM-JUR'),
  ('clauses-cles','DOM-JUR'),
  ('commission','DOM-BUS'),
  ('litiges','DOM-JUR'),
  ('detection','DOM-SCO'),
  ('evaluation','DOM-SCO'),
  ('data-video','DOM-IA'),
  ('approche','DOM-SCO'),
  ('relation','DOM-MGT'),
  ('plan-carriere','DOM-MGT'),
  ('image-sponsors','DOM-BUS'),
  ('negociation','DOM-NEG'),
  ('preparer-nego','DOM-NEG'),
  ('techniques-nego','DOM-NEG'),
  ('negocier-transfert','DOM-NEG'),
  ('structurer-activite','DOM-BUS'),
  ('prospection','DOM-BUS'),
  ('reseau','DOM-BUS'),
  ('finances','DOM-BUS'),
  ('methode-examen','DOM-MGT'),
  ('cas-pratiques','DOM-JUR'),
  ('veille','DOM-IA'),
  ('outils-parzi','DOM-IA'),
  ('mental-performance','DOM-MGT'),
  ('gerer-entourage','DOM-MGT'),
  ('conversations-difficiles','DOM-NEG'),
  ('jeune-argent-celebrite','DOM-MGT'),
  ('jouer-a-letranger','DOM-JUR'),
  ('mecanique-transfert-int','DOM-JUR'),
  ('formation-solidarite','DOM-BUS'),
  ('montages-a-eviter','DOM-JUR')
) as m(lesson_id, competency_id)
join public.academy_lesson_definitions as l
  on l.lesson_id = m.lesson_id and l.active = true
cross join lateral generate_series(0, l.question_count - 1) as q(number)
on conflict (lesson_id, question_index) do update set
  competency_id = excluded.competency_id,
  active = true;

commit;
