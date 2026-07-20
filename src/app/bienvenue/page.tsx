export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProfile, setPath } from "@/lib/queries";
import { getServerT } from "@/lib/i18n-server";

export default async function BienvenuePage() {
  const user = await requireUser();
  const { t } = await getServerT();
  const profile = await getProfile(user.id);
  // Déjà choisi → on route directement.
  if (profile?.path === "agent") redirect("/dashboard");
  if (profile?.path === "aspirant") redirect("/academy");

  async function choisir(formData: FormData) {
    "use server";
    const u = await requireUser();
    const path = String(formData.get("path")) === "agent" ? "agent" : "aspirant";
    await setPath(u.id, path);
    redirect(path === "agent" ? "/dashboard" : "/academy");
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto text-[#F5F6F8] px-5 py-10"
      style={{ background: "radial-gradient(900px 500px at 50% -5%, rgba(228,0,43,0.16), transparent 60%), #080809" }}>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl grid place-items-center font-black text-white" style={{ background: "linear-gradient(135deg,#E4002B,#8f0018)" }}>P</div>
          <div className="font-extrabold text-[17px] tracking-tight">PARZI</div>
        </div>

        <h1 className="text-[26px] font-extrabold tracking-tight text-center leading-tight">{t("welcome.title")}</h1>
        <p className="text-[14px] text-center mt-2 mb-8" style={{ color: "#8A8F98" }}>
          {t("welcome.subtitle")}
        </p>

        <div className="flex flex-col gap-4">
          {/* Aspirant → Academy */}
          <form action={choisir}>
            <input type="hidden" name="path" value="aspirant" />
            <button type="submit" className="w-full text-left rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(180deg,#1c1c22,#131318)", border: "1px solid rgba(228,0,43,0.35)", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[22px]">🎓</span>
                <span className="font-bold text-[16px]">{t("welcome.aspirant.pre")} <span style={{ color: "#E4002B" }}>{t("welcome.aspirant.em")}</span> {t("welcome.aspirant.post")}</span>
              </div>
              <p className="text-[13px]" style={{ color: "#8A8F98" }}>{t("welcome.aspirant.desc")}</p>
            </button>
          </form>

          {/* Agent licencié → Manage */}
          <form action={choisir}>
            <input type="hidden" name="path" value="agent" />
            <button type="submit" className="w-full text-left rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(180deg,#1c1c22,#131318)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[22px]">⚡</span>
                <span className="font-bold text-[16px]">{t("welcome.agent.pre")} <span style={{ color: "#C9A45C" }}>{t("welcome.agent.em")}</span> {t("welcome.agent.post")}</span>
              </div>
              <p className="text-[13px]" style={{ color: "#8A8F98" }}>{t("welcome.agent.desc")}</p>
            </button>
          </form>
        </div>

        <p className="text-[11.5px] text-center mt-7" style={{ color: "#5a5a62" }}>
          {t("welcome.footer")}
        </p>
      </div>
    </div>
  );
}
