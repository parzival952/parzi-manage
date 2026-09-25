export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";

import QuizLibreGame, { type DrawFn, type RecordFn } from "@/components/QuizLibreGame";
import { COURSE } from "@/lib/academy";
import { requireUser } from "@/lib/auth";
import {
  InvalidQuizError,
  QUIZ_COUNT,
  countByLevel,
  drawQuestions,
  getQuizBests,
  isLevel,
  isMode,
  recordQuizRun,
} from "@/lib/quiz-libre";
import { CHRONO_LENGTH, SERIE_LENGTH } from "@/lib/quiz-libre/types";

export const metadata = { title: "Quiz libre" };

const CHAPTER_IDS = new Set(COURSE.chapters.map((c) => c.id));

export default async function QuizLibrePage() {
  const user = await requireUser();
  const bests = await getQuizBests(user.id);

  const chapters = COURSE.chapters.map((c) => ({ id: c.id, title: c.title }));
  const lessonTitles: Record<string, string> = {};
  for (const c of COURSE.chapters) for (const l of c.lessons) lessonTitles[l.id] = l.title;
  const counts: Record<string, Record<number, number>> = { all: countByLevel(null) };
  for (const c of COURSE.chapters) counts[c.id] = countByLevel(c.id);

  // Tirage : 10 questions (série, chrono) ou un lot de 20 (sans fin).
  const draw: DrawFn = async (level, chapter, mode, exclude) => {
    "use server";
    await requireUser();
    if (!isLevel(level) || !isMode(mode)) return [];
    const ch = chapter && CHAPTER_IDS.has(chapter) ? chapter : null;
    const seen = Array.isArray(exclude) ? exclude.filter((x): x is string => typeof x === "string").slice(0, 2000) : [];
    const count = mode === "serie" ? SERIE_LENGTH : mode === "chrono" ? CHRONO_LENGTH : 20;
    return drawQuestions(level, ch, count, seen);
  };

  // Fin de partie : le serveur recorrige, garde le meilleur résultat et verse l'XP.
  const record: RecordFn = async (level, mode, answers) => {
    "use server";
    const me = await requireUser();
    if (!isLevel(level) || !isMode(mode)) return { error: "Partie invalide" };
    try {
      const res = await recordQuizRun(me.id, level, mode, answers);
      if (res.xpGained > 0) revalidatePath("/academy", "layout");
      return res;
    } catch (err) {
      if (err instanceof InvalidQuizError) return { error: "Partie invalide" };
      console.error("[quiz-libre] enregistrement impossible", err);
      return { error: "Enregistrement impossible" };
    }
  };

  return (
    <main className="pz-wide flex flex-col gap-6 max-w-[900px] mx-auto w-full">
      <header className="pz-rise">
        <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
          Entraînement
        </div>
        <h1 className="text-[28px] font-black tracking-tight mt-2">Quiz libre</h1>
        <p className="text-[13.5px] leading-6 pz-muted mt-2 max-w-[640px]">
          {QUIZ_COUNT} questions sur tout le programme, en 4 niveaux de difficulté. Choisis ton niveau, un module ou
          tout le programme, et ta façon de jouer.
        </p>
      </header>

      <QuizLibreGame
        chapters={chapters}
        counts={counts}
        lessonTitles={lessonTitles}
        initialBests={bests}
        draw={draw}
        record={record}
      />
    </main>
  );
}
