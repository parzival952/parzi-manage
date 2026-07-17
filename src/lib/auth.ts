// Authentification Parzi Manage — Supabase Auth via API REST (GoTrue).
// Pas de SDK : appels fetch directs, session en cookies httpOnly.
// En dev local sans Supabase configuré → mode démo sans connexion.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const authEnabled = () => Boolean(SUPABASE_URL && ANON_KEY && process.env.DATABASE_URL);

export type SessionUser = { id: string; email: string };

type AuthTokens = { access_token: string; refresh_token: string; user?: { id: string; email: string } };

const AUTH = () => `${SUPABASE_URL}/auth/v1`;
const headers = () => ({ apikey: ANON_KEY as string, "Content-Type": "application/json" });

export async function signUp(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await fetch(`${AUTH()}/signup`, {
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

export async function signOut() {
  const jar = await cookies();
  jar.delete("pm_at");
  jar.delete("pm_rt");
}

async function storeSession(t: AuthTokens) {
  const jar = await cookies();
  const opts = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };
  jar.set("pm_at", t.access_token, { ...opts, maxAge: 60 * 60 });
  jar.set("pm_rt", t.refresh_token, { ...opts, maxAge: 60 * 60 * 24 * 30 });
}

/** Utilisateur courant, ou null. Rafraîchit la session si le token a expiré. */
export async function getUser(): Promise<SessionUser | null> {
  if (!authEnabled()) return { id: "demo", email: "demo@parzi.local" };
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
}

/** À appeler en tête de chaque page protégée. */
export async function requireUser(): Promise<SessionUser> {
  const u = await getUser();
  if (!u) redirect("/connexion");
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
  return s || "Une erreur est survenue. Réessaie.";
}
