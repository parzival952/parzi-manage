// Authentification Parzi Manage — Supabase Auth via API REST (GoTrue).
// Pas de SDK : appels fetch directs, session en cookies httpOnly.
// En dev local sans Supabase configuré → mode démo sans connexion.
import { cookies, headers as requestHeaders } from "next/headers";
import { redirect } from "next/navigation";

import { SURFACE_HEADER } from "@/lib/academy-host";
import { friendlyAuthError as friendlyError, isEmailCooldown, isEmailNotConfirmed } from "@/lib/auth-errors";

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const authEnabled = () => Boolean(SUPABASE_URL && ANON_KEY);

export type SessionUser = { id: string; email: string };

// UUID valide pour le mode démo (sans auth configurée) — compatible colonnes uuid Postgres.
const DEMO_USER: SessionUser = { id: "00000000-0000-0000-0000-000000000000", email: "demo@parzi.local" };

type AuthTokens = { access_token: string; refresh_token: string; user?: { id: string; email: string } };

const AUTH = () => `${SUPABASE_URL}/auth/v1`;
const headers = () => ({ apikey: ANON_KEY as string, "Content-Type": "application/json" });

/**
 * Inscription. `redirectTo` = page où arrive le lien de l'e-mail de confirmation
 * (si la confirmation est activée côté Supabase). Supabase ne l'utilise que si
 * l'adresse figure dans Authentication → URL Configuration → Redirect URLs ;
 * sinon il retombe sur la « Site URL ».
 *
 * Résultat :
 * - « connecte » : session ouverte tout de suite (confirmation désactivée) ;
 * - « a-confirmer » : compte créé, e-mail de confirmation envoyé. C'est aussi
 *   le cas quand Supabase répond « patiente N secondes » : un e-mail vient de
 *   partir vers cette adresse (double clic, ou nouvel essai trop rapide) ;
 * - « erreur » : message à afficher.
 */
export type SignUpResult = { status: "connecte" } | { status: "a-confirmer" } | { status: "erreur"; error: string };

export async function signUp(email: string, password: string, redirectTo?: string): Promise<SignUpResult> {
  const query = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
  const r = await fetch(`${AUTH()}/signup${query}`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (isEmailCooldown(j)) return { status: "a-confirmer" };
    return { status: "erreur", error: friendlyError(j) };
  }
  if (j.access_token) {
    await storeSession(j as AuthTokens);
    return { status: "connecte" };
  }
  return { status: "a-confirmer" };
}

/**
 * Renvoie l'e-mail de confirmation d'inscription. Supabase impose un délai
 * minimum entre deux e-mails pour une même adresse : `cooldown` le signale.
 */
export async function resendSignupEmail(
  email: string,
  redirectTo?: string,
): Promise<{ ok: true } | { ok: false; cooldown: boolean; error: string }> {
  const query = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
  const r = await fetch(`${AUTH()}/resend${query}`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ type: "signup", email }),
  });
  if (r.ok) return { ok: true };
  const j = await r.json().catch(() => ({}));
  return { ok: false, cooldown: isEmailCooldown(j), error: friendlyError(j) };
}

/**
 * Lien de confirmation cliqué : Supabase a confirmé l'adresse et renvoie une
 * session dans le fragment d'URL. On vérifie le jeton auprès de Supabase avant
 * de l'enregistrer : l'élève est connecté sans ressaisir son mot de passe.
 */
export async function openSessionFromEmailLink(
  accessToken: string,
  refreshToken: string,
): Promise<{ ok: true } | { ok: false }> {
  if (!authEnabled() || !accessToken || !refreshToken) return { ok: false };
  try {
    const r = await fetch(`${AUTH()}/user`, { headers: { ...headers(), Authorization: `Bearer ${accessToken}` } });
    if (!r.ok) return { ok: false };
    const u = (await r.json()) as { email_confirmed_at?: string | null };
    if (!u.email_confirmed_at) return { ok: false };
  } catch {
    return { ok: false };
  }
  await storeSession({ access_token: accessToken, refresh_token: refreshToken });
  return { ok: true };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string; unconfirmed?: boolean }> {
  const r = await fetch(`${AUTH()}/token?grant_type=password`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: friendlyError(j), unconfirmed: isEmailNotConfirmed(j) };
  await storeSession(j as AuthTokens);
  return { ok: true };
}

/**
 * Demande d'e-mail « nouveau mot de passe ». Réponse volontairement neutre
 * côté interface (on ne dit jamais si l'adresse a un compte) ; seules les
 * erreurs de limite d'envoi sont remontées.
 */
export async function requestPasswordReset(
  email: string,
  redirectTo?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const query = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
  const r = await fetch(`${AUTH()}/recover${query}`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ email }),
  });
  if (r.ok) return { ok: true };
  const j = await r.json().catch(() => ({}));
  const error = friendlyError(j);
  // Limite d'envoi : on prévient. Toute autre erreur reste neutre.
  if (/patiente|trop d'e-mails/i.test(error)) return { ok: false, error };
  return { ok: true };
}

/**
 * Fin du parcours « mot de passe oublié » : le lien de l'e-mail ouvre une
 * session de récupération (jetons dans le fragment d'URL). On fixe le nouveau
 * mot de passe avec ce jeton, puis on garde la session : l'élève est connecté.
 */
export async function setPasswordWithRecovery(
  accessToken: string,
  refreshToken: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await fetch(`${AUTH()}/user`, {
    method: "PUT",
    headers: { ...headers(), Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ password }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 || r.status === 403) {
      return { ok: false, error: "Ce lien a expiré. Redemande un e-mail « mot de passe oublié »." };
    }
    return { ok: false, error: friendlyError(j) };
  }
  await storeSession({ access_token: accessToken, refresh_token: refreshToken });
  return { ok: true };
}

/**
 * « Supprimer mon compte » : l'élève redonne son mot de passe (vérifié par
 * Supabase, pour le compte connecté uniquement), puis la fonction
 * delete_my_account (migration 032) supprime SA ligne auth.users avec le jeton
 * obtenu ; toutes ses données suivent (ON DELETE CASCADE). Session effacée.
 */
export async function deleteAccountWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!authEnabled()) return { ok: false, error: "Mode démonstration : aucun compte à supprimer." };
  const r = await fetch(`${AUTH()}/token?grant_type=password`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) {
    const error = friendlyError(j);
    return { ok: false, error: error === "E-mail ou mot de passe incorrect." ? "Mot de passe incorrect." : error };
  }
  const del = await fetch(`${SUPABASE_URL}/rest/v1/rpc/delete_my_account`, {
    method: "POST",
    headers: { ...headers(), Authorization: `Bearer ${j.access_token}` },
    body: "{}",
  });
  if (!del.ok) {
    return { ok: false, error: "La suppression n'a pas abouti. Réessaie dans un instant, ou écris-nous." };
  }
  await signOut();
  return { ok: true };
}

export async function signOut() {
  const jar = await cookies();
  jar.delete("pm_at");
  jar.delete("pm_rt");
}

async function storeSession(t: AuthTokens) {
  const jar = await cookies();
  const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  jar.set("pm_at", t.access_token, { ...opts, maxAge: 60 * 60 });
  jar.set("pm_rt", t.refresh_token, { ...opts, maxAge: 60 * 60 * 24 * 30 });
}

/** Utilisateur courant, ou null. Rafraîchit la session si le token a expiré. */
export async function getUser(): Promise<SessionUser | null> {
  if (!authEnabled()) return DEMO_USER;
  try {
    const jar = await cookies();
    const at = jar.get("pm_at")?.value;
    if (at) {
      const r = await fetch(`${AUTH()}/user`, { headers: { ...headers(), Authorization: `Bearer ${at}` } });
      if (r.ok) {
        const j = await r.json();
        return { id: j.id, email: j.email };
      }
    }
    // access token absent/expiré → tentative de refresh
    const rt = jar.get("pm_rt")?.value;
    if (!rt) return null;
    const r = await fetch(`${AUTH()}/token?grant_type=refresh_token`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as AuthTokens;
    await storeSession(j);
    return j.user ? { id: j.user.id, email: j.user.email } : null;
  } catch {
    // Auth injoignable → considéré comme non connecté plutôt que page en erreur
    return null;
  }
}

/**
 * À appeler en tête de chaque page protégée. Un visiteur non connecté est
 * envoyé vers la connexion du produit qu'il visite : PARZI Academy
 * (/academy/connexion) ou Parzi Manage (/connexion).
 */
export async function requireUser(): Promise<SessionUser> {
  const u = await getUser();
  if (!u) {
    const surface = (await requestHeaders()).get(SURFACE_HEADER);
    redirect(surface === "academy" ? "/academy/connexion" : "/connexion");
  }
  return u;
}
