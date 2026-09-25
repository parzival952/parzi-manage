export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import AcademyAuthShell, { AuthMessage, authInputClass, authInputStyle } from "@/components/AcademyAuthShell";
import SubmitButton from "@/components/SubmitButton";
import { forgetPendingEmail } from "@/lib/academy-signup";
import { getAcademyTheme } from "@/lib/academy-theme";
import { deleteAccountWithPassword, requireUser } from "@/lib/auth";

export const metadata = { title: "Supprimer mon compte", robots: { index: false, follow: false } };

// Droit à l'effacement : l'élève supprime lui-même son compte et toutes ses
// données. Hors de l'espace Academy (pas besoin d'avoir fini « Faisons
// connaissance » pour partir). Mot de passe redemandé + confirmation cochée.
export default async function SupprimerMonComptePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { erreur } = await searchParams;
  const user = await requireUser();

  async function supprimer(formData: FormData) {
    "use server";
    const u = await requireUser();
    if (formData.get("confirmation") !== "oui") {
      redirect(`/academy/compte/supprimer?erreur=${encodeURIComponent("Coche la case pour confirmer.")}`);
    }
    const res = await deleteAccountWithPassword(u.email, String(formData.get("password") ?? ""));
    if (!res.ok) redirect(`/academy/compte/supprimer?erreur=${encodeURIComponent(res.error)}`);
    await forgetPendingEmail();
    redirect(`/academy/connexion?info=${encodeURIComponent("Ton compte et toutes tes données ont été supprimés.")}`);
  }

  const theme = await getAcademyTheme();

  return (
    <AcademyAuthShell
      theme={theme}
      title="Supprimer mon compte"
      subtitle="La suppression est immédiate et définitive."
      backLink={false}
    >
      {erreur ? <AuthMessage tone="erreur">{erreur}</AuthMessage> : null}

      <div className="text-[13.5px] leading-6" style={{ color: "var(--texte-2)" }}>
        <p>
          Tout ce qui est lié à <strong className="text-white">{user.email}</strong> sera effacé :
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          <li>· ton compte et ta connexion ;</li>
          <li>· ton profil « Faisons connaissance » ;</li>
          <li>· ta progression : leçons, XP, badges, diagnostic, simulations, notes ;</li>
          <li>· tes données Parzi Manage, si tu t&apos;en sers : le compte est le même.</li>
        </ul>
        <p className="mt-3 pz-muted text-[12.5px]">On ne pourra rien récupérer ensuite.</p>
      </div>

      <form action={supprimer} className="flex flex-col gap-3 mt-5">
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Ton mot de passe"
          aria-label="Ton mot de passe"
          className={authInputClass}
          style={authInputStyle}
        />
        <label className="pz-choice text-[13px]">
          <input type="checkbox" name="confirmation" value="oui" required />
          <span>Je comprends que la suppression de mon compte est définitive.</span>
        </label>
        <SubmitButton
          label="Supprimer définitivement mon compte"
          pendingLabel="Suppression…"
          className="pz-btn w-full"
          style={{ padding: "13px 16px" }}
        />
      </form>

      <p className="text-[13px] mt-5 text-center">
        <Link href="/academy/profil" className="font-bold pz-muted hover:underline">
          Annuler
        </Link>
      </p>
    </AcademyAuthShell>
  );
}
