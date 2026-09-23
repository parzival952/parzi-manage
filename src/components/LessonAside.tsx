import Link from "next/link";
import type { ReactNode } from "react";

import AcademyIcon from "@/components/AcademyIcon";
import type { Chapter, Lesson } from "@/lib/academy";

type Neighbour = { id: string; title: string } | null;

/**
 * Panneau latéral d'une leçon (ordinateur uniquement) : sommaire du chapitre,
 * points à retenir, accès direct au quiz et navigation précédente / suivante.
 * Composant serveur pur.
 */
export default function LessonAside({
  chapter,
  chapterNumber,
  lesson,
  done,
  keyPoints,
  previous,
  next,
  notes,
}: {
  chapter: Chapter;
  chapterNumber: number;
  lesson: Lesson;
  done: Set<string>;
  keyPoints: string[];
  previous: Neighbour;
  next: Neighbour;
  notes?: ReactNode;
}) {
  const doneInChapter = chapter.lessons.filter((l) => done.has(l.id)).length;

  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-2">
      <section className="pz-card p-4">
        <div className="flex items-center justify-between">
          <div className="pz-eyebrow pz-red">Chapitre {chapterNumber}</div>
          <span className="text-[11px] pz-muted pz-mono">
            {doneInChapter}/{chapter.lessons.length}
          </span>
        </div>
        <div className="pz-titre text-[15px] mt-1.5 leading-snug">{chapter.title}</div>

        <ol className="mt-3 flex flex-col gap-0.5">
          {chapter.lessons.map((l, i) => {
            const current = l.id === lesson.id;
            const isDone = done.has(l.id);
            return (
              <li key={l.id}>
                <Link
                  href={`/academy/lecon/${l.id}`}
                  aria-current={current ? "page" : undefined}
                  className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] leading-snug transition-colors"
                  style={{
                    background: current ? "rgba(var(--ink-rgb),.06)" : "transparent",
                    color: current ? "var(--blanc)" : "var(--gris)",
                    fontWeight: current ? 600 : 400,
                  }}
                >
                  <span
                    className="pz-mono text-[10.5px] w-5 h-5 shrink-0 rounded-md grid place-items-center mt-px"
                    style={{
                      background: isDone ? "var(--rouge)" : "rgba(var(--ink-rgb),.05)",
                      color: isDone ? "#fff" : current ? "var(--blanc)" : "var(--gris)",
                      border: current && !isDone ? "1px solid var(--rouge)" : "1px solid transparent",
                    }}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span>{l.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {keyPoints.length > 0 ? (
        <section className="pz-card p-4">
          <div className="pz-eyebrow inline-flex items-center gap-1.5" style={{ color: "var(--argent)" }}>
            <AcademyIcon name="target" size={12} /> À retenir
          </div>
          <ul className="mt-2.5 flex flex-col gap-2">
            {keyPoints.map((point) => (
              <li key={point} className="flex gap-2 text-[12.5px] leading-5" style={{ color: "var(--texte-2)" }}>
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--rouge)" }} />
                {point}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {notes}

      <a href="#quiz" className="pz-btn w-full" style={{ padding: "11px 16px", fontSize: 13.5 }}>
        <AcademyIcon name="notes" size={15} /> Aller au quiz ({lesson.quiz.length} questions)
      </a>

      <nav className="grid grid-cols-2 gap-2" aria-label="Leçons voisines">
        {previous ? (
          <Link href={`/academy/lecon/${previous.id}`} className="pz-card p-3 text-[11.5px] leading-snug hover:text-white">
            <span className="pz-muted block">← Précédente</span>
            <span className="line-clamp-2">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/academy/lecon/${next.id}`} className="pz-card p-3 text-[11.5px] leading-snug text-right hover:text-white">
            <span className="pz-muted block">Suivante →</span>
            <span className="line-clamp-2">{next.title}</span>
          </Link>
        ) : null}
      </nav>

      <Link href="/academy/aide-memoire" className="text-[11.5px] pz-muted hover:text-white text-center">
        Tous les points clés du programme →
      </Link>
    </aside>
  );
}
