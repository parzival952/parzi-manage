import Link from "next/link";

import AcademyIcon from "@/components/AcademyIcon";
import ProgressRing from "@/components/ProgressRing";
import type { ChapterView, PhaseView } from "@/lib/academy-roadmap";

/**
 * « Ta route vers la licence » : le programme en 4 phases, chaque phase en
 * tuiles de chapitres, jalonnée par les certifications. Remplace la longue
 * liste de toutes les leçons : le détail vit dans la page de chaque chapitre.
 */
export default function CareerRoad({
  phases,
  lessonsDone,
  lessonCount,
  chaptersDone,
  chapterCount,
  className = "",
}: {
  phases: PhaseView[];
  lessonsDone: number;
  lessonCount: number;
  chaptersDone: number;
  chapterCount: number;
  className?: string;
}) {
  return (
    <section className={`pz-rise pz-d2 ${className}`} aria-label="Ta route vers la licence">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <div className="pz-eyebrow pz-red">Ta route vers la licence</div>
          <h2 className="text-[22px] mt-1.5">Devenir agent de joueur</h2>
        </div>
        <div className="text-[12px] pz-muted pz-mono">
          {lessonsDone}/{lessonCount} leçons · {chaptersDone}/{chapterCount} chapitres
        </div>
      </div>

      {/* Barre segmentée : une portion par phase, proportionnelle à son nombre de leçons. */}
      <div className="flex gap-1.5 mt-4" aria-hidden>
        {phases.map((p) => (
          <div key={p.id} className="h-1.5 rounded-full overflow-hidden" style={{ flex: p.total, background: "rgba(var(--ink-rgb),.08)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${p.total ? (p.done / p.total) * 100 : 0}%`,
                background: p.status === "done" ? "var(--vert)" : "var(--rouge)",
              }}
            />
          </div>
        ))}
      </div>

      <ol className="mt-7">
        {phases.map((phase, i) => (
          <PhaseBlock key={phase.id} phase={phase} last={i === phases.length - 1} />
        ))}
      </ol>
    </section>
  );
}

function PhaseBlock({ phase, last }: { phase: PhaseView; last: boolean }) {
  const dotStyle =
    phase.status === "done"
      ? { background: "var(--rouge)", color: "#fff", border: "1px solid var(--rouge)" }
      : phase.status === "active"
        ? { background: "var(--anthracite-2)", color: "var(--blanc)", border: "2px solid var(--rouge)" }
        : { background: "var(--anthracite)", color: "var(--gris)", border: "1px solid var(--ligne)" };

  return (
    <li className="relative pl-12 pb-9 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className="absolute left-[15px] top-9 bottom-1 w-[2px] rounded-full"
          style={{ background: phase.status === "done" ? "var(--rouge)" : "var(--ligne)" }}
        />
      ) : null}
      <span
        aria-hidden
        className="absolute left-0 top-0 w-8 h-8 rounded-full grid place-items-center pz-mono text-[12px]"
        style={dotStyle}
      >
        {phase.status === "done" ? "✓" : phase.number}
      </span>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <div className="pz-eyebrow pz-muted">
          Phase {phase.number}
          {phase.status === "active" ? <span className="pz-red"> · en cours</span> : null}
          {phase.status === "done" ? <span style={{ color: "var(--vert)" }}> · terminée</span> : null}
        </div>
        <span className="text-[11px] pz-muted pz-mono">
          {phase.done}/{phase.total} leçons
        </span>
      </div>
      <h3 className="pz-titre text-[19px] mt-1">{phase.title}</h3>
      <p className="text-[12.5px] pz-muted mt-0.5">{phase.subtitle}</p>

      <div className="grid gap-3 mt-4 sm:grid-cols-2">
        {phase.chapters.map((c) => (
          <ChapterTile key={c.chapter.id} view={c} />
        ))}
      </div>

      {phase.milestone ? <Milestone phase={phase} /> : null}
    </li>
  );
}

function ChapterTile({ view }: { view: ChapterView }) {
  const { chapter, status } = view;
  const active = status === "active";
  return (
    <Link
      href={`/academy/chapitre/${chapter.id}`}
      className="pz-card p-4 flex gap-3.5 items-start transition-transform hover:-translate-y-0.5"
      style={
        active
          ? {
              borderColor: "rgba(194,24,51,.45)",
              background: "linear-gradient(160deg, rgba(194,24,51,.08), transparent 60%), linear-gradient(180deg, var(--anthracite-2), var(--anthracite))",
            }
          : undefined
      }
    >
      <ProgressRing
        value={view.total ? view.done / view.total : 0}
        label={status === "done" ? "✓" : `${view.done}/${view.total}`}
        complete={status === "done"}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] pz-muted pz-mono">
          Chapitre {view.number} · {view.minutes} min
        </div>
        <div className="pz-titre text-[15.5px] leading-snug mt-0.5">{chapter.title}</div>
        <p className="text-[12px] leading-5 pz-muted mt-1 line-clamp-2">{chapter.subtitle}</p>

        <div className="text-[11.5px] mt-2 font-semibold">
          {status === "done" ? (
            <span style={{ color: "var(--vert)" }}>Chapitre terminé</span>
          ) : active && view.nextLesson ? (
            <span className="pz-red inline-flex items-center gap-1">
              Reprendre : <span className="font-normal" style={{ color: "var(--blanc)" }}>{view.nextLesson.title}</span>
            </span>
          ) : status === "started" ? (
            <span style={{ color: "var(--texte-2)" }}>En cours</span>
          ) : (
            <span className="pz-muted font-normal">À découvrir</span>
          )}
        </div>

        {view.domains.length ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {view.domains.map((d) => (
              <span
                key={d.key}
                className="pz-mono text-[9.5px] uppercase tracking-wider rounded px-1.5 py-0.5"
                style={{ border: "1px solid var(--ligne)", color: "var(--gris)" }}
              >
                {d.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function Milestone({ phase }: { phase: PhaseView }) {
  const m = phase.milestone!;
  const state = phase.milestoneState ?? "locked";
  const tone = state === "earned" ? "var(--or)" : state === "available" ? "var(--rouge-vif)" : "var(--gris)";
  return (
    <div
      className="mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{
        border: `1px ${state === "locked" ? "dashed" : "solid"} ${state === "earned" ? "rgba(201,164,92,.5)" : state === "available" ? "rgba(194,24,51,.45)" : "var(--ligne)"}`,
        background: state === "earned" ? "rgba(201,164,92,.07)" : "rgba(var(--ink-rgb),.02)",
      }}
    >
      <span className="w-9 h-9 rounded-xl grid place-items-center shrink-0" style={{ color: tone, border: "1px solid var(--ligne)" }}>
        <AcademyIcon name={state === "locked" ? "lock" : "medal"} size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="pz-eyebrow" style={{ color: tone }}>
          Jalon · certification
        </div>
        <div className="text-[13.5px] font-semibold mt-0.5">{m.label}</div>
        <div className="text-[11.5px] pz-muted">
          {state === "earned"
            ? "Obtenue — ton diplôme est disponible."
            : state === "available"
              ? "Débloquée : tu peux passer l'examen."
              : phase.chaptersMissing
                ? `Encore ${phase.chaptersMissing} chapitre${phase.chaptersMissing > 1 ? "s" : ""} à terminer.`
                : "Obtiens d'abord la certification précédente."}
        </div>
      </div>
      {state !== "locked" ? (
        <Link
          href={state === "earned" ? `/academy/certifications/${m.certId}/diplome` : `/academy/certifications/${m.certId}`}
          className="pz-btn shrink-0"
          style={
            state === "earned"
              ? { padding: "8px 14px", fontSize: 12.5, background: "linear-gradient(90deg,#b8902f,#c9a45c)", color: "#1a1a1a" }
              : { padding: "8px 14px", fontSize: 12.5 }
          }
        >
          {state === "earned" ? "Diplôme" : "Passer l'examen"}
        </Link>
      ) : null}
    </div>
  );
}
