import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import AcademyPublicShell from "@/components/AcademyPublicShell";
import { vitrineHref } from "@/lib/academy-host";
import SimulationGame from "@/components/SimulationGame";
import { COURSE } from "@/lib/academy-course";
import { TRIAL_SCENARIO_ID } from "@/lib/academy-offer";
import { getAcademyTheme } from "@/lib/academy-theme";
import { getScenario } from "@/lib/simulation";

// Essai sans compte : une simulation complète, jouée entièrement dans le
// navigateur. Rien n'est enregistré ; à la fin, invitation à créer un compte.
export const metadata = {
  title: "Essai gratuit · simulation",
  description: "Joue une mise en situation d'agent de joueur, sans compte : négocie le contrat de ton joueur.",
};

export default async function EssaiSimulationPage() {
  const theme = await getAcademyTheme();
  const home = vitrineHref((await headers()).get("host"));
  const scenario = getScenario(TRIAL_SCENARIO_ID);
  if (!scenario) notFound();

  const lessonTitles: Record<string, string> = {};
  for (const c of COURSE.chapters) for (const l of c.lessons) lessonTitles[l.id] = l.title;

  return (
    <AcademyPublicShell theme={theme}>
      <div className="px-4 md:px-8 py-8 md:py-10">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-6">
          <header className="pz-rise">
            <Link href={home} className="text-[12.5px] pz-muted hover:text-white">
              ← PARZI Academy
            </Link>
            <div className="pz-eyebrow mt-4" style={{ color: "var(--vert)" }}>
              Essai gratuit · sans compte
            </div>
            <h1 className="text-[26px] font-black tracking-tight mt-2">{scenario.title}</h1>
            <p className="text-[13.5px] leading-6 pz-muted mt-2 max-w-[640px]">
              {scenario.pitch} Environ 5 minutes. Ta partie n&apos;est pas enregistrée : crée ton compte pour garder
              ton score et gagner de l&apos;XP.
            </p>
          </header>
          <SimulationGame scenarioId={scenario.id} lessonTitles={lessonTitles} initialBest={null} trial />
        </div>
      </div>
    </AcademyPublicShell>
  );
}
