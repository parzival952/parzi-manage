// Authentification Parzi Manage — Supabase Auth via API REST (GoTrue).
// Pas de SDK : appels fetch directs, session en cookies httpOnly.
// En dev local sans Supabase configuré → mode démo sans connexion.
import { cookies, headers as requestHeaders } from "next/headers";
import { redirect } from "next/navigation";

import { SURFACE_HEADER } from "@/lib/academy-host";

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
 */
export async function signUp(
  email: string,
  password: string,
  redirectTo?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const query = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
  const r = await fetch(`${AUTH()}/signup${query}`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  if (!r.ok) return { ok: false, error: friendlyError(j) };
  if (j.access_token) {
    await storeSession(j as AuthTokens);
    return { ok: true };
  }
  // Confirmation e-mail activée côté Supabase : pas de session immédiate
  return { ok: false, error: "Compte créé — confirme ton adresse e-mail puis connecte-toi." };
}

export async function signIn(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await fetch(`${AUTH()}/token?grant_type=password`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  if (!r.ok) return { ok: false, error: friendlyError(j) };
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

function friendlyError(j: unknown): string {
  const raw = typeof j === "object" && j !== null
    ? ((j as Record<string, unknown>).error_description || (j as Record<string, unknown>).msg || (j as Record<string, unknown>).message || "")
    : "";
  const s = String(raw);
  if (/invalid login credentials/i.test(s)) return "E-mail ou mot de passe incorrect.";
  if (/already registered/i.test(s)) return "Un compte existe déjà avec cet e-mail — connecte-toi.";
  if (/password should be at least/i.test(s)) return "Le mot de passe doit faire au moins 6 caractères.";
  if (/email.*confirm/i.test(s)) return "Confirme ton adresse e-mail avant de te connecter.";
  if (/different from the old password/i.test(s)) return "Choisis un mot de passe différent de l'ancien.";
  if (/only request this after|security purposes/i.test(s)) return "Patiente une minute avant de redemander un e-mail.";
  if (/rate limit/i.test(s)) return "Trop d'e-mails envoyés pour le moment. Réessaie dans une heure.";
  return s || "Une erreur est survenue. Réessaie.";
}
