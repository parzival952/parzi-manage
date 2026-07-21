export const dynamic = "force-dynamic";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getProfile, submitLicense } from "@/lib/queries";
import { getAgentStatus } from "@/lib/verification";
import { getServerT } from "@/lib/i18n-server";

const COUNTRIES = ["FR", "FIFA", "OTHER"] as const;

export default async function VerificationPage() {
  const user = await requireUser();
  const { t } = await getServerT();
  const [status, profile] = await Promise.all([getAgentStatus(user.id), getProfile(user.id)]);

  async function submit(formData: FormData) {
    "use server";
    const u = await requireUser();
    const s = (k: string) => String(formData.get(k) ?? "").trim();
    const full_name = s("full_name");
    const license_number = s("license_number");
    const country = s("license_country");
    const license_country = (COUNTRIES as readonly string[]).includes(country) ? country : "FR";
    if (!full_name || !license_number) return;
    await submitLicense(u.id, { full_name, license_number, license_country });
    revalidatePath("/verification");
  }

  const badge = (tone: string, bg: string, label: string) => (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold rounded-full px-3 py-1" style={{ color: tone, background: bg }}>
      {label}
    </span>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-1">{t("verify.title")}</h1>
      <p className="text-sm text-[#898781] mb-6">{t("verify.subtitle")}</p>

      {/* ---------- Statut : VÉRIFIÉ ---------- */}
      {status === "verified" && (
        <div className="glass-card p-6 anim-rise">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-11 h-11 rounded-xl grid place-items-center text-white text-[20px]" style={{ background: "#16a34a" }}>✓</span>
            <div>
              <h2 className="text-[16px] font-bold">{t("verify.verified.title")}</h2>
              {badge("#16a34a", "rgba(22,163,74,.12)", t("verify.badge.verified"))}
            </div>
          </div>
          <p className="text-[13.5px] text-[#52514e] leading-relaxed">{t("verify.verified.body")}</p>
          {profile?.license_number && (
            <dl className="mt-4 grid grid-cols-[130px_1fr] gap-y-1.5 text-[13px]">
              <dt className="text-[#898781]">{t("verify.form.name")}</dt><dd className="font-medium">{profile.full_name || "—"}</dd>
              <dt className="text-[#898781]">{t("verify.form.number")}</dt><dd className="font-medium">{profile.license_number}</dd>
            </dl>
          )}
        </div>
      )}

      {/* ---------- Statut : EN ATTENTE ---------- */}
      {status === "pending" && (
        <div className="glass-card p-6 anim-rise">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-11 h-11 rounded-xl grid place-items-center text-white text-[20px]" style={{ background: "#d97706" }}>⏳</span>
            <div>
              <h2 className="text-[16px] font-bold">{t("verify.pending.title")}</h2>
              {badge("#b45309", "rgba(217,119,6,.12)", t("verify.badge.pending"))}
            </div>
          </div>
          <p className="text-[13.5px] text-[#52514e] leading-relaxed">{t("verify.pending.body")}</p>
          <dl className="mt-4 grid grid-cols-[130px_1fr] gap-y-1.5 text-[13px]">
            <dt className="text-[#898781]">{t("verify.form.name")}</dt><dd className="font-medium">{profile?.full_name || "—"}</dd>
            <dt className="text-[#898781]">{t("verify.form.number")}</dt><dd className="font-medium">{profile?.license_number || "—"}</dd>
          </dl>
        </div>
      )}

      {/* ---------- Statut : NON SOUMIS ou REFUSÉ → formulaire ---------- */}
      {(status === "none" || status === "rejected") && (
        <>
          {status === "rejected" && (
            <div className="glass-card p-4 mb-4 anim-rise" style={{ borderColor: "rgba(208,59,59,.4)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[15px]">⚠️</span>
                <span className="text-[13.5px] font-bold text-[#b91c1c]">{t("verify.rejected.title")}</span>
              </div>
              <p className="text-[13px] text-[#52514e]">{profile?.verify_note || t("verify.rejected.body")}</p>
            </div>
          )}

          <div className="glass-card p-3.5 mb-4 anim-rise" style={{ background: "rgba(37,99,235,.05)" }}>
            <p className="text-[12.5px] text-[#475569] leading-relaxed">
              <span className="font-semibold text-[#2563eb]">{t("verify.why.title")} </span>{t("verify.why.body")}
            </p>
          </div>

          <form action={submit} className="glass-card p-5 anim-rise">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#898781] mb-1">{t("verify.form.name")} *</label>
            <input name="full_name" required defaultValue={profile?.full_name} placeholder={t("verify.form.name_ph")}
              className="w-full glass-input rounded-lg px-3 py-2 text-[13.5px] bg-white/70 focus:outline-none focus:border-[#2a78d6]" />

            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#898781] mb-1 mt-3">{t("verify.form.country")} *</label>
            <select name="license_country" defaultValue={profile?.license_country || "FR"}
              className="w-full glass-input rounded-lg px-3 py-2 text-[13.5px] bg-white/70 focus:outline-none focus:border-[#2a78d6]">
              {COUNTRIES.map((c) => <option key={c} value={c}>{t(`verify.country.${c}`)}</option>)}
            </select>

            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#898781] mb-1 mt-3">{t("verify.form.number")} *</label>
            <input name="license_number" required defaultValue={profile?.license_number} placeholder={t("verify.form.number_ph")}
              className="w-full glass-input rounded-lg px-3 py-2 text-[13.5px] bg-white/70 focus:outline-none focus:border-[#2a78d6]" />
            <p className="text-[10.5px] text-[#898781] mt-1">{t("verify.form.number_hint")}</p>

            <button type="submit" className="mt-5 bg-[#2a78d6] text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-[#2266bb]">
              {t("verify.form.submit")}
            </button>
          </form>
        </>
      )}

      <p className="text-[11.5px] text-[#898781] mt-5 leading-relaxed">
        {t("verify.footer")} <Link href="/dashboard" className="text-[#2563eb] hover:underline">{t("verify.back")}</Link>
      </p>
    </div>
  );
}
