export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import AcademyIcon from "@/components/AcademyIcon";
import ProgressRing from "@/components/ProgressRing";
import { COURSE } from "@/lib/academy";
import { extractPoints } from "@/lib/academy-aide-memoire";
import { chapterView, phaseOfChapter } from "@/lib/academy-roadmap";
import { academyStateToProgress, loadAcademyState } from "@/lib/academy-state";
import { requireUser } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapter = COURSE.chapters.find((c) => c.id === id);
  return { title: chapter ? chapter.title : "Chapitre" };
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();

  const index = COURSE.chapters.findIndex((c) => c.id === id);
  if (index < 0) notFound();
  const chapter = COURSE.chapters[index];

  const state = await loadAcademyState();
  const done = state ? academyStateToProgress(state).done : new Set<string>();
  const view = chapterView(chapter, done, null);
  const phase = phaseOfChapter(chapter.id);
  const prev = index > 0 ? COURSE.chapters[index - 1] : null;
  const next = index < COURSE.chapters.length - 1 ? COURSE.chapters[index + 1] : null;
  const keyPoints = chapter.lessons.flatMap((l) => extractPoints(l.blocks)).slice(0, 8);
  const cta = view.nextLesson;

  return (
    <div className="pz-wide lg:grid lg:grid-cols-[minmax(0,760px)_300px] lg:justify-center lg:gap-10 lg:items-start">
      <div className="flex flex-col gap-6 min-w-0 max-w-[780px] mx-auto lg:mx-0 w-full">
        <header className="pz-rise">
          <Link href="/academy" className="text-[12.5px] pz-muted hover:text-white">
            ← Ta route vers la licence
          </Link>
          <div className="flex items-start justify-between gap-5 mt-4">
            <div className="min-w-0">
              <div className="pz-eyebrow pz-red">
                Chapitre {view.number}
                {phase ? ` · Phase ${phase.number} — ${phase.phase.title}` : ""}
              </div>
              <h1 className="text-[28px] leading-tight mt-2">{chapter.title}</h1>
              <p className="text-[14px] pz-muted mt-2">{chapter.subtitle}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11.5px] pz-muted pz-mono">
                <span>{view.total} leçons</span>
                <span>{view.minutes} min</span>
                <span>
                  {view.done}/{view.total} validées
                </span>
              </div>
            </div>
            <ProgressRing
              size={76}
              stroke={5}
              value={view.total ? view.done / view.total : 0}
              label={view.status === "done" ? "✓" : `${Math.round((view.done / view.total) * 100)}%`}
              complete={view.status === "done"}
            />
          </div>

          {cta ? (
            <Link href={`/academy/lecon/${cta.id}`} className="pz-btn mt-5">
              {view.done === 0 ? "Commencer" : "Reprendre"} : {cta.title} →
            </Link>
          ) : (
            <div className="mt-5 text-[13px] font-semibold" style={{ color: "var(--vert)" }}>
              Chapitre terminé — tu peux le réviser quand tu veux.
            </div>
          )}
        </header>

        <ol className="flex flex-col gap-3 pz-rise pz-d1" aria-label="Leçons du chapitre">
          {chapter.lessons.map((lesson, i) => {
            const isDone = done.has(lesson.id);
            const isNext = cta?.id === lesson.id;
            return (
              <li key={lesson.id}>
                <Link
                  href={`/academy/lecon/${lesson.id}`}
                  className="pz-card p-4 flex items-start gap-4 transition-transform hover:-translate-y-0.5"
                  style={isNext ? { borderColor: "rgba(194,24,51,.45)" } : undefined}
                >
                  <span className={`pz-node ${isDone ? "done" : isNext ? "current" : "locked"}`} style={{ width: 48, height: 48, fontSize: 18, borderRadius: 14 }}>
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[15px]">{lesson.title}</span>
                    <span className="block text-[12.5px] leading-5 pz-muted mt-0.5">{lesson.intro}</span>
                    <span className="flex flex-wrap gap-x-3 mt-1.5 text-[11px] pz-muted pz-mono">
                      <span>{lesson.minutes} min</span>
                      <span>{lesson.quiz.length} questions</span>
                      {isDone ? <span style={{ color: "var(--vert)" }}>validée</span> : isNext ? <span className="pz-red">à faire</span> : null}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <nav className="grid grid-cols-2 gap-2 pz-rise pz-d2" aria-label="Chapitres voisins">
          {prev ? (
            <Link href={`/academy/chapitre/${prev.id}`} className="pz-card p-3 text-[12px] leading-snug hover:text-white">
              <span className="pz-muted block">← Chapitre précédent</span>
              <span className="line-clamp-2">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/academy/chapitre/${next.id}`} className="pz-card p-3 text-[12px] leading-snug text-right hover:text-white">
              <span className="pz-muted block">Chapitre suivant →</span>
              <span className="line-clamp-2">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </div>

      <aside className="hidden lg:flex flex-col gap-4 sticky top-24">
        {keyPoints.length ? (
          <section className="pz-card p-4">
            <div className="pz-eyebrow inline-flex items-center gap-1.5" style={{ color: "var(--argent)" }}>
              <AcademyIcon name="target" size={12} /> L&apos;essentiel du chapitre
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
        {view.domains.length ? (
          <section className="pz-card p-4">
            <div className="pz-eyebrow pz-muted">Compétences travaillées</div>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {view.domains.map((d) => (
                <span key={d.key} className="pz-mono text-[10.5px] uppercase tracking-wider rounded px-2 py-1" style={{ border: "1px solid var(--ligne)", color: "var(--texte-2)" }}>
                  {d.label}
                </span>
              ))}
            </div>
            <p className="text-[11.5px] pz-muted mt-2.5">Chaque leçon validée fait monter ces attributs sur ta carte d&apos;agent.</p>
          </section>
        ) : null}
        <Link href="/academy/aide-memoire" className="text-[11.5px] pz-muted hover:text-white text-center">
          Tous les points clés du programme →
        </Link>
      </aside>
    </div>
  );
}
