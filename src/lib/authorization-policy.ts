import type { AgentStatus } from "./queries";

/** Règles pures, isolées pour pouvoir être testées sans session ni base. */
export function canUseVerifiedAgentFeatures(status: AgentStatus): boolean {
  return status === "verified";
}

export function hasOwnedResource<T>(resource: T | null | undefined): resource is T {
  return resource !== null && resource !== undefined;
}

export function changedOwnedResource(changed: boolean): boolean {
  return changed;
}
