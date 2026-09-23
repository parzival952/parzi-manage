export const dynamic = "force-dynamic";

import Link from "next/link";

import PrintButton from "@/components/PrintButton";
import { buildAideMemoire } from "@/lib/academy-aide-memoire";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Aide-mémoire" };

export default async function AcademyAideMemoirePage() {
  await requireUser();

  const chapters = buildAideMemoire();
  const totalLessons = chapters.reduce((n, c) => n + c.lessons.length, 0);
  const totalPoints = chapters.reduce(
    (n, c) => n + c.lessons.reduce((m, l) => m + l.points.length, 0),
    0,
  );

  return (
    <main className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <header className="lg:col-span-2 pz-rise">
        <Link href="/academy" className="text-[12px] pz-muted hover:text-white">
          ← Retour à PARZI Academy
        </Link>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <div
              className="pz-eyebrow"
              style={{ color: "var(--rouge-vif)" }}
            >
              RÉVISION EXPRESS
            </div>
            <h1 className="text-[26px] font-black tracking-tight mt-2">
              Aide-mémoire
            </h1>
            <p className="text-[13px] leading-6 pz-muted mt-2 max-w-[620px]">
              Tous les points clés à retenir, chapitre par chapitre.
              L&apos;essentiel du programme pour réviser vite — avant un
              rendez-vous ou l&apos;examen.
            </p>
            <p className="text-[11px] pz-muted mt-2">
              {totalPoints} points clés · {totalLessons} leçons ·{" "}
              {chapters.length} chapitres
            </p>
          </div>

          <PrintButton />
        </div>
      </header>

      {chapters.map((chapter, i) => (
        <section
          key={chapter.id}
          className={"pz-card p-5 pz-rise pz-d" + Math.min(5, i + 1)}
        >
          <h2 className="text-[17px] font-black">{chapter.title}</h2>
          <div className="text-[12px] pz-muted mt-1">{chapter.subtitle}</div>

          <div className="flex flex-col gap-3 mt-4">
            {chapter.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-2xl p-3"
                style={{
                  background: "rgba(var(--ink-rgb),.03)",
                  border: "1px solid var(--ligne)",
                }}
              >
                <Link
                  href={"/academy/lecon/" + lesson.id}
                  className="text-[13.5px] font-extrabold hover:underline"
                  style={{ color: "var(--rouge)" }}
                >
                  {lesson.title}
                </Link>

                <ul className="mt-2 flex flex-col gap-1.5">
                  {lesson.points.map((point, idx) => (
                    <li
                      key={idx}
                      className="text-[12.5px] leading-6 flex gap-2"
                      style={{ color: "var(--texte-2)" }}
                    >
                      <span aria-hidden style={{ color: "var(--vert)" }}>
                        ▸
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="lg:col-span-2 pz-rise pz-d5 text-center no-print">
        <Link
          href="/academy/revision"
          className="text-[12px] font-bold pz-red hover:underline"
        >
          Voir aussi : la révision intelligente →
        </Link>
      </div>
    </main>
  );
}
