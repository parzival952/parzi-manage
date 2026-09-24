export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import AcademyAuthShell from "@/components/AcademyAuthShell";
import EmailConfirmation from "@/components/EmailConfirmation";
import { forgetPendingEmail } from "@/lib/academy-signup";
import { getAcademyTheme } from "@/lib/academy-theme";
import { getUser, openSessionFromEmailLink } from "@/lib/auth";
import { getProfile, setPath, upsertProfile } from "@/lib/queries";

export const metadata = { title: "Confirmation" };

// Page ouverte par le lien de l'e-mail « Confirme ton adresse e-mail ».
// Supabase a déjà confirmé l'adresse ; la session arrive dans le fragment
// d'URL (lu côté navigateur par EmailConfirmation). Le serveur la vérifie,
// connecte l'élève, crée son profil « aspirant » et l'envoie sur l'Academy :
// pas besoin de ressaisir son mot de passe.
export default async function ConfirmationPage() {
  async function ouvrir(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
    "use server";
    const res = await openSessionFromEmailLink(
      String(formData.get("access_token") ?? ""),
      String(formData.get("refresh_token") ?? ""),
    );
    if (!res.ok) {
      return { error: "Ce lien n'est plus valide. Connecte-toi avec ton e-mail et ton mot de passe." };
    }
    const u = await getUser();
    if (u) {
      await upsertProfile(u.id, u.email);
      // Jamais écraser un compte agent (Parzi Manage).
      const profile = await getProfile(u.id);
      if (!profile?.path) await setPath(u.id, "aspirant");
    }
    await forgetPendingEmail();
    redirect("/academy");
  }

  const theme = await getAcademyTheme();

  return (
    <AcademyAuthShell theme={theme} title="Bienvenue sur PARZI Academy" subtitle="On active ton compte.">
      <EmailConfirmation action={ouvrir} />
    </AcademyAuthShell>
  );
}
