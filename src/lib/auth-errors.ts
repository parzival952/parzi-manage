// Lecture des réponses de Supabase Auth (GoTrue) : messages en français et
// cas particuliers de l'inscription. Fonctions pures, sans dépendance Next.js,
// pour pouvoir les tester directement.

type AuthBody = Record<string, unknown>;

const asBody = (j: unknown): AuthBody => (typeof j === "object" && j !== null ? (j as AuthBody) : {});

function rawMessage(j: unknown): string {
  const b = asBody(j);
  return String(b.error_description || b.msg || b.message || b.error || "");
}

/** Message d'erreur lisible par un élève. */
export function friendlyAuthError(j: unknown): string {
  const s = rawMessage(j);
  if (/invalid login credentials/i.test(s)) return "E-mail ou mot de passe incorrect.";
  if (/already registered/i.test(s)) return "Un compte existe déjà avec cet e-mail — connecte-toi.";
  if (/password should be at least/i.test(s)) return "Le mot de passe doit faire au moins 8 caractères.";
  if (/should contain at least one character of each/i.test(s)) return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  if (/weak.*password|password.*weak/i.test(s)) return "Ce mot de passe est trop faible : 8 caractères min., lettres et chiffres.";
  if (/email.*confirm/i.test(s)) return "Confirme ton adresse e-mail avant de te connecter.";
  if (/different from the old password/i.test(s)) return "Choisis un mot de passe différent de l'ancien.";
  if (/only request this after|security purposes/i.test(s)) return "Patiente une minute avant de redemander un e-mail.";
  if (/rate limit/i.test(s)) return "Trop d'e-mails envoyés pour le moment. Réessaie dans une heure.";
  if (/invalid.*email|email.*invalid/i.test(s)) return "Cette adresse e-mail n'est pas valide.";
  return s || "Une erreur est survenue. Réessaie.";
}

/**
 * Un e-mail vient déjà de partir vers CETTE adresse (délai minimum entre deux
 * e-mails). À l'inscription, ça veut dire que le compte existe et que l'e-mail
 * de confirmation est en route : ce n'est pas une erreur pour l'élève.
 * (Différent de la limite globale « rate limit exceeded ».)
 */
export function isEmailCooldown(j: unknown): boolean {
  return /only request this after|security purposes/i.test(rawMessage(j));
}

/** Connexion refusée parce que l'adresse n'a pas encore été confirmée. */
export function isEmailNotConfirmed(j: unknown): boolean {
  return asBody(j).error_code === "email_not_confirmed" || /email not confirmed/i.test(rawMessage(j));
}

export type AuthFragment =
  | { kind: "session"; accessToken: string; refreshToken: string; type: string }
  | { kind: "erreur"; expired: boolean }
  | null;

/**
 * Fragment d'URL posé par un lien d'e-mail Supabase :
 * #access_token=…&refresh_token=…&type=signup, ou #error=…&error_code=otp_expired.
 */
export function parseAuthFragment(hash: string): AuthFragment {
  if (!hash || hash.length < 2) return null;
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  if (p.get("error") || p.get("error_code")) {
    return { kind: "erreur", expired: p.get("error_code") === "otp_expired" };
  }
  const accessToken = p.get("access_token");
  const refreshToken = p.get("refresh_token");
  if (accessToken && refreshToken) {
    return { kind: "session", accessToken, refreshToken, type: p.get("type") ?? "" };
  }
  return null;
}
