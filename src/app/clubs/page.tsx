export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClub, deleteClub, getClubs } from "@/lib/queries";

const input = "border border-black/15 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2a78d6]";

export default async function ClubsPage() {
  const user = await requireUser();
  const clubs = await getClubs(user.id);

  async function add(formData: FormData) {
    "use server";
    const u = await requireUser();
    const s = (k: string) => String(formData.get(k) ?? "").trim();
    if (!s("name")) return;
    await createClub(u.id, { name: s("name"), league: s("league"), need: s("need"), budget: s("budget"), contact_name: s("contact_name"), notes: s("notes") });
    revalidatePath("/clubs");
  }

  async function remove(formData: FormData) {
    "use server";
    const u = await requireUser();
    await deleteClub(u.id, Number(formData.get("id")));
    revalidatePath("/clubs");
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Clubs</h1>
      <p className="text-sm text-[#898781] mb-6">Ton réseau de clubs — besoins, budgets, contacts · {clubs.length} club{clubs.length > 1 ? "s" : ""}</p>

      <div className="bg-white border border-black/[0.06] rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06)] p-4">
        {clubs.length === 0 ? (
          <p className="text-[13px] text-[#898781] py-4 text-center">
            Aucun club pour l&apos;instant — ajoute les clubs avec qui tu travailles (ou que tu vises) avec le formulaire ci-dessous.
          </p>
        ) : (
          <table className="w-full text-[13px] mb-2">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-[#898781]">
                {["Club", "Championnat", "Besoin prioritaire", "Budget est.", "Contact", "Notes", ""].map((h, i) => (
                  <th key={i} className="py-2 px-2.5 border-b border-[#c3c2b7]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c.id} className="hover:bg-[#2a78d6]/5 align-top">
                  <td className="py-2 px-2.5 border-b border-[#eceae4] font-semibold">{c.name}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4]">{c.league || "—"}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4]">{c.need || "—"}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4]">{c.budget || "—"}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4]">{c.contact_name || "—"}</td>
                  <td className="py-2 px-2.5 border-b border-[#eceae4] text-[#52514e] max-w-56">{c.notes || "—"}</td>
                  <td className="py-2 px-1 border-b border-[#eceae4]">
                    <form action={remove}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" title="Supprimer" className="text-[#898781] hover:text-[#d03b3b] text-[13px]">✕</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form action={add} className="flex gap-2 mt-3 flex-wrap">
          <input name="name" required placeholder="Nom du club *" className={`${input} w-44`} />
          <input name="league" placeholder="Championnat" className={`${input} w-32`} />
          <input name="need" placeholder="Besoin prioritaire" className={`${input} w-44`} />
          <input name="budget" placeholder="Budget est." className={`${input} w-28`} />
          <input name="contact_name" placeholder="Contact" className={`${input} w-36`} />
          <input name="notes" placeholder="Notes" className={`${input} flex-1 min-w-40`} />
          <button type="submit" className="bg-[#2a78d6] text-white text-[13px] font-semibold rounded-lg px-4">+ Ajouter</button>
        </form>
      </div>
    </div>
  );
}
