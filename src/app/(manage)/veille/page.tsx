export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth";
import { getPlayers, getProspects } from "@/lib/queries";
import { getVeille, matchesPortfolio, portfolioKeywords } from "@/lib/veille";

function timeAgo(d: Date | null): string {
  if (!d) return "";
  const mins = Math.max(1, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
}

export default async function VeillePage() {
  const user = await requireUser();
  const [players, prospects, veille] = await Promise.all([
    getPlayers(user.id),
    getProspects(user.id),
    getVeille(),
  ]);
  const keywords = portfolioKeywords(players, prospects);
  const items = veille.items.map((n) => ({ ...n, mine: matchesPortfolio(n.title, keywords) }));
  const mine = items.filter((n) => n.mine);

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold mb-1">📡 Veille</h1>
      <p className="text-sm text-[#898781] mb-6">
        L&apos;actualité du football en direct — {veille.sourcesOk}/{veille.sourcesTotal} sources actives ·
        les actus <span className="text-[#2a78d6] font-semibold">liées à ton portefeuille</span> sont mises en avant.
      </p>

      {mine.length > 0 && (
        <div className="glass-card border-l-[3px] border-l-[#2a78d6] p-4 mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#2a78d6] mb-2">⚡ Ton portefeuille dans l&apos;actu</h2>
          {mine.slice(0, 6).map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
              className="block py-2 border-b border-black/[0.06] last:border-0 hover:text-[#2a78d6]">
              <div className="text-[13.5px] font-medium leading-snug">{n.title}</div>
              <div className="text-[11px] text-[#898781] mt-0.5">{n.source} · {timeAgo(n.date)}</div>
            </a>
          ))}
        </div>
      )}

      <div className="glass-card p-4">
        {items.length === 0 ? (
          <p className="text-[13px] text-[#898781] py-6 text-center">
            Les sources d&apos;actualité sont momentanément injoignables — réessaie dans quelques minutes.
          </p>
        ) : (
          items.map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
              className="flex gap-3 py-2.5 border-b border-black/[0.06] last:border-0 items-start hover:bg-[#2a78d6]/5 rounded-lg px-2 -mx-2">
              <div className="flex-1">
                <div className="text-[13.5px] leading-snug">
                  {n.mine && <span className="text-[10px] font-bold text-white bg-[#2a78d6] rounded px-1.5 py-0.5 mr-1.5 align-middle">TON PORTEFEUILLE</span>}
                  {n.title}
                </div>
                <div className="text-[11px] text-[#898781] mt-0.5">{n.source} · {timeAgo(n.date)}</div>
              </div>
            </a>
          ))
        )}
      </div>
      <p className="text-[11px] text-[#898781] mt-3">
        Sources : L&apos;Équipe, RMC Sport, Foot Mercato, Maxifoot (flux publics). Actualisé toutes les 30 minutes.
      </p>
    </div>
  );
}
