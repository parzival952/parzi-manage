export const dynamic = "force-dynamic";
import { getContacts } from "@/lib/queries";

export default async function CrmPage() {
  const contacts = getContacts();
  return (
    <div>
      <h1 className="text-xl font-bold mb-1">CRM</h1>
      <p className="text-sm text-[#898781] mb-6">Contacts réseau — {contacts.length}</p>
      <div className="bg-white border border-black/10 rounded-xl p-4 overflow-x-auto">
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
      </div>
    </div>
  );
}
