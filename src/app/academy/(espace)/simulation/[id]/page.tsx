export const dynamic = "force-dynamic";

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import SimulationGame, { type FinishResult } from "@/components/SimulationGame";
import { COURSE } from "@/lib/academy";
import { getSimulationBests, InvalidRunError, recordSimulationRun } from "@/lib/academy-simulation-xp";
import { requireUser } from "@/lib/auth";
import { getScenario } from "@/lib/simulation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sc = getScenario(id);
  return { title: sc ? `Simulation · ${sc.title}` : "Simulation" };
}

export default async function SimulationScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const scenario = getScenario(id);
  if (!scenario) notFound();
  const scenarioId = scenario.id;

  const bests = await getSimulationBests(user.id);
  const chapter = COURSE.chapters.find((c) => c.id === scenario.chapterId);

  // Titres des leçons citées dans le débrief (liens « Relire »).
  const lessonTitles: Record<string, string> = {};
  for (const c of COURSE.chapters) for (const l of c.lessons) lessonTitles[l.id] = l.title;

  // Fin de partie : le serveur rejoue les choix, recalcule le score et crédite
  // l'XP du palier atteint (une seule fois par palier et par scénario).
  async function finish(prep: string[], choices: string[]): Promise<FinishResult> {
    "use server";
    const me = await requireUser();
    try {
      const record = await recordSimulationRun(me.id, scenarioId, prep, choices);
      if (record.xpGained > 0) revalidatePath("/academy", "layout");
      return record;
    } catch (err) {
      if (err instanceof InvalidRunError) return { error: "Partie invalide" };
      console.error("[academy-simulation] enregistrement impossible", err);
      return { error: "Enregistrement impossible" };
    }
  }

  return (
    <main className="pz-wide flex flex-col gap-6 max-w-[1100px] mx-auto w-full">
      <header className="pz-rise">
        <Link href="/academy/simulation" className="text-[12.5px] pz-muted hover:text-white">
          ← Toutes les mises en situation
        </Link>
        <div className="pz-eyebrow mt-4" style={{ color: "var(--argent)" }}>
          Mise en situation · {scenario.theme}
        </div>
        <h1 className="text-[26px] font-black tracking-tight mt-2">{scenario.title}</h1>
        <p className="text-[13.5px] leading-6 pz-muted mt-2 max-w-[640px]">
          {scenario.pitch}
          {chapter ? (
            <>
              {" "}
              À faire après le chapitre{" "}
              <Link href={`/academy/chapitre/${chapter.id}`} className="underline underline-offset-2">
                {chapter.title}
              </Link>
              .
            </>
          ) : null}
        </p>
      </header>

      <SimulationGame
        scenarioId={scenario.id}
        lessonTitles={lessonTitles}
        initialBest={bests[scenario.id] ?? null}
        onFinish={finish}
      />
    </main>
  );
}
