export const dynamic = "force-dynamic";

import Link from "next/link";

import AcademyProgressHeader from "@/components/AcademyProgressHeader";
import {
  loadLatestDiagnosticReport,
} from "@/lib/academy-diagnostic-report";
import {
  loadAcademyStudyPlan,
} from "@/lib/academy-study-plan";
import {
  ALL_LESSONS,
  COURSE,
  LESSON_COUNT,
  findLesson,
  getProgress,
  getTodayActivity,
} from "@/lib/academy";
import { requireUser } from "@/lib/auth";
import { levelInfo } from "@/lib/progression";

const RECOMMENDED_LESSONS: Record<string, string> = {
  "legal-reading": "licence",
  contracts: "mandat",
  "sport-environment": "role",
  "football-regulations": "licence",
  "practical-cases": "mandat",
  "exam-method": "role",
};

function getScoreTone(score: number): string {
  if (score < 25) {
    return "#ff6b78";
  }

  if (score < 50) {
    return "#f0b35c";
  }

  if (score < 75) {
    return "#e9c36a";
  }

  return "var(--vert)";
}

export default async function AcademyHome() {
  const user = await requireUser();

  const [
    storedProgress,
    today,
    diagnosticReport,
    studyPlan,
  ] = await Promise.all([
    getProgress(user.id),
    getTodayActivity(user.id),
    loadLatestDiagnosticReport(),
    loadAcademyStudyPlan(),
  ]);

  const synchronizedXp = Math.max(
    storedProgress.xp,
    diagnosticReport?.progression.xpEarned ?? 0,
  );

  const progress =
    synchronizedXp === storedProgress.xp
      ? storedProgress
      : {
          ...storedProgress,
          xp: synchronizedXp,
          info: levelInfo(synchronizedXp),
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
    planCurrentDay?.recommendedLessonId ??
    (firstPriority
      ? RECOMMENDED_LESSONS[
          firstPriority.sectionId
        ]
      : null) ??
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
      icon: "📘",
    },
    {
      label: "Enchaîne 2 leçons",
      done: today.lessons >= 2,
      icon: "⚡",
    },
    {
      label: "Décroche un quiz à 100 %",
      done: today.perfect >= 1,
      icon: "🎯",
    },
  ];

  const completedChallenges =
    challenges.filter(
      (challenge) => challenge.done,
    ).length;

  return (
    <div className="flex flex-col gap-6">
      <AcademyProgressHeader
        progress={progress}
        doneCount={doneCount}
        total={LESSON_COUNT}
      />

      {diagnosticReport ? (
        <section
          className="pz-card p-5 pz-rise pz-d1"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(37,194,110,.13), transparent 42%), linear-gradient(145deg, rgba(255,255,255,.035), rgba(255,255,255,.015))",
            borderColor:
              "rgba(37,194,110,.24)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
                style={{ color: "var(--vert)" }}
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
                  "rgba(255,255,255,.035)",
                border: `2px solid ${scoreTone}`,
                boxShadow: `0 0 26px ${scoreTone}22`,
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
                  "rgba(255,255,255,.035)",
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
                  "rgba(255,255,255,.035)",
                border:
                  "1px solid var(--ligne)",
              }}
            >
              <strong
                className="block text-[16px]"
                style={{ color: "#e9c36a" }}
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
                  "rgba(255,255,255,.035)",
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
                "rgba(255,255,255,.035)",
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
        </section>
      ) : (
        <section
          className="pz-card p-5 pz-rise pz-d1"
          style={{
            borderColor:
              "rgba(37,194,110,.25)",
          }}
        >
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
            style={{ color: "var(--vert)" }}
          >
            MODULE 0
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
              color: "#06130c",
              background:
                "linear-gradient(135deg, #44dc8c, #20b968)",
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
          className="pz-card p-5 pz-rise pz-d2"
          style={{
            background:
              "linear-gradient(145deg, rgba(228,0,43,.09), rgba(255,255,255,.018))",
            borderColor:
              "rgba(228,0,43,.25)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] pz-red">
                🎯 MISSION ACTUELLE
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
                  "rgba(255,255,255,.035)",
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
                "rgba(255,255,255,.035)",
              border: "1px solid var(--ligne)",
            }}
          >
            <div className="text-[9px] font-bold uppercase tracking-[0.13em] pz-muted">
              MISSION À VALIDER
            </div>

            <h3 className="text-[15px] font-extrabold mt-2">
              {recommendedLesson.lesson.title}
            </h3>

            <p className="text-[11px] leading-5 pz-muted mt-1">
              {firstMission?.activity ??
                recommendedLesson.lesson.intro}
            </p>

            <div className="flex items-center gap-3 mt-3 text-[10px] pz-muted">
              <span>
                ⏱ {recommendedLesson.lesson.minutes} min
              </span>

              <span>
                📝 {recommendedLesson.lesson.quiz.length} quiz
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
                "0 14px 35px rgba(228,0,43,.2)",
            }}
          >
            Continuer ma mission du jour →
          </Link>
        </section>
      ) : null}

      <section
        className="pz-card p-5 pz-rise pz-d2"
        style={{
          borderColor:
            completedChallenges ===
            challenges.length
              ? "rgba(37,194,110,.35)"
              : undefined,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold tracking-wider pz-red">
            ✦ DÉFIS DU JOUR
          </div>

          <span className="text-[12px] pz-muted">
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
                    : "rgba(255,255,255,.06)",
                  color: challenge.done
                    ? "#06210f"
                    : "var(--gris2)",
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
                {challenge.icon} {challenge.label}
              </span>
            </div>
          ))}
        </div>

        {completedChallenges ===
        challenges.length ? (
          <p
            className="text-[12px] mt-3"
            style={{ color: "var(--vert)" }}
          >
            🔥 Tous les défis du jour relevés — reviens
            demain pour la suite !
          </p>
        ) : null}
      </section>

      <div className="pz-rise pz-d2">
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
            className={`pz-rise pz-d${Math.min(
              5,
              chapterIndex + 3,
            )}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-[11px] font-bold tracking-wider pz-red">
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

      <Link
        href="/academy/certifications"
        className="pz-card p-5 pz-rise pz-d5 flex items-center gap-4"
        style={{
          borderColor:
            "rgba(233,195,106,.35)",
        }}
      >
        <div className="text-[26px]">🎓</div>

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

      <div className="grid grid-cols-3 gap-3 pz-rise pz-d5">
        <Link
          href="/academy/classement"
          className="pz-card p-4 text-center card-hover"
        >
          <div className="text-[20px]">🏆</div>
          <div className="text-[12px] font-semibold mt-1">
            Classement
          </div>
        </Link>

        <Link
          href="/academy/badges"
          className="pz-card p-4 text-center card-hover"
        >
          <div className="text-[20px]">🎖️</div>
          <div className="text-[12px] font-semibold mt-1">
            Badges
          </div>
        </Link>

        <Link
          href="/academy/trophees"
          className="pz-card p-4 text-center card-hover"
        >
          <div className="text-[20px]">🏅</div>
          <div className="text-[12px] font-semibold mt-1">
            Trophées
          </div>
        </Link>
      </div>
    </div>
  );
}
