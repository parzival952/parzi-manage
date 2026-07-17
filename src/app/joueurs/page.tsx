export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getPlayers } from "@/lib/queries";

const pill: Record<string, string> = {
  ok: "bg-[#0ca30c]/10 text-[#006300]",
  soon: "bg-[#fab219]/20 text-[#8a6200]",
  urgent: "bg-[#d03b3b]/10 text-[#d03b3b]",
};

export default async function JoueursPage() {
  const user = await requireUser();
  const players = await getPlayers(user.id);
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1">Joueurs</h1>
          <p className="text-sm text-[#898781] mb-6">Portefeuille — {players.length} joueurs sous mandat</p>
        </div>
        <Link href="/joueurs/nouveau" className="bg-[#2a78d6] text-white font-semibold text-sm rounded-lg px-4 py-2 hover:bg-[#2266bb]">
          + Ajouter un joueur
        </Link>
      </div>
      <div className="bg-[#f9fafb] border border-black/10 rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-[#898781]">
              <th className="py-2 px-2.5 border-b border-[#c3c2b7]">Joueur</th>
              <th className="py-2 px-2.5 border-b border-[#c3c2b7]">Poste</th>
              <th className="py-2 px-2.5 border-b border-[#c3c2b7]">Âge</th>
              <th className="py-2 px-2.5 border-b border-[#c3c2b7]">Club</th>
              <th className="py-2 px-2.5 border-b border-[#c3c2b7]">Fin de contrat</th>
              <th className="py-2 px-2.5 border-b border-[#c3c2b7]">Valeur est.</th>
              <th className="py-2 px-2.5 border-b border-[#c3c2b7]">Statut</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className="hover:bg-[#2a78d6]/5">
                <td className="py-2 px-2.5 border-b border-[#eceae4] font-semibold">
                  <Link href={`/joueurs/${p.id}`} className="text-[#2a78d6] hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="py-2 px-2.5 border-b border-[#eceae4]">{p.position}</td>
                <td className="py-2 px-2.5 border-b border-[#eceae4] tabular-nums">{p.age}</td>
                <td className="py-2 px-2.5 border-b border-[#eceae4]">{p.club}</td>
                <td className="py-2 px-2.5 border-b border-[#eceae4]">{p.contract_end}</td>
                <td className="py-2 px-2.5 border-b border-[#eceae4] tabular-nums">{p.est_value}</td>
                <td className="py-2 px-2.5 border-b border-[#eceae4]">
                  <span className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap ${pill[p.status]}`}>
                    {p.status_label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
