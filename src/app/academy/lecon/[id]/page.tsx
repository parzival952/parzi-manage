export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

import LessonQuiz from "@/components/LessonQuiz";
import {
  loadLatestDiagnosticReport,
} from "@/lib/academy-diagnostic-report";
import {
  completeSecureLesson,
} from "@/lib/academy-lesson-store";
import { findLesson } from "@/lib/academy";
import { requireUser } from "@/lib/auth";

const RECOMMENDED_LESSONS: Record<string, string> = {
  "legal-reading": "licence",
  contracts: "mandat",
  "sport-environment": "role",
  "football-regulations": "licence",
  "practical-cases": "mandat",
  "exam-method": "role",
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await requireUser();

  const found = findLesson(id);

  if (!found) {
    notFound();
  }

  const { chapter, lesson, index } = found;

  const report =
    await loadLatestDiagnosticReport();

  const priority =
    report?.priorities[0] ?? null;

  const recommendedLessonId = priority
    ? RECOMMENDED_LESSONS[priority.sectionId]
    : null;

  const isMission =
    recommendedLessonId === lesson.id;

  const missionDay =
    report?.studyPlan.days.find(
      (day) => day.focus === priority?.label,
    ) ??
    report?.studyPlan.days[0] ??
    null;

  async function complete(
    answers: number[],
  ) {
    "use server";

    await requireUser();

    const result =
      await completeSecureLesson(
        lesson.id,
        answers,
      );

    revalidatePath("/academy");
    revalidatePath("/academy/profil");
    revalidatePath(
      "/academy/diagnostic/resultats",
    );

    return result;
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="pz-rise">
        <Link
          href="/academy"
          className="text-[12.5px] pz-muted hover:text-white"
        >
          ← {chapter.title}
        </Link>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-[12px] font-bold pz-red">
            LEÇON {index + 1}
          </span>

          <span className="text-[12px] pz-muted">
            · {lesson.minutes} min
          </span>
        </div>

        <h1 className="text-[22px] font-extrabold tracking-tight mt-1">
          {lesson.title}
        </h1>

        <p className="text-[14px] pz-muted mt-1.5">
          {lesson.intro}
        </p>
      </header>

      {isMission && priority ? (
        <section
          className="pz-card p-5 pz-rise pz-d1"
          style={{
            background:
              "linear-gradient(145deg, rgba(228,0,43,.10), rgba(255,255,255,.02))",
            borderColor:
              "rgba(228,0,43,.30)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] pz-red">
                🎯 MISSION PERSONNALISÉE
              </div>

              <h2 className="text-[17px] font-black mt-2">
                Priorité : {priority.label}
              </h2>

              <p className="text-[12px] leading-5 pz-muted mt-2">
                Cette leçon a été recommandée à partir
                de ton diagnostic réel.
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
              <strong className="block text-[17px] pz-red">
                {priority.score}%
              </strong>

              <span className="text-[8px] pz-muted">
                niveau actuel
              </span>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 mt-4"
            style={{
              background:
                "rgba(255,255,255,.035)",
              border:
                "1px solid var(--ligne)",
            }}
          >
            <div className="text-[9px] font-bold uppercase tracking-[0.13em] pz-muted">
              OBJECTIF DE LA MISSION
            </div>

            <p className="text-[12px] leading-5 mt-2">
              {missionDay?.activity ??
                "Comprendre la règle et obtenir au moins 70 % au quiz."}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] pz-muted">
              <span>
                Jour {missionDay?.day ?? 1}/14
              </span>

              <span>Objectif : 70 % minimum</span>

              <span>Jusqu’à 60 XP</span>
            </div>
          </div>

          <Link
            href="/academy/diagnostic/resultats#plan-revision"
            className="inline-flex mt-4 text-[11px] font-bold"
            style={{ color: "var(--vert)" }}
          >
            Voir mon plan complet sur 14 jours →
          </Link>
        </section>
      ) : null}

      <section className="pz-card p-6 flex flex-col gap-4 pz-rise pz-d1">
        {lesson.blocks.map(
          (block, blockIndex) => (
            <p
              key={blockIndex}
              className="text-[14.5px] leading-relaxed"
              style={{ color: "#D8DADF" }}
            >
              {block}
            </p>
          ),
        )}
      </section>

      <section className="pz-rise pz-d2">
        <div className="text-[11px] font-bold tracking-wider pz-red mb-3">
          QUIZ — VALIDE TA LEÇON
        </div>

        <LessonQuiz
          questions={lesson.quiz}
          onComplete={complete}
          isMission={isMission}
        />
      </section>
    </div>
  );
}
