import type { Progress } from "@/lib/academy";
import AcademyIcon from "@/components/AcademyIcon";

/** En-tête de progression : rang, niveau, barre d'XP, streak. Composant serveur pur. */
export default function AcademyProgressHeader({ progress, doneCount, total }: { progress: Progress; doneCount: number; total: number }) {
  const { info } = progress;
  return (
    <div className="pz-card p-5 pz-rise">
      <div className="flex items-center justify-between mb-3">
        <span className="pz-rank" style={{ color: info.rank.tone }}>
          <span>◆</span> {info.rank.name}
        </span>
        <div className="flex items-center gap-4 text-[13px]">
          <span title="Série de jours actifs" className="inline-flex items-center gap-1.5"><AcademyIcon name="flame" size={15} style={{ color: "var(--rouge-vif)" }} /> <b className="pz-mono">{progress.streak}</b> <span className="pz-muted">j</span></span>
          <span title="Leçons complétées" className="inline-flex items-center gap-1.5"><AcademyIcon name="book" size={15} style={{ color: "var(--argent)" }} /> <span className="pz-mono"><b>{doneCount}</b><span className="pz-muted">/{total}</span></span></span>
        </div>
      </div>
      <div className="flex items-end justify-between mb-1.5">
        <div className="text-[13px] pz-muted">Niveau <b className="text-white text-[15px] pz-mono">{info.level}</b></div>
        <div className="text-[12px] pz-muted">
          {info.isMax ? "Niveau max atteint" : <span className="pz-mono"><b className="text-white">{info.intoLevel}</b> / {info.span} XP</span>}
        </div>
      </div>
      <div className="pz-xpbar"><div className="pz-xpfill" style={{ width: `${info.pct}%` }} /></div>
      <div className="text-[11px] pz-muted mt-2 pz-mono">{info.xp.toLocaleString("fr-FR")} XP au total</div>
    </div>
  );
}
