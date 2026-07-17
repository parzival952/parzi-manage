import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOpportunities, getPlayer, getPlayers } from "@/lib/queries";
import { getVeille } from "@/lib/veille";
import { computeParziScore } from "@/lib/score";

export default async function JoueurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [p, allPlayers, opps, veille] = await Promise.all([
    getPlayer(user.id, Number(id)),
    getPlayers(user.id),
    getOpportunities(user.id),
    getVeille().catch(() => ({ items: [], sourcesOk: 0, sourcesTotal: 0 })),
  ]);
  if (!p) notFound();
  const score = computeParziScore(p, allPlayers, opps, veille.items);

  const rows: [string, string][] = [
    ["Âge", `${p.age} ans`],
    ["Nationalité", p.nationality],
    ["Taille", p.height],
    ["Pied fort", p.strong_foot],
    ["Valeur estimée", p.est_value],
    ["Fin de contrat", p.contract_end],
    ["Salaire", p.salary],
    ["Mandat", p.mandate],
  ];

  return (
    <div className="max-w-3xl">
      <Link href="/joueurs" className="text-[13px] text-[#2563eb] hover:underline">← Retour aux joueurs</Link>
      <div className="flex items-start justify-between mt-3 mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#2563eb]/15 to-[#4a3aa7]/15 text-[#2563eb] grid place-items-center font-bold text-[19px]" style={{ width: 52, height: 52 }}>
            {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
            <p className="text-sm text-[#94a3b8]">{p.position} · {p.club}</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Link href={`/joueurs/${p.id}/dossier`} className="bg-[#2563eb] hover:bg-[#1d4fd7] text-white text-sm font-semibold rounded-xl px-4 py-2 shadow-md shadow-[#2563eb]/20">
            📄 Dossier
          </Link>
          <Link href={`/joueurs/${p.id}/modifier`} className="glass-input text-sm font-medium rounded-xl px-4 py-2 hover:border-[#2563eb] hover:text-[#2563eb]">
            Modifier
          </Link>
        </div>
      </div>

      {/* ---------- PARZI Score ---------- */}
      <div className="glass-card card-hover anim-rise d1 p-6 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8] mb-1">PARZI Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-[46px] font-extrabold tracking-tight leading-none" style={{ color: score.color }}>{score.total}</span>
              <span className="text-[15px] text-[#94a3b8]">/100</span>
            </div>
            <div className="text-[13px] font-bold mt-1" style={{ color: score.color }}>{score.label}</div>
          </div>
          <div className="flex-1 min-w-60 flex flex-col gap-2">
            {score.subs.filter((s) => s.value !== null).map((s) => (
              <div key={s.key}>
                <div className="flex justify-between text-[11.5px] mb-0.5">
                  <span className="font-semibold text-[#475569]">{s.label}</span>
                  <span className="font-bold" style={{ color: score.color }}>{s.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#eef1f5] overflow-hidden">
                  <div className="progress-bar h-full rounded-full" style={{ width: `${s.value}%`, background: score.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <details className="mt-4 group">
          <summary className="text-[12.5px] font-semibold text-[#2563eb] cursor-pointer select-none">
            Comprendre ce score (chaque point est explicable) →
          </summary>
          <div className="mt-3 flex flex-col gap-2.5">
            {score.subs.map((s) => (
              <div key={s.key} className="text-[12.5px] leading-relaxed">
                <span className={`font-bold ${s.value === null ? "text-[#94a3b8]" : "text-[#0f172a]"}`}>
                  {s.label}{s.value === null ? " · en attente de données" : ` · ${s.value}/100`} :
                </span>{" "}
                <span className="text-[#475569]">{s.why}</span>
              </div>
            ))}
            <p className="text-[11px] text-[#94a3b8] mt-1">
              Le PARZI Score n&apos;utilise que des données réelles et vérifiables. Les sous-scores sportifs s&apos;activeront avec les fournisseurs de données (roadmap V2).
            </p>
          </div>
        </details>
      </div>

      <div className="glass-card anim-rise d2 p-5 mb-4">
        <dl className="grid grid-cols-2 sm:grid-cols-[140px_1fr_140px_1fr] gap-y-2 gap-x-4 text-[13.5px]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-[#94a3b8]">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="glass-card anim-rise d3 p-5">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8] mb-2">Notes internes</h2>
        <p className="text-[13.5px] text-[#475569] leading-relaxed">{p.notes || "—"}</p>
      </div>
    </div>
  );
}
