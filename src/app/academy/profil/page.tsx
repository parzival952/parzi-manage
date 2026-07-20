export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth";
import { getProgress, LESSON_COUNT } from "@/lib/academy";
import { RANKS } from "@/lib/progression";
import AcademyProgressHeader from "@/components/AcademyProgressHeader";

export default async function AcademyProfil() {
  const user = await requireUser();
  const progress = await getProgress(user.id);
  const { info } = progress;
  const initial = (user.email[0] ?? "P").toUpperCase();

  const stats: [string, string][] = [
    ["Niveau", String(info.level)],
    ["XP totale", info.xp.toLocaleString("fr-FR")],
    ["Leçons validées", `${progress.done.size}/${LESSON_COUNT}`],
    ["Série actuelle", `${progress.streak} j`],
    ["Meilleure série", `${progress.best_streak} j`],
    ["Rang", info.rank.name],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Carte identité */}
      <div className="pz-card p-6 pz-rise flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl grid place-items-center text-[26px] font-black text-white shrink-0"
          style={{ background: "linear-gradient(135deg, var(--rouge), var(--rouge-profond))", boxShadow: "0 8px 22px rgba(228,0,43,0.35)" }}>
          {initial}
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-[17px] truncate">{user.email.split("@")[0]}</div>
          <span className="pz-rank mt-1.5" style={{ color: info.rank.tone }}><span>◆</span> {info.rank.name} · Niv. {info.level}</span>
        </div>
      </div>

      <AcademyProgressHeader progress={progress} doneCount={progress.done.size} total={LESSON_COUNT} />

      {/* Statistiques */}
      <div className="pz-rise pz-d1">
        <div className="text-[11px] font-bold tracking-wider pz-red mb-3">STATISTIQUES</div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(([k, v]) => (
            <div key={k} className="pz-card p-4">
              <div className="text-[22px] font-black">{v}</div>
              <div className="text-[12px] pz-muted">{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Échelle des rangs */}
      <div className="pz-rise pz-d2">
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

      <div className="pz-card p-5 text-center pz-rise pz-d3">
        <div className="text-[13.5px] pz-muted">Badges, trophées et certifications arrivent — ils s&apos;afficheront ici, sur ton profil public.</div>
      </div>
    </div>
  );
}
