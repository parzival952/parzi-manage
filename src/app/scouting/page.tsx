export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createProspect, deleteProspect, getProspects } from "@/lib/queries";

const POSITIONS = [
  "Gardien", "Défenseur central", "Latéral droit", "Latéral gauche",
  "Milieu défensif", "Milieu central", "Milieu offensif",
  "Ailier droit", "Ailier gauche", "Avant-centre", "Attaquant",
];
const input = "border border-black/15 rounded-lg px-3 py-1.5 text-[13px] bg-[#f9fafb] focus:outline-none focus:border-[#2a78d6]";

export default async function ScoutingPage({ searchParams }: { searchParams: Promise<{ poste?: string; age?: string }> }) {
  const { poste, age } = await searchParams;
  const user = await requireUser();
  const all = await getProspects(user.id);
  const ageMax = Number(age) || 99;
  const prospects = all.filter((p) => (!poste || p.position === poste) && p.age <= ageMax);

  async function add(formData: FormData) {
    "use server";
    const u = await requireUser();
    const s = (k: string) => String(formData.get(k) ?? "").trim();
    if (!s("name")) return;
    await createProspect(u.id, {
      name: s("name"), position: s("position"), age: Number(s("age")) || 18,
      club: s("club"), league: s("league"), contract_end: s("contract_end"), note: s("note"),
    });
    revalidatePath("/scouting");
  }

  async function remove(formData: FormData) {
    "use server";
    const u = await requireUser();
    await deleteProspect(u.id, Number(formData.get("id")));
    revalidatePath("/scouting");
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Scouting</h1>
      <p className="text-sm text-[#898781] mb-6">
        Tes cibles — les joueurs que tu suis avant de proposer un mandat · {prospects.length}/{all.length} affiché{all.length > 1 ? "s" : ""}
      </p>

      <div className="bg-[#f9fafb] border border-black/10 rounded-xl p-4">
        <form method="GET" className="flex gap-2 mb-4 flex-wrap items-center">
          <select name="poste" defaultValue={poste ?? ""} className={input}>
            <option value="">Tous postes</option>
            {POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <input name="age" type="number" min={15} max={45} defaultValue={age ?? ""} placeholder="Âge max" className={`${input} w-24`} />
          <button type="submit" className="border border-black/15 text-[13px] font-medium rounded-lg px-3 py-1.5 hover:border-[#2a78d6] hover:text-[#2a78d6]">Filtrer</button>
          {(poste || age) && <a href="/scouting" className="text-[12px] text-[#2a78d6] hover:underline">Réinitialiser</a>}
        </form>

        {all.length === 0 ? (
          <p className="text-[13px] text-[#898781] py-4 text-center">
            Aucune cible pour l&apos;instant — ajoute les joueurs que tu repères (matchs, centres de formation, réseau) avec le formulaire ci-dessous.
          </p>
        ) : (
          <table className="w-full text-[13px] mb-2">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-[#898781]">
                {["Joueur", "Poste", "Âge", "Club", "Championnat", "Fin de contrat", "Note", ""].map((h, i) => (
                  <th key={i} className="py-2 px-2.5 border-b border-[#c3c2b7]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.id} className="hover:bg-[#2a78d6]/5 align-top">
                  <td className="py-2 px-2.5 border-b border-[#eceae4] font-semibold">{p.name}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4]">{p.position || "—"}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4] tabular-nums">{p.age}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4]">{p.club || "—"}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4]">{p.league || "—"}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4]">{p.contract_end || "—"}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4] text-[#52514e] max-w-52">{p.note || "—"}</td>
                  <td className="py-2 px-1 border-b border-[#eceae4]">
                    <form action={remove}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" title="Supprimer" className="text-[#898781] hover:text-[#d03b3b] text-[13px]">✕</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={add} className="flex gap-2 mt-3 flex-wrap">
          <input name="name" required placeholder="Nom du joueur *" className={`${input} w-40`} />
          <select name="position" className={input}>
            <option value="">Poste</option>
            {POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <input name="age" type="number" min={15} max={45} placeholder="Âge" className={`${input} w-20`} />
          <input name="club" placeholder="Club" className={`${input} w-36`} />
          <input name="league" placeholder="Championnat" className={`${input} w-32`} />
          <input name="contract_end" placeholder="Fin de contrat" className={`${input} w-32`} />
          <input name="note" placeholder="Note (pourquoi lui ?)" className={`${input} flex-1 min-w-40`} />
          <button type="submit" className="bg-[#2a78d6] text-white text-[13px] font-semibold rounded-lg px-4">+ Ajouter</button>
        </form>
      </div>
    </div>
  );
}
