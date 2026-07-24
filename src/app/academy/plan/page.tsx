export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  loadAcademyStudyPlan,
} from "@/lib/academy-study-plan";
import { findLesson } from "@/lib/academy";
import { requireUser } from "@/lib/auth";

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default async function AcademyPlanPage() {
  await requireUser();

  const plan = await loadAcademyStudyPlan();

  if (!plan?.found) {
    redirect("/academy/diagnostic");
  }

  const completionPercent = Math.round(
    (plan.completedCount / plan.totalDays) *
      100,
  );

  const currentDay =
    plan.days.find((day) => day.isCurrent) ??
    null;

  const currentLesson = currentDay
    ? findLesson(
        currentDay.recommendedLessonId,
      )
    : null;

  return (
    <main className="flex flex-col gap-6">
      <header className="pz-rise">
        <Link
          href="/academy"
          className="text-[12px] pz-muted hover:text-white"
        >
          ← Retour à PARZI Academy
        </Link>

        <div className="mt-5 flex items-start justify-between gap-5">
          <div>
            <div
              className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
              style={{ color: "var(--vert)" }}
            >
              PARCOURS PERSONNALISÉ
            </div>

            <h1 className="text-[26px] font-black tracking-tight mt-2">
              Ton plan de progression
            </h1>

            <p className="text-[13px] leading-6 pz-muted mt-2 max-w-[620px]">
              Quatorze journées construites à
              partir de ton diagnostic. Chaque
              mission réussie débloque la suivante.
            </p>
          </div>

          <div
            className="rounded-3xl px-5 py-4 text-center shrink-0"
            style={{
              background:
                "linear-gradient(145deg, rgba(37,194,110,.12), rgba(255,255,255,.025))",
              border:
                "1px solid rgba(37,194,110,.25)",
            }}
          >
            <strong className="block text-[25px]">
              {plan.completedCount}/
              {plan.totalDays}
            </strong>

            <span className="text-[9px] pz-muted">
              journées validées
            </span>
          </div>
        </div>
      </header>

      <section className="pz-card p-5 pz-rise pz-d1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] pz-muted">
              PROGRESSION GLOBALE
            </div>

            <strong className="block text-[22px] mt-1">
              {completionPercent} %
            </strong>
          </div>

          <span className="text-[11px] pz-muted">
            Jour actuel :{" "}
            {plan.currentDay ??
              "plan terminé"}
          </span>
        </div>

        <div
          className="h-3 rounded-full overflow-hidden mt-4"
          style={{
            background:
              "rgba(255,255,255,.07)",
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${completionPercent}%`,
              background:
                "linear-gradient(90deg, var(--rouge), var(--vert))",
            }}
          />
        </div>
      </section>

      {currentDay && currentLesson ? (
        <section
          className="pz-card p-5 pz-rise pz-d2"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(228,0,43,.16), transparent 48%), rgba(255,255,255,.02)",
            borderColor:
              "rgba(228,0,43,.30)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] pz-red">
                🎯 MISSION ACTUELLE · JOUR{" "}
                {currentDay.day}
              </div>

              <h2 className="text-[20px] font-black mt-2">
                {currentDay.focus}
              </h2>

              <p className="text-[12px] leading-5 pz-muted mt-2">
                {currentDay.activity}
              </p>
            </div>

            <div
              className="rounded-2xl px-3 py-2 text-center shrink-0"
              style={{
                background:
                  "rgba(255,255,255,.04)",
                border:
                  "1px solid var(--ligne)",
              }}
            >
              <strong className="block text-[16px]">
                +5 XP
              </strong>

              <span className="text-[8px] pz-muted">
                bonus du plan
              </span>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 mt-5"
            style={{
              background:
                "rgba(255,255,255,.035)",
              border:
                "1px solid var(--ligne)",
            }}
          >
            <div className="text-[9px] font-bold uppercase tracking-[0.13em] pz-muted">
              LEÇON RECOMMANDÉE
            </div>

            <h3 className="text-[15px] font-extrabold mt-2">
              {currentLesson.lesson.title}
            </h3>

            <p className="text-[11px] leading-5 pz-muted mt-1">
              {currentLesson.lesson.intro}
            </p>

            <div className="flex flex-wrap gap-4 mt-3 text-[10px] pz-muted">
              <span>
                ⏱{" "}
                {currentLesson.lesson.minutes} min
              </span>

              <span>
                📝{" "}
                {currentLesson.lesson.quiz.length}{" "}
                questions
              </span>

              <span>
                Objectif : 70 % minimum
              </span>
            </div>
          </div>

          <Link
            href={`/academy/lecon/${currentLesson.lesson.id}`}
            className="pz-btn w-full mt-4"
          >
            Commencer la mission du jour →
          </Link>
        </section>
      ) : (
        <section
          className="pz-card p-6 text-center pz-rise pz-d2"
          style={{
            borderColor:
              "rgba(37,194,110,.30)",
          }}
        >
          <div className="text-[42px]">
            🏆
          </div>

          <h2 className="text-[21px] font-black mt-3">
            Plan de 14 jours terminé
          </h2>

          <p className="text-[12px] pz-muted mt-2">
            Toutes les missions personnalisées
            ont été validées.
          </p>

          <Link
            href="/academy"
            className="pz-btn inline-flex mt-5"
          >
            Retour à mon Academy
          </Link>
        </section>
      )}

      <section className="flex flex-col gap-3 pz-rise pz-d3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-black">
            Les 14 journées
          </h2>

          <span className="text-[11px] pz-muted">
            Progression enregistrée
          </span>
        </div>

        {plan.days.map((day) => {
          const lesson = findLesson(
            day.recommendedLessonId,
          );

          const completed =
            day.status === "completed";

          const locked =
            !day.isUnlocked && !completed;

          return (
            <article
              key={day.day}
              className="pz-card p-4"
              style={{
                opacity: locked ? 0.5 : 1,
                borderColor: completed
                  ? "rgba(37,194,110,.28)"
                  : day.isCurrent
                    ? "rgba(228,0,43,.34)"
                    : undefined,
                background: completed
                  ? "rgba(37,194,110,.045)"
                  : day.isCurrent
                    ? "rgba(228,0,43,.045)"
                    : undefined,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl grid place-items-center shrink-0"
                  style={{
                    color: completed
                      ? "#06210f"
                      : "var(--blanc)",
                    background: completed
                      ? "var(--vert)"
                      : day.isCurrent
                        ? "var(--rouge)"
                        : "rgba(255,255,255,.06)",
                    border:
                      completed ||
                      day.isCurrent
                        ? "none"
                        : "1px solid var(--ligne)",
                  }}
                >
                  {completed ? "✓" : day.day}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] pz-muted">
                        JOUR {day.day} ·{" "}
                        {formatDate(
                          day.scheduledDate,
                        )}
                      </span>

                      <h3 className="text-[14px] font-extrabold mt-1">
                        {day.focus}
                      </h3>
                    </div>

                    <span
                      className="text-[9px] font-bold rounded-full px-3 py-1 shrink-0"
                      style={{
                        color: completed
                          ? "var(--vert)"
                          : day.isCurrent
                            ? "#ff8290"
                            : "var(--gris2)",
                        background:
                          "rgba(255,255,255,.04)",
                        border:
                          "1px solid var(--ligne)",
                      }}
                    >
                      {completed
                        ? "VALIDÉE"
                        : day.isCurrent
                          ? "EN COURS"
                          : "VERROUILLÉE"}
                    </span>
                  </div>

                  <p className="text-[11px] leading-5 pz-muted mt-2">
                    {day.activity}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] pz-muted">
                    <span>
                      📘{" "}
                      {lesson?.lesson.title ??
                        day.recommendedLessonId}
                    </span>

                    {completed ? (
                      <>
                        <span>
                          +{day.xpAwarded} XP
                        </span>

                        <span>
                          Terminée
                        </span>
                      </>
                    ) : null}
                  </div>

                  {day.isCurrent && lesson ? (
                    <Link
                      href={`/academy/lecon/${lesson.lesson.id}`}
                      className="inline-flex mt-4 text-[11px] font-bold pz-red"
                    >
                      Ouvrir cette mission →
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
