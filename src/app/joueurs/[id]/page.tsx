import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPlayer } from "@/lib/queries";

export default async function JoueurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const p = await getPlayer(user.id, Number(id));
  if (!p) notFound();

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
    <div className="max-w-2xl">
      <Link href="/joueurs" className="text-[13px] text-[#2a78d6] hover:underline">← Retour aux joueurs</Link>
      <div className="flex items-start justify-between mt-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <p className="text-sm text-[#898781]">{p.position} · {p.club}</p>
        </div>
        <Link href={`/joueurs/${p.id}/modifier`} className="border border-black/15 text-sm font-medium rounded-lg px-4 py-2 hover:border-[#2a78d6] hover:text-[#2a78d6]">
          Modifier
        </Link>
      </div>

      <div className="bg-[#f9fafb] border border-black/10 rounded-xl p-5 mb-4">
        <dl className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-4 text-[13.5px]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-[#898781]">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-[#f9fafb] border border-black/10 rounded-xl p-5">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#898781] mb-2">Notes internes</h2>
        <p className="text-[13.5px] text-[#52514e] leading-relaxed">{p.notes}</p>
      </div>
    </div>
  );
}
