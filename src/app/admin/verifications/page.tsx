export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/verification";
import { listVerifications, setAgentStatus, type AgentStatus } from "@/lib/queries";
import { getServerT } from "@/lib/i18n-server";

const TONE: Record<AgentStatus, { c: string; bg: string }> = {
  pending: { c: "#b45309", bg: "rgba(217,119,6,.12)" },
  verified: { c: "#16a34a", bg: "rgba(22,163,74,.12)" },
  rejected: { c: "#b91c1c", bg: "rgba(208,59,59,.12)" },
  none: { c: "#64748b", bg: "rgba(100,116,139,.12)" },
};

export default async function AdminVerificationsPage() {
  await requireAdmin();
  const { t, locale } = await getServerT();
  const rows = await listVerifications();
  const pending = rows.filter((r) => r.agent_status === "pending").length;

  const fmt = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
  };

  async function approve(formData: FormData) {
    "use server";
    await requireAdmin();
    await setAgentStatus(String(formData.get("uid")), "verified");
    revalidatePath("/admin/verifications");
  }
  async function reject(formData: FormData) {
    "use server";
    await requireAdmin();
    await setAgentStatus(String(formData.get("uid")), "rejected", String(formData.get("note") ?? "").trim());
    revalidatePath("/admin/verifications");
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{t("admin.verif.title")}</h1>
      <p className="text-sm text-[#898781] mb-6">
        {t("admin.verif.subtitle")} · {t("admin.verif.pending_count", { n: pending })}
      </p>

      <div className="glass-card p-4 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-[13px] text-[#898781] py-6 text-center">{t("admin.verif.empty")}</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-[#898781]">
                {["name", "email", "country", "number", "submitted", "status", "actions"].map((h) => (
                  <th key={h} className="py-2 px-2.5 border-b border-[#c3c2b7]">{t(`admin.verif.col.${h}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const tone = TONE[r.agent_status] ?? TONE.none;
                return (
                  <tr key={r.user_id} className="hover:bg-[#2a78d6]/5 align-top">
                    <td className="py-2.5 px-2.5 border-b border-[#eceae4] font-semibold">{r.full_name || "—"}</td>
                    <td className="py-2.5 px-2.5 border-b border-[#eceae4] text-[#52514e]">{r.email || "—"}</td>
                    <td className="py-2.5 px-2.5 border-b border-[#eceae4]">{t(`verify.country.${r.license_country || "OTHER"}`)}</td>
                    <td className="py-2.5 px-2.5 border-b border-[#eceae4] font-mono text-[12px]">{r.license_number || "—"}</td>
                    <td className="py-2.5 px-2.5 border-b border-[#eceae4] text-[#52514e]">{fmt(r.license_submitted_at)}</td>
                    <td className="py-2.5 px-2.5 border-b border-[#eceae4]">
                      <span className="inline-block text-[11px] font-semibold rounded-full px-2.5 py-0.5" style={{ color: tone.c, background: tone.bg }}>
                        {t(`verify.badge.${r.agent_status}`)}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 border-b border-[#eceae4]">
                      {r.agent_status === "verified" ? (
                        <span className="text-[12px] text-[#16a34a]">✓ {t("admin.verif.done")}</span>
                      ) : (
                        <div className="flex flex-col gap-1.5 min-w-56">
                          <form action={approve}>
                            <input type="hidden" name="uid" value={r.user_id} />
                            <button type="submit" className="w-full bg-[#16a34a] text-white text-[12px] font-semibold rounded-lg px-3 py-1.5 hover:bg-[#15803d]">
                              ✓ {t("admin.verif.approve")}
                            </button>
                          </form>
                          <form action={reject} className="flex gap-1.5">
                            <input type="hidden" name="uid" value={r.user_id} />
                            <input name="note" placeholder={t("admin.verif.note_ph")}
                              className="flex-1 min-w-0 glass-input rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#d03b3b]" />
                            <button type="submit" className="text-[12px] font-semibold text-[#b91c1c] border border-[#e0b4b4] rounded-lg px-3 hover:bg-[#fef2f2]">
                              {t("admin.verif.reject")}
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[11.5px] text-[#898781] mt-4 leading-relaxed">{t("admin.verif.note_beta")}</p>
    </div>
  );
}
