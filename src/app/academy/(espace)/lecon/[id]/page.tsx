export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

import LessonAside from "@/components/LessonAside";
import LessonReader from "@/components/LessonReader";
import LessonQuiz from "@/components/LessonQuiz";
import {
  loadLatestDiagnosticReport,
} from "@/lib/academy-diagnostic-report";
import {
  completeSecureLesson,
  type SecureLessonResult,
} from "@/lib/academy-lesson-store";
import { ALL_LESSONS, COURSE, completeLesson, findLesson } from "@/lib/academy";
import { extractPoints } from "@/lib/academy-aide-memoire";
import { academyStateToProgress, loadAcademyState } from "@/lib/academy-state";
import { primaryLessonForSection } from "@/lib/academy-recommendations";
import {
  isConfidenceValue,
  type ConfidenceValue,
} from "@/lib/academy-confidence";
import { requireUser } from "@/lib/auth";
import AcademyIcon from "@/components/AcademyIcon";

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

  const [report, academyState] = await Promise.all([
    loadLatestDiagnosticReport(),
    loadAcademyState(),
  ]);

  // Panneau latéral (ordinateur) : progression du chapitre, points clés,
  // leçons voisines.
  const done = academyState
    ? academyStateToProgress(academyState).done
    : new Set<string>();
  const chapterNumber =
    COURSE.chapters.findIndex((c) => c.id === chapter.id) + 1;
  const keyPoints = extractPoints(lesson.blocks);
  const previousEntry = index > 0 ? ALL_LESSONS[index - 1] : null;
  const nextEntry =
    index < ALL_LESSONS.length - 1 ? ALL_LESSONS[index + 1] : null;
  const previous = previousEntry
    ? { id: previousEntry.lesson.id, title: previousEntry.lesson.title }
    : null;
  const next = nextEntry
    ? { id: nextEntry.lesson.id, title: nextEntry.lesson.title }
    : null;

  const priority =
    report?.priorities[0] ?? null;

  const recommendedLessonId = priority
    ? primaryLessonForSection(priority.sectionId)
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
    confidences?: ConfidenceValue[],
  ) {
    "use server";

    // Niveaux d'assurance : transmis seulement s'ils sont complets et valides.
    const validConfidences =
      Array.isArray(confidences) &&
      confidences.length === lesson.quiz.length &&
      confidences.every(isConfidenceValue)
        ? confidences
        : undefined;

    const user = await requireUser();

    let result: SecureLessonResult;

    if (
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY
    ) {
      // Prod : correction 100 % côté serveur (RPC Supabase).
      result = await completeSecureLesson(
        lesson.id,
        answers,
        validConfidences,
      );
    } else {
      // Démo / dev sans Supabase : correction contre le contenu + persistance dual-mode (SQLite).
      let correct = 0;
      lesson.quiz.forEach((q, i) => {
        if (answers[i] === q.answer) {
          correct += 1;
        }
      });
      const score =
        lesson.quiz.length > 0
          ? Math.round((correct / lesson.quiz.length) * 100)
          : 0;
      const r = await completeLesson(user.id, lesson.id, score);
      result = {
        already: r.already,
        xpGained: r.xpGained,
        score,
        previousXp: Math.max(0, r.info.xp - r.xpGained),
        totalXp: r.info.xp,
        streak: r.streak,
        leveledUp: r.leveledUp,
        newLevel: r.newLevel,
      };
    }

    revalidatePath("/academy");
    revalidatePath("/academy/profil");
    revalidatePath(
      "/academy/diagnostic/resultats",
    );

    return result;
  }

  return (
    <div className="pz-wide lg:grid lg:grid-cols-[minmax(0,760px)_300px] lg:justify-center lg:gap-10 lg:items-start">
    <div className="flex flex-col gap-5 min-w-0 max-w-[780px] mx-auto lg:mx-0 w-full">
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
              "linear-gradient(145deg, rgba(194,24,51,.10), rgba(var(--ink-rgb),.02))",
            borderColor:
              "rgba(194,24,51,.30)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="pz-eyebrow pz-red inline-flex items-center gap-1.5">
                <AcademyIcon name="target" size={12} /> Mission personnalisée
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
                  "rgba(var(--ink-rgb),.04)",
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
                "rgba(var(--ink-rgb),.035)",
              border:
                "1px solid var(--ligne)",
            }}
          >
            <div className="pz-eyebrow pz-muted">
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
            style={{ color: "var(--argent)" }}
          >
            Voir mon plan complet sur 14 jours →
          </Link>
        </section>
      ) : null}

      <LessonReader blocks={lesson.blocks} />

      <section id="quiz" className="pz-rise pz-d2 scroll-mt-24">
        <div className="pz-eyebrow pz-red mb-3">
          QUIZ — VALIDE TA LEÇON
        </div>

        <LessonQuiz
          questions={lesson.quiz}
          onComplete={complete}
          isMission={isMission}
        />
      </section>

      {/* Téléphone / tablette : leçons voisines sous le quiz. */}
      <nav className="lg:hidden grid grid-cols-2 gap-2" aria-label="Leçons voisines">
        {previous ? (
          <Link href={`/academy/lecon/${previous.id}`} className="pz-card p-3 text-[12px] leading-snug">
            <span className="pz-muted block">← Précédente</span>
            <span className="line-clamp-2">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/academy/lecon/${next.id}`} className="pz-card p-3 text-[12px] leading-snug text-right">
            <span className="pz-muted block">Suivante →</span>
            <span className="line-clamp-2">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </div>

    <LessonAside
      chapter={chapter}
      chapterNumber={chapterNumber}
      lesson={lesson}
      done={done}
      keyPoints={keyPoints}
      previous={previous}
      next={next}
    />
    </div>
  );
}
