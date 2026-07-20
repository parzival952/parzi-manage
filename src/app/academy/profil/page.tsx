export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth";
import { computeAttributes, getProgress, LESSON_COUNT } from "@/lib/academy";
import { RANKS } from "@/lib/progression";
import AcademyProgressHeader from "@/components/AcademyProgressHeader";

export default async function AcademyProfil() {
  const user = await requireUser();
  const progress = await getProgress(user.id);
  const { info } = progress;
  const initial = (user.email[0] ?? "P").toUpperCase();
  const displayName = user.email.split("@")[0];
  const { ovr, attrs } = computeAttributes(progress.done, info.level);

  // Les 2 meilleurs attributs sont mis en avant.
  const topTwo = [...attrs].sort((a, b) => b.score - a.score).slice(0, 2).map((a) => a.key);

  return (
    <div className="flex flex-col gap-6">
      {/* Carte agent collector */}
      <div className="pzc-wrap pz-rise">
        <div className="pzc-sheen" />
        <div className="pzc">
          <div className="pzc-in">
            <div className="pzc-top">
              <div className="pzc-ovr">
                <div className="n">{ovr}</div>
                <div className="l">OVR</div>
                <div className="r">Agent</div>
              </div>
              <div className="pzc-crest" style={{ borderColor: `${info.rank.tone}66` }} title={info.rank.name}>
                <span style={{ color: info.rank.tone }}>◆</span><small>RANG</small>
              </div>
            </div>
            <div className="pzc-portrait"><div className="pzc-mono">{initial}</div></div>
            <div className="pzc-name">{displayName}</div>
            <div className="pzc-sub">{info.rank.name} · Niveau {info.level}</div>
            <div className="pzc-div" />
            <div className="pzc-attrs">
              {attrs.map((a) => (
                <div key={a.key} className={"pzc-attr" + (topTwo.includes(a.key) ? " hi" : "")}>
                  <b>{a.score}</b><span>{a.key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AcademyProgressHeader progress={progress} doneCount={progress.done.size} total={LESSON_COUNT} />

      {/* Stats */}
      <div className="pz-rise pz-d1">
        <div className="text-[11px] font-bold tracking-wider pz-red mb-3">STATISTIQUES</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="pz-card p-4 text-center"><div className="text-[22px] font-black" style={{ color: "var(--rouge)" }}>🔥 {progress.streak}</div><div className="text-[11px] pz-muted">Série (j)</div></div>
          <div className="pz-card p-4 text-center"><div className="text-[22px] font-black">{progress.done.size}</div><div className="text-[11px] pz-muted">Leçons</div></div>
          <div className="pz-card p-4 text-center"><div className="text-[22px] font-black">{progress.best_streak}</div><div className="text-[11px] pz-muted">Record série</div></div>
        </div>
      </div>

      {/* Badges récents (catégorie validée — visuels à enrichir) */}
      <div className="pz-rise pz-d2">
        <div className="text-[11px] font-bold tracking-wider pz-red mb-3">BADGES RÉCENTS</div>
        <div className="flex gap-2.5">
          <div className="pzc-badge lock">🎯</div>
          <div className="pzc-badge lock">🏆</div>
          <div className="pzc-badge lock">🧠</div>
          <div className="pzc-badge lock">📄</div>
          <div className="pzc-badge lock">🔒</div>
        </div>
        <p className="text-[12px] pz-muted mt-2.5">Débloque tes premiers badges en validant des leçons — ils s&apos;afficheront ici.</p>
      </div>

      {/* Échelle des rangs */}
      <div className="pz-rise pz-d3">
        <div className="text-[11px] font-bold tracking-wider pz-red mb-3">LES 12 RANGS PARZI</div>
        <div className="pz-card p-4 flex flex-col gap-1.5">
          {RANKS.map((r) => {
            const reached = info.level >= r.min;
            return (
              <div key={r.name} className="flex items-center gap-3 py-1">
                <span className="text-[13px]" style={{ color: reached ? r.tone : "#3a3a42" }}>◆</span>
                <span className="text-[13.5px] font-semibold" style={{ color: reached ? "var(--blanc)" : "#4a4a52" }}>{r.name}</span>
                <span className="text-[11px] pz-muted ml-auto">Niv. {r.min}{r.max > r.min ? `–${r.max}` : ""}</span>
                {info.rank.name === r.name && <span className="text-[10px] font-bold pz-red">ACTUEL</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
