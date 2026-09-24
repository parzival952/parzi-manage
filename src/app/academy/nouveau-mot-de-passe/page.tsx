export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import AcademyAuthShell from "@/components/AcademyAuthShell";
import NewPasswordForm from "@/components/NewPasswordForm";
import { getAcademyTheme } from "@/lib/academy-theme";
import { getUser, setPasswordWithRecovery } from "@/lib/auth";
import { getProfile, setPath, upsertProfile } from "@/lib/queries";

export const metadata = { title: "Nouveau mot de passe" };

// Étape 2 du parcours « mot de passe oublié » : page ouverte par le lien de
// l'e-mail. Les jetons de récupération arrivent dans le fragment d'URL (lus
// côté navigateur par NewPasswordForm) ; le serveur fixe le mot de passe avec
// ce jeton, garde la session et envoie l'élève sur l'Academy.
export default async function NouveauMotDePassePage() {
  async function enregistrer(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
    "use server";
    const accessToken = String(formData.get("access_token") ?? "");
    const refreshToken = String(formData.get("refresh_token") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");

    if (!accessToken || !refreshToken) {
      return { error: "Ce lien n'est pas valide. Redemande un e-mail « mot de passe oublié »." };
    }
    if (password.length < 6) return { error: "Le mot de passe doit faire au moins 6 caractères." };
    if (password !== confirmation) return { error: "Les deux mots de passe ne sont pas identiques." };

    const res = await setPasswordWithRecovery(accessToken, refreshToken, password);
    if (!res.ok) return { error: res.error };

    const u = await getUser();
    if (u) {
      await upsertProfile(u.id, u.email);
      const profile = await getProfile(u.id);
      if (!profile?.path) await setPath(u.id, "aspirant");
    }
    redirect("/academy");
  }

  const theme = await getAcademyTheme();

  return (
    <AcademyAuthShell
      theme={theme}
      title="Nouveau mot de passe"
      subtitle="Choisis ton nouveau mot de passe : tu seras connecté juste après."
    >
      <NewPasswordForm action={enregistrer} />
    </AcademyAuthShell>
  );
}
