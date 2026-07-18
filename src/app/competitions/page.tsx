export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { LEAGUES, footDataEnabled, getResults, getScorers, getStandings, getUpcoming, type Match } from "@/lib/footdata";

export const metadata = { title: "Compétitions" };

function fmtDate(iso: string, withTime = true): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Paris" });
  if (!withTime) return date;
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
  return `${date} · ${time}`;
}

function MatchRow({ m, played }: { m: Match; played: boolean }) {
  return (
    <div className="flex items-center gap-2 py-2 border-t border-[#eef0f4] text-[13px]">
      <span className="flex-1 text-right truncate">{m.homeTeam.name}</span>
      {played ? (
        <span className="font-bold tabular-nums bg-[#f1f5f9] rounded-md px-2 py-0.5 text-[12.5px] shrink-0">
          {m.score.fullTime.home} – {m.score.fullTime.away}
        </span>
      ) : (
        <span className="text-[11px] text-[#94a3b8] shrink-0 px-1">{fmtDate(m.utcDate)}</span>
      )}
      <span className="flex-1 truncate">{m.awayTeam.name}</span>
    </div>
  );
}

export default async function CompetitionsPage({ searchParams }: { searchParams: Promise<{ ligue?: string }> }) {
  await requireUser();
  const { ligue } = await searchParams;
  const enabled = footDataEnabled();
  const code = LEAGUES.some((l) => l.code === ligue) ? (ligue as string) : "FL1";
  const league = LEAGUES.find((l) => l.code === code)!;

  const [standings, results, upcoming, scorers] = enabled
    ? await Promise.all([getStandings(code), getResults(code, 8), getUpcoming(code, 8), getScorers(code, 10)])
    : [null, null, null, null];

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">🏆 Compétitions</h1>
      <p className="text-sm text-[#898781] mb-5">
        Classements, résultats et buteurs — données officielles sous licence (football-data.org), rafraîchies plusieurs fois par jour.
      </p>

      {!enabled ? (
        <div className="glass-card p-6 max-w-2xl">
          <div className="text-[11px] font-bold tracking-wider text-[#2563eb] mb-2">EN ATTENTE DE CONNEXION</div>
          <p className="text-[13.5px] text-[#475569] leading-relaxed">
            La source de données mondiale n&apos;est pas encore branchée sur ce déploiement.
            Fidèle à la règle Parzi : <b>aucun chiffre inventé</b> — cette page s&apos;allumera dès que la clé
            <code className="text-[12px] bg-[#f0efec] px-1.5 py-0.5 rounded mx-1">FOOTBALL_DATA_KEY</code>
            sera configurée.
          </p>
        </div>
      ) : (
        <>
          {/* Sélecteur de championnat */}
          <div className="flex gap-2 flex-wrap mb-5">
            {LEAGUES.map((l) => (
              <Link
                key={l.code}
                href={`/competitions?ligue=${l.code}`}
                className={
                  "text-[12.5px] rounded-full px-3.5 py-1.5 border transition-colors " +
                  (l.code === code
                    ? "bg-[#2563eb] border-[#2563eb] text-white font-semibold"
                    : "bg-white/70 border-black/10 text-[#52514e] hover:border-[#2563eb] hover:text-[#2563eb]")
                }
              >
                {l.flag} {l.name}
              </Link>
            ))}
          </div>
          <p className="text-[11.5px] text-[#94a3b8] mb-4 -mt-2">Ligue 2 et autres divisions : en attente d&apos;une source dédiée (V2).</p>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 items-start">
            {/* Classement */}
            <div className="glass-card p-5 anim-rise d1">
              <div className="text-[11px] font-bold tracking-wider text-[#2563eb] mb-3">CLASSEMENT — {league.name.toUpperCase()}</div>
              {standings ? (
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="text-left text-[10.5px] uppercase tracking-wider text-[#94a3b8]">
                      <th className="pb-2 w-7">#</th><th className="pb-2">Équipe</th>
                      <th className="pb-2 text-center w-8">J</th><th className="pb-2 text-center w-10">Diff</th>
                      <th className="pb-2 text-right w-9">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((r) => (
                      <tr key={r.position} className="border-t border-[#eef0f4]">
                        <td className="py-1.5 text-[#94a3b8]">{r.position}</td>
                        <td className="py-1.5 font-medium flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {r.team.crest && <img src={r.team.crest} alt="" className="w-4 h-4 object-contain" loading="lazy" />}
                          <span className="truncate">{r.team.name}</span>
                        </td>
                        <td className="py-1.5 text-center text-[#64748b]">{r.playedGames}</td>
                        <td className="py-1.5 text-center text-[#64748b] tabular-nums">{r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}</td>
                        <td className="py-1.5 text-right font-bold tabular-nums">{r.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[13px] text-[#94a3b8]">Classement momentanément indisponible (hors saison ou source injoignable).</p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {/* Derniers résultats */}
              <div className="glass-card p-5 anim-rise d2">
                <div className="text-[11px] font-bold tracking-wider text-[#2563eb] mb-2">DERNIERS RÉSULTATS</div>
                {results?.length ? results.map((m) => <MatchRow key={m.id} m={m} played />) : (
                  <p className="text-[13px] text-[#94a3b8]">Aucun résultat récent disponible.</p>
                )}
              </div>

              {/* Prochains matchs */}
              <div className="glass-card p-5 anim-rise d3">
                <div className="text-[11px] font-bold tracking-wider text-[#2563eb] mb-2">PROCHAINS MATCHS</div>
                {upcoming?.length ? upcoming.map((m) => <MatchRow key={m.id} m={m} played={false} />) : (
                  <p className="text-[13px] text-[#94a3b8]">Calendrier à venir indisponible (hors saison ou source injoignable).</p>
                )}
              </div>

              {/* Buteurs */}
              <div className="glass-card p-5 anim-rise d4">
                <div className="text-[11px] font-bold tracking-wider text-[#2563eb] mb-2">MEILLEURS BUTEURS</div>
                {scorers?.length ? (
                  <div className="flex flex-col">
                    {scorers.map((s, i) => (
                      <div key={s.player.name} className="flex items-center gap-2.5 py-1.5 border-t border-[#eef0f4] text-[13px]">
                        <span className="w-5 text-[#94a3b8] text-[12px]">{i + 1}</span>
                        <span className="flex-1 font-medium truncate">{s.player.name}</span>
                        <span className="text-[11.5px] text-[#94a3b8] truncate max-w-[110px]">{s.team.name}</span>
                        <span className="font-bold tabular-nums">{s.goals ?? 0}</span>
                        <span className="text-[10.5px] text-[#94a3b8]">buts</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#94a3b8]">Buteurs indisponibles pour cette compétition.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
