export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { COURSE, LESSON_COUNT, ALL_LESSONS, getProgress, getTodayActivity } from "@/lib/academy";
import AcademyProgressHeader from "@/components/AcademyProgressHeader";

export default async function AcademyHome() {
  const user = await requireUser();
  const [progress, today] = await Promise.all([getProgress(user.id), getTodayActivity(user.id)]);
  const doneCount = progress.done.size;

  // Leçon "courante" = première non terminée.
  const currentId = ALL_LESSONS.find((x) => !progress.done.has(x.lesson.id))?.lesson.id;

  // Défis du jour (calculés sur l'activité réelle du jour).
  const defis = [
    { label: "Valide une leçon aujourd'hui", done: today.lessons >= 1, icon: "📘" },
    { label: "Enchaîne 2 leçons", done: today.lessons >= 2, icon: "⚡" },
    { label: "Décroche un quiz à 100 %", done: today.perfect >= 1, icon: "🎯" },
  ];
  const defisDone = defis.filter((d) => d.done).length;

  return (
    <div className="flex flex-col gap-6">
      <AcademyProgressHeader progress={progress} doneCount={doneCount} total={LESSON_COUNT} />

      {/* Défis du jour */}
      <div className="pz-card p-5 pz-rise pz-d1" style={{ borderColor: defisDone === defis.length ? "rgba(37,194,110,.35)" : undefined }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold tracking-wider pz-red">✦ DÉFIS DU JOUR</div>
          <span className="text-[12px] pz-muted">{defisDone}/{defis.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          {defis.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="grid place-items-center w-6 h-6 rounded-full text-[12px] shrink-0"
                style={{ background: d.done ? "var(--vert)" : "rgba(255,255,255,.06)", color: d.done ? "#06210f" : "var(--gris2)", border: d.done ? "none" : "1px solid var(--ligne)" }}>
                {d.done ? "✓" : ""}
              </span>
              <span className="text-[13.5px]" style={{ color: d.done ? "var(--gris)" : "var(--blanc)", textDecoration: d.done ? "line-through" : "none" }}>
                {d.icon} {d.label}
              </span>
            </div>
          ))}
        </div>
        {defisDone === defis.length && <p className="text-[12px] mt-3" style={{ color: "var(--vert)" }}>🔥 Tous les défis du jour relevés — reviens demain pour la suite !</p>}
      </div>

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

      <div className="grid grid-cols-3 gap-3 pz-rise pz-d5">
        <Link href="/academy/classement" className="pz-card p-4 text-center card-hover"><div className="text-[20px]">🏆</div><div className="text-[12px] font-semibold mt-1">Classement</div></Link>
        <Link href="/academy/badges" className="pz-card p-4 text-center card-hover"><div className="text-[20px]">🎖️</div><div className="text-[12px] font-semibold mt-1">Badges</div></Link>
        <Link href="/academy/trophees" className="pz-card p-4 text-center card-hover"><div className="text-[20px]">🏅</div><div className="text-[12px] font-semibold mt-1">Trophées</div></Link>
      </div>
    </div>
  );
}
