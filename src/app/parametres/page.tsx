export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { briefEmailHtml, emailEnabled, sendEmail } from "@/lib/email";
import { getTodayBrief, getTodayRecommendations } from "@/lib/ai";
import { getProfile, setNotifyBrief, upsertProfile } from "@/lib/queries";

export default async function ParametresPage({ searchParams }: { searchParams: Promise<{ envoi?: string }> }) {
  const { envoi } = await searchParams;
  const user = await requireUser();
  let profile = await getProfile(user.id);
  if (!profile) {
    await upsertProfile(user.id, user.email);
    profile = await getProfile(user.id);
  }
  const notifyOn = Boolean(profile?.notify_brief);
  const mailReady = emailEnabled();

  async function toggleNotify() {
    "use server";
    const u = await requireUser();
    const p = await getProfile(u.id);
    await setNotifyBrief(u.id, !p?.notify_brief);
    revalidatePath("/parametres");
  }

  async function sendTestBrief() {
    "use server";
    const u = await requireUser();
    const brief = await getTodayBrief(u.id);
    if (!brief) redirect("/parametres?envoi=aucun-brief");
    const actions = await getTodayRecommendations(u.id);
    const dateLabel = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const ok = await sendEmail(u.email, `☀️ Ton plan du jour — ${actions.length ? actions.length + " actions" : "brief"} Parzi`, briefEmailHtml(brief, actions, dateLabel));
    redirect(ok ? "/parametres?envoi=ok" : "/parametres?envoi=erreur");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-1">⚙ Réglages</h1>
      <p className="text-sm text-[#898781] mb-6">Ton compte et tes notifications.</p>

      <div className="glass-card p-5 mb-4">
        <div className="text-[11px] font-bold tracking-wider text-[#2563eb] mb-3">COMPTE</div>
        <div className="text-[14px]"><span className="text-[#64748b]">E-mail :</span> <b>{user.email}</b></div>
      </div>

      <div className="glass-card p-5">
        <div className="text-[11px] font-bold tracking-wider text-[#2563eb] mb-3">NOTIFICATIONS</div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-[14px]">Brief du matin par e-mail</div>
            <p className="text-[12.5px] text-[#64748b] mt-0.5">
              Chaque matin vers 6h : ta mission du jour et tes actions prioritaires, directement dans ta boîte mail.
            </p>
          </div>
          <form action={toggleNotify}>
            <button
              type="submit"
              aria-label="Activer ou désactiver le brief par e-mail"
              className={
                "relative w-12 h-7 rounded-full transition-colors " +
                (notifyOn ? "bg-[#2563eb]" : "bg-[#cbd5e1]")
              }
            >
              <span className={"absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all " + (notifyOn ? "left-[22px]" : "left-0.5")} />
            </button>
          </form>
        </div>
        {!mailReady ? (
          <p className="text-[12px] text-[#94a3b8] mt-3 border-t border-[#e8ebf0] pt-3">
            L&apos;envoi d&apos;e-mails n&apos;est pas encore activé sur ce déploiement — ta préférence est enregistrée et prendra effet dès l&apos;activation.
          </p>
        ) : (
          <div className="mt-3 border-t border-[#e8ebf0] pt-3">
            <form action={sendTestBrief}>
              <button type="submit" className="text-[12.5px] text-[#2563eb] font-medium hover:underline">
                ✉️ M&apos;envoyer mon brief maintenant (test)
              </button>
            </form>
            {envoi === "ok" && <p className="text-[12px] text-[#10b981] mt-2">✓ E-mail envoyé — vérifie ta boîte (et les spams la première fois).</p>}
            {envoi === "erreur" && <p className="text-[12px] text-[#ef4444] mt-2">L&apos;envoi a échoué. Vérifie la clé Resend — et note qu&apos;avec l&apos;expéditeur de test, Resend n&apos;envoie qu&apos;à l&apos;adresse du compte Resend.</p>}
            {envoi === "aucun-brief" && <p className="text-[12px] text-[#f59e0b] mt-2">Génère d&apos;abord ton brief du jour sur le Dashboard, puis reviens tester l&apos;envoi.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
