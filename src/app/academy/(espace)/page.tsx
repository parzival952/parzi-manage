export const dynamic = "force-dynamic";

import Link from "next/link";

import AcademyProgressHeader from "@/components/AcademyProgressHeader";
import {
  loadLatestDiagnosticReport,
} from "@/lib/academy-diagnostic-report";
import {
  academyStateToProgress,
  loadAcademyState,
} from "@/lib/academy-state";
import {
  loadAcademyStudyPlan,
} from "@/lib/academy-study-plan";
import { loadAcademyLearningState } from "@/lib/academy-learning";
import {
  ALL_LESSONS,
  COURSE,
  LESSON_COUNT,
  findLesson,
} from "@/lib/academy";
import { requireUser } from "@/lib/auth";
import { levelInfo } from "@/lib/progression";
import { lessonForSectionByDay, primaryLessonForSection } from "@/lib/academy-recommendations";
import AcademyIcon, { IconTile } from "@/components/AcademyIcon";

function getScoreTone(score: number): string {
  if (score < 25) {
    return "var(--rouge-clair)";
  }

  if (score < 50) {
    return "var(--ambre)";
  }

  if (score < 75) {
    return "var(--or)";
  }

  return "var(--vert)";
}

export default async function AcademyHome() {
  await requireUser();

  const [
    academyState,
    diagnosticReport,
    studyPlan,
    learningState,
  ] = await Promise.all([
    loadAcademyState(),
    loadLatestDiagnosticReport(),
    loadAcademyStudyPlan(),
    loadAcademyLearningState(),
  ]);

  const fallbackXp =
    diagnosticReport?.progression.xpEarned ?? 0;

  const progress = academyState
    ? academyStateToProgress(academyState)
    : {
        xp: fallbackXp,
        streak: 0,
        best_streak: 0,
        last_active: "",
        done: new Set<string>(),
        perfect: 0,
        info: levelInfo(fallbackXp),
      };

  const synchronizedXp = progress.xp;

  const today = {
    lessons: academyState?.todayLessons ?? 0,
    perfect: academyState?.todayPerfect ?? 0,
  };

  const doneCount = progress.done.size;

  const currentId =
    ALL_LESSONS.find(
      ({ lesson }) =>
        !progress.done.has(lesson.id),
    )?.lesson.id ??
    ALL_LESSONS[0]?.lesson.id;

  const firstPriority =
    diagnosticReport?.priorities[0] ?? null;

  const planCurrentDay =
    studyPlan?.days.find(
      (day) => day.isCurrent,
    ) ?? null;

  const recommendedLessonId =
    (planCurrentDay?.focusSectionId
      ? lessonForSectionByDay(
          planCurrentDay.focusSectionId,
          planCurrentDay.day,
        )
      : null) ??
    (firstPriority
      ? primaryLessonForSection(
          firstPriority.sectionId,
        )
      : null) ??
    planCurrentDay?.recommendedLessonId ??
    currentId ??
    "role";

  const recommendedLesson =
    findLesson(recommendedLessonId);

  const firstMission =
    planCurrentDay ??
    diagnosticReport?.studyPlan.days[0] ??
    null;

  const missionFocus =
    planCurrentDay?.focus ??
    firstPriority?.label ??
    null;

  const missionDescription =
    planCurrentDay?.activity ??
    firstPriority?.reason ??
    null;

  const diagnosticScore =
    diagnosticReport?.summary.scorePercent ?? 0;

  const trophyCount =
    diagnosticReport?.trophies.unlockedCount ?? 0;

  const scoreTone = getScoreTone(
    diagnosticScore,
  );

  const challenges = [
    {
      label: "Valide une leçon aujourd’hui",
      done: today.lessons >= 1,
      icon: "book" as const,
    },
    {
      label: "Enchaîne 2 leçons",
      done: today.lessons >= 2,
      icon: "bolt" as const,
    },
    {
      label: "Décroche un quiz à 100 %",
      done: today.perfect >= 1,
      icon: "target" as const,
    },
  ];

  const completedChallenges =
    challenges.filter(
      (challenge) => challenge.done,
    ).length;

  return (
    // Ordinateur : parcours à gauche, suivi (progression, défis, raccourcis) à
    // droite. Mobile : une seule colonne — les colonnes passent en
    // display:contents et l'ordre est donné par les classes order-*.
    <div className="pz-wide flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:items-start">
      <div className="contents lg:flex lg:flex-col lg:gap-6 lg:min-w-0">
        {diagnosticReport ? (
          <section
            className="order-2 lg:order-none pz-card p-5 pz-rise pz-d1"
            style={{
              background:
                "radial-gradient(circle at 100% 0%, rgba(201,204,209,.13), transparent 42%), linear-gradient(145deg, rgba(var(--ink-rgb),.035), rgba(var(--ink-rgb),.015))",
              borderColor:
                "rgba(201,204,209,.18)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className="pz-eyebrow"
                  style={{ color: "var(--argent)" }}
                >
                  ✓ DIAGNOSTIC TERMINÉ
                </div>

                <h1 className="text-[20px] font-black tracking-tight mt-2">
                  Ton parcours est personnalisé
                </h1>

                <p className="text-[12.5px] leading-5 pz-muted mt-2">
                  Ta priorité, ta première mission et la suite
                  de ton apprentissage utilisent ton dernier
                  résultat réel.
                </p>
              </div>

              <div
                className="w-[72px] h-[72px] rounded-full grid place-items-center shrink-0"
                style={{
                  color: scoreTone,
                  background:
                    "rgba(var(--ink-rgb),.035)",
                  border: `2px solid ${scoreTone}`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.10)",
                }}
              >
                <div className="text-center">
                  <strong className="block text-[20px] leading-none">
                    {diagnosticScore}%
                  </strong>

                  <span className="text-[8px] pz-muted">
                    score
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <div
                className="rounded-2xl p-3 text-center"
                style={{
                  background:
                    "rgba(var(--ink-rgb),.035)",
                  border:
                    "1px solid var(--ligne)",
                }}
              >
                <strong className="block text-[16px]">
                  {diagnosticReport.summary.pointsEarned}/
                  {diagnosticReport.summary.pointsPossible}
                </strong>

                <span className="text-[9px] pz-muted">
                  points
                </span>
              </div>

              <div
                className="rounded-2xl p-3 text-center"
                style={{
                  background:
                    "rgba(var(--ink-rgb),.035)",
                  border:
                    "1px solid var(--ligne)",
                }}
              >
                <strong
                  className="block text-[16px]"
                  style={{ color: "var(--or)" }}
                >
                  {synchronizedXp}
                </strong>

                <span className="text-[9px] pz-muted">
                  XP total
                </span>
              </div>

              <div
                className="rounded-2xl p-3 text-center"
                style={{
                  background:
                    "rgba(var(--ink-rgb),.035)",
                  border:
                    "1px solid var(--ligne)",
                }}
              >
                <strong className="block text-[16px]">
                  {trophyCount}
                </strong>

                <span className="text-[9px] pz-muted">
                  trophée
                  {trophyCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <Link
              href="/academy/diagnostic/resultats"
              className="min-h-[48px] rounded-2xl mt-4 flex items-center justify-center text-[12px] font-bold"
              style={{
                background:
                  "rgba(var(--ink-rgb),.035)",
                border: "1px solid var(--ligne)",
              }}
            >
              Voir mon rapport personnalisé →
            </Link>

            <Link
              href="/academy/plan"
              className="pz-btn w-full mt-3"
            >
              Voir mon plan de 14 jours →
            </Link>

            <Link
              href="/academy/historique"
              className="min-h-[48px] rounded-2xl mt-3 flex items-center justify-center text-[12px] font-bold"
              style={{
                background:
                  "rgba(var(--ink-rgb),.035)",
                border:
                  "1px solid var(--ligne)",
              }}
            >
              Voir mon historique Academy →
            </Link>
          </section>
        ) : (
          <section
            className="order-2 lg:order-none pz-card p-5 pz-rise pz-d1"
            style={{
              borderColor:
                "rgba(201,204,209,.16)",
            }}
          >
            <div
              className="pz-eyebrow"
              style={{ color: "var(--argent)" }}
            >
              Module 0
            </div>

            <h1 className="text-[20px] font-black mt-2">
              Commence par découvrir ton niveau
            </h1>

            <p className="text-[12.5px] leading-5 pz-muted mt-2">
              Le diagnostic analyse tes connaissances, ta
              méthode, ton temps de réponse et tes fausses
              certitudes.
            </p>

            <Link
              href="/academy/diagnostic"
              className="min-h-[52px] rounded-2xl mt-5 flex items-center justify-center text-[13px] font-black"
              style={{
                color: "#fff",
                background:
                  "linear-gradient(180deg, #C21833, #A3142D)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,.16), 0 1px 2px rgba(0,0,0,.45)",
              }}
            >
              Commencer mon diagnostic
            </Link>
          </section>
        )}

        {diagnosticReport &&
         missionFocus &&
         recommendedLesson ? (
          <section
            className="order-3 lg:order-none pz-card p-5 pz-rise pz-d2"
            style={{
              background:
                "linear-gradient(145deg, rgba(194,24,51,.09), rgba(var(--ink-rgb),.018))",
              borderColor:
                "rgba(194,24,51,.25)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="pz-eyebrow pz-red inline-flex items-center gap-1.5">
                  <AcademyIcon name="target" size={12} /> Mission actuelle
                </div>

                <h2 className="text-[19px] font-black mt-2">
                  {missionFocus}
                </h2>

                <p className="text-[12px] leading-5 pz-muted mt-2">
                  {missionDescription}
                </p>
              </div>

              <div
                className="rounded-2xl px-3 py-2 text-center shrink-0"
                style={{
                  color: scoreTone,
                  background:
                    "rgba(var(--ink-rgb),.035)",
                  border:
                    "1px solid var(--ligne)",
                }}
              >
                <strong className="block text-[17px]">
                  J{firstMission?.day ?? 1}
                </strong>

                <span className="text-[8px]">
                  du plan
                </span>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 mt-5"
              style={{
                background:
                  "rgba(var(--ink-rgb),.035)",
                border: "1px solid var(--ligne)",
              }}
            >
              <div className="pz-eyebrow pz-muted">
                MISSION À VALIDER
              </div>

              <h3 className="text-[15px] font-extrabold mt-2">
                {recommendedLesson.lesson.title}
              </h3>

              <p className="text-[11px] leading-5 pz-muted mt-1">
                {firstMission?.activity ??
                  recommendedLesson.lesson.intro}
              </p>

              <div className="flex items-center gap-3 mt-3 text-[10.5px] pz-muted pz-mono">
                <span className="inline-flex items-center gap-1">
                  <AcademyIcon name="clock" size={12} /> {recommendedLesson.lesson.minutes} min
                </span>

                <span className="inline-flex items-center gap-1">
                  <AcademyIcon name="notes" size={12} /> {recommendedLesson.lesson.quiz.length} quiz
                </span>

                <span>
                  Jour {firstMission?.day ?? 1}
                </span>
              </div>
            </div>

            <Link
              href={`/academy/lecon/${recommendedLesson.lesson.id}`}
              className="min-h-[54px] rounded-2xl mt-4 flex items-center justify-center text-[13px] font-black"
              style={{
                color: "#ffffff",
                background:
                  "linear-gradient(135deg, var(--rouge), var(--rouge-profond))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,.16), 0 1px 2px rgba(0,0,0,.45)",
              }}
            >
              Continuer ma mission du jour →
            </Link>
          </section>
        ) : null}

        <div className="order-5 lg:order-none pz-rise pz-d2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[20px] font-extrabold tracking-tight">
              {COURSE.title}
            </h2>

            <span className="text-[12px] pz-muted">
              {doneCount}/{LESSON_COUNT} leçons
            </span>
          </div>

          <p className="text-[13.5px] pz-muted mt-1">
            Des leçons courtes, un quiz et de l’XP. Reviens
            chaque jour pour garder ta série.
          </p>
        </div>

        {COURSE.chapters.map(
          (chapter, chapterIndex) => (
            <section
              key={chapter.id}
              className={`order-5 lg:order-none pz-rise pz-d${Math.min(
                5,
                chapterIndex + 3,
              )}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="pz-eyebrow pz-red">
                  CHAPITRE {chapterIndex + 1}
                </div>

                <div
                  className="h-px flex-1"
                  style={{
                    background: "var(--ligne)",
                  }}
                />
              </div>

              <h2 className="text-[16px] font-bold mb-0.5">
                {chapter.title}
              </h2>

              <p className="text-[13px] pz-muted mb-5">
                {chapter.subtitle}
              </p>

              <div className="flex flex-col items-start">
                {chapter.lessons.map(
                  (lesson, lessonIndex) => {
                    const done =
                      progress.done.has(lesson.id);

                    const current =
                      lesson.id === currentId;

                    const recommended =
                      lesson.id ===
                      recommendedLesson?.lesson.id;

                    const state = done
                      ? "done"
                      : current || recommended
                        ? "current"
                        : "locked";

                    return (
                      <div
                        key={lesson.id}
                        className="w-full"
                      >
                        {lessonIndex > 0 ? (
                          <div
                            className={`pz-connector ml-8 ${
                              chapter.lessons[
                                lessonIndex - 1
                              ] &&
                              progress.done.has(
                                chapter.lessons[
                                  lessonIndex - 1
                                ].id,
                              )
                                ? "done"
                                : ""
                            }`}
                          />
                        ) : null}

                        <Link
                          href={`/academy/lecon/${lesson.id}`}
                          className="flex items-center gap-4 group"
                        >
                          <div
                            className={`pz-node ${state}`}
                          >
                            {done
                              ? "✓"
                              : lessonIndex + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div
                              className="font-semibold text-[14.5px] group-hover:text-white"
                              style={{
                                color:
                                  state === "locked"
                                    ? "var(--gris)"
                                    : "var(--blanc)",
                              }}
                            >
                              {lesson.title}
                            </div>

                            <div className="text-[12px] pz-muted">
                              {lesson.minutes} min ·{" "}
                              {lesson.quiz.length} question
                              {lesson.quiz.length > 1
                                ? "s"
                                : ""}

                              {done ? (
                                <span className="pz-red">
                                  {" "}
                                  · validée
                                </span>
                              ) : null}

                              {recommended && !done ? (
                                <span
                                  style={{
                                    color: "var(--vert)",
                                  }}
                                >
                                  {" "}
                                  · recommandée
                                </span>
                              ) : current ? (
                                <span className="pz-red">
                                  {" "}
                                  · à faire
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          ),
        )}
      </div>

      <aside className="contents lg:flex lg:flex-col lg:gap-5">
        <div className="order-1 lg:order-none">
          <AcademyProgressHeader
            progress={progress}
            doneCount={doneCount}
            total={LESSON_COUNT}
          />
        </div>

        <section
          className="order-4 lg:order-none pz-card p-5 pz-rise pz-d2"
          style={{
            borderColor:
              completedChallenges ===
              challenges.length
                ? "rgba(201,204,209,.28)"
                : undefined,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="pz-eyebrow pz-red">
              ✦ Défis du jour
            </div>

            <span className="text-[12px] pz-muted pz-mono">
              {completedChallenges}/
              {challenges.length}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.label}
                className="flex items-center gap-3"
              >
                <span
                  className="grid place-items-center w-6 h-6 rounded-full text-[12px] shrink-0"
                  style={{
                    background: challenge.done
                      ? "var(--vert)"
                      : "rgba(var(--ink-rgb),.06)",
                    color: challenge.done
                      ? "#06210f"
                      : "var(--gris)",
                    border: challenge.done
                      ? "none"
                      : "1px solid var(--ligne)",
                  }}
                >
                  {challenge.done ? "✓" : ""}
                </span>

                <span
                  className="text-[13.5px]"
                  style={{
                    color: challenge.done
                      ? "var(--gris)"
                      : "var(--blanc)",
                    textDecoration: challenge.done
                      ? "line-through"
                      : "none",
                  }}
                >
                  <AcademyIcon name={challenge.icon} size={14} style={{ color: "var(--argent)", marginRight: 6 }} />
                  {challenge.label}
                </span>
              </div>
            ))}
          </div>

          {completedChallenges ===
          challenges.length ? (
            <p
              className="text-[12px] mt-3 pz-muted"
            >
              Tous les défis du jour sont relevés. Reviens
              demain pour la suite.
            </p>
          ) : null}
        </section>

        <Link
          href="/academy/certifications"
          className="order-6 lg:order-none pz-card p-5 pz-rise pz-d5 flex items-center gap-4"
          style={{
            borderColor:
              "rgba(233,195,106,.35)",
          }}
        >
          <IconTile name="cap" tone="var(--or)" />

          <div className="flex-1">
            <div className="font-bold text-[15px]">
              Certifications &amp; diplômes
            </div>

            <div className="text-[12.5px] pz-muted">
              Prouve tes compétences et décroche ton diplôme
              « Agent Ready ».
            </div>
          </div>

          <div className="text-[18px] pz-muted">
            →
          </div>
        </Link>

        <Link
          href="/academy/revision"
          className="order-6 lg:order-none pz-card p-5 pz-rise pz-d5 flex items-center gap-4"
          style={{
            borderColor: "rgba(201,204,209,.2)",
          }}
        >
          <IconTile name="revision" />

          <div className="flex-1">
            <div className="font-bold text-[15px]">
              Révision intelligente
            </div>

            <div className="text-[12.5px] pz-muted">
              {learningState &&
              (learningState.dueReviewCount > 0 ||
                learningState.openErrorCount > 0)
                ? `${learningState.dueReviewCount} à réviser · ${learningState.openErrorCount} erreur${
                    learningState.openErrorCount > 1 ? "s" : ""
                  } à corriger`
                : "Carnet d’erreurs, maîtrise par compétence et révisions espacées."}
            </div>
          </div>

          <div className="text-[18px] pz-muted">
            →
          </div>
        </Link>

        <Link
          href="/academy/glossaire"
          className="order-6 lg:order-none pz-card p-5 pz-rise pz-d5 flex items-center gap-4"
        >
          <IconTile name="bookOpen" />

          <div className="flex-1">
            <div className="font-bold text-[15px]">
              Glossaire du métier
            </div>

            <div className="text-[12.5px] pz-muted">
              Tous les termes clés : mandats, clauses, transferts, instances…
            </div>
          </div>

          <div className="text-[18px] pz-muted">
            →
          </div>
        </Link>

        <Link
          href="/academy/modeles"
          className="order-6 lg:order-none pz-card p-5 pz-rise pz-d5 flex items-center gap-4"
        >
          <IconTile name="folder" />

          <div className="flex-1">
            <div className="font-bold text-[15px]">
              Fiches &amp; modèles commentés
            </div>

            <div className="text-[12.5px] pz-muted">
              Mandat et points clés d&apos;un contrat, expliqués.
            </div>
          </div>

          <div className="text-[18px] pz-muted">
            →
          </div>
        </Link>

        <Link
          href="/academy/aide-memoire"
          className="order-6 lg:order-none pz-card p-5 pz-rise pz-d5 flex items-center gap-4"
        >
          <IconTile name="target" />

          <div className="flex-1">
            <div className="font-bold text-[15px]">
              Aide-mémoire
            </div>

            <div className="text-[12.5px] pz-muted">
              Tous les points clés à retenir, chapitre par chapitre.
            </div>
          </div>

          <div className="text-[18px] pz-muted">
            →
          </div>
        </Link>

        <div className="order-6 lg:order-none grid grid-cols-3 gap-3 pz-rise pz-d5">
          <Link
            href="/academy/classement"
            className="pz-card p-4 text-center card-hover"
          >
            <AcademyIcon name="trophy" size={22} style={{ color: "var(--argent)" }} />
            <div className="text-[12px] font-semibold mt-1">
              Classement
            </div>
          </Link>

          <Link
            href="/academy/badges"
            className="pz-card p-4 text-center card-hover"
          >
            <AcademyIcon name="shield" size={22} style={{ color: "var(--argent)" }} />
            <div className="text-[12px] font-semibold mt-1">
              Badges
            </div>
          </Link>

          <Link
            href="/academy/trophees"
            className="pz-card p-4 text-center card-hover"
          >
            <AcademyIcon name="medal" size={22} style={{ color: "var(--argent)" }} />
            <div className="text-[12px] font-semibold mt-1">
              Trophées
            </div>
          </Link>
        </div>
      </aside>
    </div>
  );
}
