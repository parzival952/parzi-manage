export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getHallOfFame, getProgress } from "@/lib/academy";
import { leagueFromLevel } from "@/lib/progression";

export const metadata = { title: "Classement" };

export default async function ClassementPage({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const user = await requireUser();
  const { vue } = await searchParams;
  const weekly = vue === "semaine";
  const [hof, prog] = await Promise.all([getHallOfFame(user.id), getProgress(user.id)]);
  const league = leagueFromLevel(prog.info.level);

  const rows = weekly
    ? hof.weekly.map((r) => ({ id: r.user_id, name: r.name, value: r.wxp }))
    : hof.general.map((r) => ({ id: r.user_id, name: r.name, value: r.xp, level: r.level }));
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const medal = ["#E9C36A", "#c9ccd1", "#b08d57"];

  const tabCls = (on: boolean) => "flex-1 text-center text-[13px] font-semibold py-2 rounded-lg transition-colors " + (on ? "bg-[#E4002B] text-white" : "pz-muted");

  return (
    <div className="flex flex-col gap-5">
      <div className="pz-rise">
        <h1 className="text-[22px] font-extrabold tracking-tight">Hall of Fame</h1>
        <p className="text-[13.5px] pz-muted mt-1">Les meilleurs apprenants PARZI. Ta place se gagne à l&apos;XP.</p>
      </div>

      {/* Ma ligue + rang */}
      <div className="pz-card p-4 pz-rise flex items-center justify-between" style={{ borderColor: league.tone + "44" }}>
        <div>
          <div className="text-[10.5px] uppercase tracking-widest pz-muted">Ta ligue</div>
          <div className="font-extrabold text-[18px]" style={{ color: league.tone }}>◆ {league.name}</div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] uppercase tracking-widest pz-muted">Ton rang général</div>
          <div className="font-extrabold text-[18px]">#{hof.myRank} <span className="pz-muted text-[12px]">/ {hof.totalUsers || 1}</span></div>
        </div>
      </div>

      <div className="flex gap-2 pz-rise pz-d1">
        <Link href="/academy/classement" className={tabCls(!weekly)} style={weekly ? { border: "1px solid var(--ligne)" } : {}}>Général (XP total)</Link>
        <Link href="/academy/classement?vue=semaine" className={tabCls(weekly)} style={!weekly ? { border: "1px solid var(--ligne)" } : {}}>Cette semaine</Link>
      </div>

      {/* Podium */}
      {podium.length > 0 ? (
        <div className="flex items-end justify-center gap-3 pz-rise pz-d1">
          {[1, 0, 2].map((idx) => {
            const r = podium[idx]; if (!r) return <div key={idx} className="flex-1" />;
            const h = idx === 0 ? 96 : idx === 1 ? 74 : 62;
            const me = r.id === user.id;
            return (
              <div key={r.id} className="flex-1 flex flex-col items-center">
                <div className="pzc-badge" style={{ borderColor: medal[idx] + "cc", boxShadow: `0 0 16px ${medal[idx]}55`, marginBottom: 6 }}>{idx + 1}</div>
                <div className="text-[12px] font-bold truncate max-w-full" style={{ color: me ? "var(--rougeclair)" : "var(--blanc)" }}>{r.name}{me ? " (toi)" : ""}</div>
                <div className="text-[11px] pz-muted mb-2">{r.value.toLocaleString("fr-FR")} XP</div>
                <div style={{ height: h, background: `linear-gradient(180deg, ${medal[idx]}, transparent)`, width: "100%", borderRadius: "8px 8px 0 0", opacity: .5 }} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pz-card p-6 text-center pz-muted text-[13.5px]">Le classement se remplit dès que les apprenants gagnent de l&apos;XP. Sois le premier 🔥</div>
      )}

      {/* Reste du classement */}
      {rest.length > 0 && (
        <div className="pz-card p-2 pz-rise pz-d2">
          {rest.map((r, i) => {
            const me = r.id === user.id;
            return (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={me ? { background: "rgba(228,0,43,.12)", border: "1px solid rgba(228,0,43,.3)" } : {}}>
                <span className="w-6 text-center font-bold pz-muted text-[13px]">{i + 4}</span>
                <span className="flex-1 font-semibold text-[13.5px] truncate" style={{ color: me ? "var(--rougeclair)" : "var(--blanc)" }}>{r.name}{me ? " (toi)" : ""}</span>
                <span className="font-bold tabular-nums text-[13px]">{r.value.toLocaleString("fr-FR")}<span className="pz-muted text-[11px]"> XP</span></span>
              </div>
            );
          })}
        </div>
      )}

      <div className="pz-card p-5 text-center pz-rise pz-d3">
        <div className="text-[13px] pz-muted">Bientôt : ligues hebdomadaires avec montée/descente entre divisions, et classements par spécialité (scouting, examens, IA…).</div>
      </div>
    </div>
  );
}
