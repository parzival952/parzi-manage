// Vérification agent — première brique de Parzi ID.
// Seul un agent dont la licence FFF/FIFA est vérifiée accède aux fonctions de
// contact (CRM, Clubs / démarchage). Aligné cahier des charges : « badge agent
// vérifié (licence FFF/FIFA contrôlée) » + valeur « vérifier les identités ».
import { authEnabled, requireUser, type SessionUser } from "./auth";
import { getProfile, type AgentStatus } from "./queries";

/** Admins autorisés à valider les licences (console /admin). Surcharge via ADMIN_EMAILS. */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "parzival95200@gmail.com")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

/**
 * Statut de vérification de l'agent courant.
 * En mode démo (sans auth réelle configurée) tout est ouvert → 'verified' :
 * le gate ne s'applique qu'en production avec de vrais comptes.
 */
export async function getAgentStatus(uid: string): Promise<AgentStatus> {
  if (!authEnabled()) return "verified";
  const p = await getProfile(uid);
  return (p?.agent_status as AgentStatus) ?? "none";
}

export async function isVerifiedAgent(uid: string): Promise<boolean> {
  return (await getAgentStatus(uid)) === "verified";
}

/** Un e-mail est-il administrateur ? (démo = accès ouvert pour le dev/les tests) */
export function isAdmin(email: string | undefined | null): boolean {
  if (!authEnabled()) return true;
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}

/** À appeler en tête d'une page admin : exige un utilisateur administrateur, sinon 404. */
export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (!isAdmin(u.email)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return u;
}
