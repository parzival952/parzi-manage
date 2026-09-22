import "server-only";

import { notFound } from "next/navigation";
import { requireUser, type SessionUser } from "./auth";
import { getAgentStatus, isAdmin } from "./verification";
import {
  canUseVerifiedAgentFeatures,
  changedOwnedResource,
  hasOwnedResource,
} from "./authorization-policy";

/** Exige une session et un statut d’agent vérifié pour les fonctions métier sensibles. */
export async function requireVerifiedAgent(): Promise<SessionUser> {
  const user = await requireUser();
  const status = await getAgentStatus(user.id);
  if (!canUseVerifiedAgentFeatures(status)) notFound();
  return user;
}

/**
 * Exige le rôle administrateur courant.
 * R-010 remplacera la source provisoire par un RBAC persistant et audité.
 */
export async function requireAdminRole(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isAdmin(user.email)) notFound();
  return user;
}

/** Masque l’existence d’une ressource absente ou appartenant à un autre compte. */
export function requireOwnedResource<T>(resource: T | null | undefined): T {
  if (!hasOwnedResource(resource)) notFound();
  return resource;
}

/** Transforme une mutation sans ligne affectée en réponse « introuvable ». */
export function requireOwnedMutation(changed: boolean): void {
  if (!changedOwnedResource(changed)) notFound();
}
