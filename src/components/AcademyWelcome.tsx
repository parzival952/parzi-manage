import Link from "next/link";

import { GOAL_HEADLINES, paceSentence, type Pace } from "@/lib/academy-goal-plan";

/**
 * Accueil personnalisé en tête de l'Academy : prénom, objectif choisi à
 * l'inscription, et rythme conseillé jusqu'à l'examen.
 */
export default function AcademyWelcome({
  firstName,
  goal,
  pace,
  className = "",
}: {
  firstName: string;
  goal: string | null;
  pace: Pace;
  className?: string;
}) {
  const headline = (goal && GOAL_HEADLINES[goal]) || "Ta formation d'agent";
  return (
    <section className={`pz-card px-5 py-4 pz-rise ${className}`} aria-label="Accueil">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] pz-muted">Salut {firstName},</div>
          <h2 className="text-[20px] font-black tracking-tight mt-0.5">{headline}</h2>
          <p className="text-[13px] leading-5 mt-1.5" style={{ color: "var(--texte-2)" }}>
            {paceSentence(pace)}
          </p>
        </div>
        <Link
          href="/academy/bienvenue?etape=2"
          className="text-[12px] font-bold pz-muted hover:underline shrink-0 mt-0.5"
          aria-label="Modifier mon objectif et mon échéance"
        >
          Modifier
        </Link>
      </div>
    </section>
  );
}
