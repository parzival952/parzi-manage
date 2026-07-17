export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createContact, getContacts } from "@/lib/queries";

export default async function CrmPage() {
  const user = await requireUser();
  const contacts = await getContacts(user.id);

  async function addContact(formData: FormData) {
    "use server";
    const u = await requireUser();
    const s = (k: string) => String(formData.get(k) ?? "").trim();
    if (!s("name")) return;
    await createContact(u.id, { name: s("name"), role: s("role") || "—", org: s("org") || "—", last_exchange: s("last_exchange") || "Nouveau contact", next_step: s("next_step") || "—" });
    revalidatePath("/crm");
  }
  return (
    <div>
      <h1 className="text-xl font-bold mb-1">CRM</h1>
      <p className="text-sm text-[#898781] mb-6">Contacts réseau — {contacts.length}</p>
      <div className="bg-white border border-black/[0.06] rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06)] p-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-[#898781]">
              {["Contact", "Rôle", "Organisation", "Dernier échange", "Prochain pas"].map((h) => (
                <th key={h} className="py-2 px-2.5 border-b border-[#c3c2b7]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-[#2a78d6]/5">
                <td className="py-2 px-2.5 border-b border-[#eceae4] font-semibold">{c.name}</td>
                <td className="py-2 px-2.5 border-b border-[#eceae4]">{c.role}</td>
                <td className="py-2 px-2.5 border-b border-[#eceae4]">{c.org}</td>
                <td className="py-2 px-2.5 border-b border-[#eceae4]">{c.last_exchange}</td>
                <td className="py-2 px-2.5 border-b border-[#eceae4]">{c.next_step}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <form action={addContact} className="flex gap-2 mt-4 flex-wrap">
          <input name="name" required placeholder="Nom *" className="border border-black/15 rounded-lg px-3 py-1.5 text-[13px] w-40 focus:outline-none focus:border-[#2a78d6]" />
          <input name="role" placeholder="Rôle" className="border border-black/15 rounded-lg px-3 py-1.5 text-[13px] w-40 focus:outline-none focus:border-[#2a78d6]" />
          <input name="org" placeholder="Organisation" className="border border-black/15 rounded-lg px-3 py-1.5 text-[13px] w-44 focus:outline-none focus:border-[#2a78d6]" />
          <input name="next_step" placeholder="Prochain pas" className="border border-black/15 rounded-lg px-3 py-1.5 text-[13px] w-44 focus:outline-none focus:border-[#2a78d6]" />
          <button type="submit" className="bg-[#2a78d6] text-white text-[13px] font-semibold rounded-lg px-4">+ Ajouter</button>
        </form>
      </div>
    </div>
  );
}
