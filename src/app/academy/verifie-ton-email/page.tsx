export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import AcademyAuthShell, { AuthMessage, authInputClass, authInputStyle } from "@/components/AcademyAuthShell";
import SubmitButton from "@/components/SubmitButton";
import { CONFIRMATION_PATH, academyEmailRedirect, pendingEmail, rememberPendingEmail } from "@/lib/academy-signup";
import { getAcademyTheme } from "@/lib/academy-theme";
import { authEnabled, getUser, resendSignupEmail } from "@/lib/auth";

export const metadata = { title: "Vérifie ta boîte mail" };

// Après l'inscription : le compte est créé, l'e-mail de confirmation est parti.
// On le dit clairement (ce n'est pas une erreur), on explique quoi faire, et on
// permet de renvoyer l'e-mail. Le lien de l'e-mail connecte directement
// l'élève (page /academy/confirmation).
export default async function VerifieTonEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ renvoye?: string; attendre?: string; erreur?: string; "non-confirme"?: string }>;
}) {
  const params = await searchParams;
  if (authEnabled() && (await getUser())) redirect("/academy");
  const email = await pendingEmail();

  async function renvoyer(formData: FormData) {
    "use server";
    const adresse = String(formData.get("email") ?? "").trim();
    if (!adresse) redirect("/academy/verifie-ton-email");
    await rememberPendingEmail(adresse);
    // Démo / dev sans Supabase : rien à envoyer.
    if (!authEnabled()) redirect("/academy/verifie-ton-email?renvoye=1");
    const res = await resendSignupEmail(adresse, await academyEmailRedirect(CONFIRMATION_PATH));
    if (res.ok) redirect("/academy/verifie-ton-email?renvoye=1");
    if (res.cooldown) redirect("/academy/verifie-ton-email?attendre=1");
    redirect(`/academy/verifie-ton-email?erreur=${encodeURIComponent(res.error)}`);
  }

  const theme = await getAcademyTheme();

  return (
    <AcademyAuthShell
      theme={theme}
      title="Vérifie ta boîte mail"
      subtitle="Ton compte est créé. Il reste une étape : confirmer ton adresse."
    >
      {params["non-confirme"] ? (
        <AuthMessage tone="erreur">
          Ton adresse n&apos;est pas encore confirmée : clique sur le lien de l&apos;e-mail qu&apos;on t&apos;a
          envoyé, ou renvoie-le ci-dessous.
        </AuthMessage>
      ) : null}
      {params.renvoye ? (
        <AuthMessage tone="ok">Nouvel e-mail envoyé. Il peut mettre une ou deux minutes à arriver.</AuthMessage>
      ) : null}
      {params.attendre ? (
        <AuthMessage tone="ok">
          Un e-mail vient déjà de partir vers cette adresse. Attends une minute avant d&apos;en redemander un.
        </AuthMessage>
      ) : null}
      {params.erreur ? <AuthMessage tone="erreur">{params.erreur}</AuthMessage> : null}

      <div className="text-[14px] leading-6" style={{ color: "var(--texte-2)" }}>
        <p>
          On vient d&apos;envoyer un lien de confirmation à{" "}
          {email ? <strong className="text-white">{email}</strong> : "ton adresse"}. Clique dessus : ton compte
          sera activé et tu seras connecté directement.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-[13px] pz-muted">
          <li>· L&apos;e-mail s&apos;appelle « Confirme ton adresse e-mail · PARZI Academy ».</li>
          <li>· Pas reçu d&apos;ici deux minutes ? Regarde dans les spams ou le « courrier indésirable » (surtout Hotmail et Outlook).</li>
          <li>· Le lien n&apos;est valable qu&apos;une fois, et pendant une durée limitée.</li>
        </ul>
      </div>

      <form action={renvoyer} className="flex flex-col gap-3 mt-6">
        <input
          name="email"
          type="email"
          required
          defaultValue={email}
          placeholder="ton@email.com"
          autoComplete="email"
          aria-label="Adresse e-mail"
          className={authInputClass}
          style={authInputStyle}
        />
        <SubmitButton
          label="Renvoyer l'e-mail de confirmation"
          pendingLabel="Envoi…"
          className="pz-btn w-full"
          style={{ padding: "13px 16px" }}
        />
      </form>

      <p className="text-[13px] pz-muted mt-5">
        Mauvaise adresse ?{" "}
        <Link href="/academy/connexion?mode=inscription" className="font-bold pz-red hover:underline">
          Recommencer l&apos;inscription
        </Link>
      </p>
    </AcademyAuthShell>
  );
}
