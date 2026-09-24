export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AcademyAuthShell, { AuthMessage, authInputClass, authInputStyle } from "@/components/AcademyAuthShell";
import { ACADEMY_ORIGIN, isAcademyHost } from "@/lib/academy-host";
import { getAcademyTheme } from "@/lib/academy-theme";
import { authEnabled, getUser, requestPasswordReset } from "@/lib/auth";

export const metadata = { title: "Mot de passe oublié" };

// Étape 1 du parcours « mot de passe oublié » : l'élève saisit son adresse,
// Supabase envoie l'e-mail « Nouveau mot de passe · PARZI Academy ». Le lien
// ouvre /academy/nouveau-mot-de-passe. Le message affiché est toujours le même,
// que l'adresse ait un compte ou non (on ne révèle pas qui est inscrit).
export default async function MotDePasseOubliePage({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string; erreur?: string }>;
}) {
  const { envoye, erreur } = await searchParams;
  if (authEnabled() && (await getUser())) redirect("/academy");

  async function demander(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    if (!email) redirect("/academy/mot-de-passe-oublie");
    // Démo / dev sans Supabase : rien à envoyer.
    if (!authEnabled()) redirect("/academy/mot-de-passe-oublie?envoye=1");
    // Le lien de l'e-mail ramène toujours sur l'adresse officielle en
    // production (parziacademy.fr, ou vercel.app en production) ; ailleurs
    // (preview, local) → « Site URL » réglée dans Supabase.
    const onAcademy =
      isAcademyHost((await headers()).get("host")) || process.env.VERCEL_ENV === "production";
    const res = await requestPasswordReset(
      email,
      onAcademy ? `${ACADEMY_ORIGIN}/academy/nouveau-mot-de-passe` : undefined,
    );
    if (!res.ok) redirect(`/academy/mot-de-passe-oublie?erreur=${encodeURIComponent(res.error)}`);
    redirect("/academy/mot-de-passe-oublie?envoye=1");
  }

  const theme = await getAcademyTheme();

  return (
    <AcademyAuthShell
      theme={theme}
      title="Mot de passe oublié"
      subtitle="Indique l'adresse de ton compte : on t'envoie un lien pour choisir un nouveau mot de passe."
    >
      {!authEnabled() ? (
        <AuthMessage tone="erreur">
          Mode démonstration : aucun e-mail n&apos;est envoyé ici.
        </AuthMessage>
      ) : null}
      {envoye ? (
        <AuthMessage tone="ok">
          Si un compte existe pour cette adresse, un e-mail « Nouveau mot de passe » vient de
          partir. Pense à regarder dans les spams. Le lien est valable 1 heure.
        </AuthMessage>
      ) : null}
      {erreur ? <AuthMessage tone="erreur">{erreur}</AuthMessage> : null}

      <form action={demander} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="ton@email.com"
          autoComplete="email"
          aria-label="Adresse e-mail"
          className={authInputClass}
          style={authInputStyle}
        />
        <button type="submit" className="pz-btn w-full mt-1" style={{ padding: "13px 16px" }}>
          Recevoir le lien →
        </button>
      </form>
    </AcademyAuthShell>
  );
}
