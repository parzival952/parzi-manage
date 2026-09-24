// Parcours d'inscription PARZI Academy : adresse de retour des liens d'e-mail
// et mémorisation (courte) de l'adresse en attente de confirmation, pour
// l'afficher et pouvoir renvoyer l'e-mail sans la redemander.
import { cookies, headers } from "next/headers";

import { ACADEMY_ORIGIN, isAcademyHost } from "@/lib/academy-host";

const PENDING_COOKIE = "pz_inscription";

/**
 * Adresse où ramène un lien d'e-mail. En production (parziacademy.fr, ou
 * l'adresse vercel.app de production) : toujours l'adresse officielle, jamais
 * tirée de l'en-tête Host. Ailleurs (preview, local) : undefined → « Site URL »
 * réglée dans Supabase.
 */
export async function academyEmailRedirect(path: string): Promise<string | undefined> {
  const onAcademy = isAcademyHost((await headers()).get("host")) || process.env.VERCEL_ENV === "production";
  return onAcademy ? `${ACADEMY_ORIGIN}${path}` : undefined;
}

/** Page d'arrivée du lien de confirmation d'inscription. */
export const CONFIRMATION_PATH = "/academy/confirmation";

export async function rememberPendingEmail(email: string): Promise<void> {
  const jar = await cookies();
  jar.set(PENDING_COOKIE, email.trim().toLowerCase(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function pendingEmail(): Promise<string> {
  const jar = await cookies();
  return jar.get(PENDING_COOKIE)?.value ?? "";
}

export async function forgetPendingEmail(): Promise<void> {
  const jar = await cookies();
  jar.delete(PENDING_COOKIE);
}
