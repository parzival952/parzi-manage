import Link from "next/link";

import AcademyIcon from "@/components/AcademyIcon";

/** Encart « Mets-toi en situation » (chapitre et leçons de négociation). */
export default function SimulationCallout({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/academy/simulation"
      className={`pz-card p-4 flex items-center gap-4 transition-transform hover:-translate-y-0.5 ${className}`}
      style={{ background: "linear-gradient(145deg, rgba(194,24,51,.10), rgba(var(--ink-rgb),.02))", borderColor: "rgba(194,24,51,.30)" }}
    >
      <span
        className="w-11 h-11 rounded-[14px] grid place-items-center shrink-0 pz-red"
        style={{ background: "rgba(194,24,51,.12)", border: "1px solid rgba(194,24,51,.3)" }}
      >
        <AcademyIcon name="bolt" size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="pz-eyebrow pz-red block">Mise en situation</span>
        <span className="block font-semibold text-[15px] mt-1">Simulation : négocie le contrat de ton joueur</span>
        <span className="block text-[12.5px] leading-5 pz-muted mt-0.5">
          5 décisions face à un directeur sportif, une note sur 100 et le débrief de chaque choix.
        </span>
      </span>
      <span className="pz-muted shrink-0" aria-hidden>
        →
      </span>
    </Link>
  );
}
