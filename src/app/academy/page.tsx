export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { COURSE, LESSON_COUNT, ALL_LESSONS, getProgress } from "@/lib/academy";
import AcademyProgressHeader from "@/components/AcademyProgressHeader";

export default async function AcademyHome() {
  const user = await requireUser();
  const progress = await getProgress(user.id);
  const doneCount = progress.done.size;

  // Leçon "courante" = première non terminée.
  const currentId = ALL_LESSONS.find((x) => !progress.done.has(x.lesson.id))?.lesson.id;

  return (
    <div className="flex flex-col gap-6">
      <AcademyProgressHeader progress={progress} doneCount={doneCount} total={LESSON_COUNT} />

      <div className="pz-rise pz-d1">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[20px] font-extrabold tracking-tight">{COURSE.title}</h1>
          <span className="text-[12px] pz-muted">{doneCount}/{LESSON_COUNT} leçons</span>
        </div>
        <p className="text-[13.5px] pz-muted mt-1">Des leçons courtes, un quiz, de l&apos;XP. Reviens chaque jour pour garder ta série.</p>
      </div>

      {COURSE.chapters.map((chapter, ci) => (
        <section key={chapter.id} className={`pz-rise pz-d${Math.min(5, ci + 2)}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-[11px] font-bold tracking-wider pz-red">CHAPITRE {ci + 1}</div>
            <div className="h-px flex-1" style={{ background: "var(--ligne)" }} />
          </div>
          <h2 className="text-[16px] font-bold mb-0.5">{chapter.title}</h2>
          <p className="text-[13px] pz-muted mb-5">{chapter.subtitle}</p>

          <div className="flex flex-col items-start">
            {chapter.lessons.map((lesson, li) => {
              const done = progress.done.has(lesson.id);
              const current = lesson.id === currentId;
              const state = done ? "done" : current ? "current" : "locked";
              return (
                <div key={lesson.id} className="w-full">
                  {li > 0 && <div className={`pz-connector ml-8 ${chapter.lessons[li - 1] && progress.done.has(chapter.lessons[li - 1].id) ? "done" : ""}`} />}
                  <Link href={`/academy/lecon/${lesson.id}`} className="flex items-center gap-4 group">
                    <div className={`pz-node ${state}`}>{done ? "✓" : li + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14.5px] group-hover:text-white" style={{ color: state === "locked" ? "var(--gris)" : "var(--blanc)" }}>
                        {lesson.title}
                      </div>
                      <div className="text-[12px] pz-muted">
                        {lesson.minutes} min · {lesson.quiz.length} question{lesson.quiz.length > 1 ? "s" : ""}
                        {done && <span className="pz-red"> · validée</span>}
                        {current && <span className="pz-red"> · à faire</span>}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="pz-card p-5 text-center pz-rise pz-d5">
        <div className="text-[13.5px] pz-muted">Bientôt : ligues hebdomadaires, badges, trophées, simulations de négociation.</div>
      </div>
    </div>
  );
}
