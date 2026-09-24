export const dynamic = "force-dynamic";

import Link from "next/link";

import NegotiationSim from "@/components/NegotiationSim";
import { COURSE } from "@/lib/academy";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Simulation de négociation" };

export default async function SimulationPage() {
  await requireUser();

  // Titres des leçons citées dans le débrief (liens « Relire »).
  const lessonTitles: Record<string, string> = {};
  for (const chapter of COURSE.chapters) {
    if (chapter.id !== "art-negociation") continue;
    for (const lesson of chapter.lessons) lessonTitles[lesson.id] = lesson.title;
  }

  return (
    <main className="pz-wide flex flex-col gap-6 max-w-[1100px] mx-auto w-full">
      <header className="pz-rise">
        <Link href="/academy/chapitre/art-negociation" className="text-[12.5px] pz-muted hover:text-white">
          ← L&apos;art de la négociation
        </Link>
        <div className="pz-eyebrow mt-4" style={{ color: "var(--argent)" }}>
          Mise en situation
        </div>
        <h1 className="text-[26px] font-black tracking-tight mt-2">Simulation de négociation</h1>
        <p className="text-[13.5px] leading-6 pz-muted mt-2 max-w-[640px]">
          Tu es l&apos;agent. En face, un directeur sportif qui connaît son métier. Mets en pratique la préparation,
          l&apos;ancrage, l&apos;écoute et la concession réciproque, puis découvre ce que chaque décision t&apos;a
          rapporté.
        </p>
      </header>

      <NegotiationSim lessonTitles={lessonTitles} />
    </main>
  );
}
