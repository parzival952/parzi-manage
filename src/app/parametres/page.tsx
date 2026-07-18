export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { emailEnabled } from "@/lib/email";
import { getProfile, setNotifyBrief, upsertProfile } from "@/lib/queries";

export default async function ParametresPage() {
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
        {!mailReady && (
          <p className="text-[12px] text-[#94a3b8] mt-3 border-t border-[#e8ebf0] pt-3">
            L&apos;envoi d&apos;e-mails n&apos;est pas encore activé sur ce déploiement — ta préférence est enregistrée et prendra effet dès l&apos;activation.
          </p>
        )}
      </div>
    </div>
  );
}
