import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  canUseVerifiedAgentFeatures,
  changedOwnedResource,
  hasOwnedResource,
} from "../src/lib/authorization-policy";

const source = (path: string) => readFile(path, "utf8");

test.describe("R-007 — règles d’autorisation serveur", () => {
  test("lecture : une ressource absente du périmètre propriétaire est refusée", () => {
    expect(hasOwnedResource({ id: 1 })).toBe(true);
    expect(hasOwnedResource(undefined)).toBe(false);
    expect(hasOwnedResource(null)).toBe(false);
  });

  test("création : Clubs et CRM exigent un agent vérifié côté serveur", async () => {
    expect(canUseVerifiedAgentFeatures("verified")).toBe(true);
    expect(canUseVerifiedAgentFeatures("pending")).toBe(false);
    expect(canUseVerifiedAgentFeatures("rejected")).toBe(false);

    const [clubs, crm] = await Promise.all([
      source("src/app/clubs/page.tsx"),
      source("src/app/crm/page.tsx"),
    ]);
    expect(clubs).toContain("const u = await requireVerifiedAgent()");
    expect(crm).toContain("const u = await requireVerifiedAgent()");
  });

  test("modification : aucune ligne propriétaire affectée produit un refus", async () => {
    expect(changedOwnedResource(true)).toBe(true);
    expect(changedOwnedResource(false)).toBe(false);

    const playerActions = await source("src/app/joueurs/[id]/modifier/page.tsx");
    expect(playerActions).toContain("requireOwnedMutation(await updatePlayer");
  });

  test("suppression : les mutations sensibles contrôlent la ligne affectée", async () => {
    const files = await Promise.all([
      source("src/app/joueurs/[id]/modifier/page.tsx"),
      source("src/app/clubs/page.tsx"),
      source("src/app/scouting/page.tsx"),
      source("src/app/calendrier/page.tsx"),
    ]);

    for (const contents of files) {
      expect(contents).toContain("requireOwnedMutation(await delete");
    }
  });
});
