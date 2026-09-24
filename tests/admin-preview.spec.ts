import { expect, test } from "@playwright/test";
import { adminPreviewState, maxedLevelInfo, maxedStats } from "../src/lib/academy-admin-preview";
import { BADGES, evaluateBadges } from "../src/lib/badges";
import { evaluateTrophies, TROPHIES } from "../src/lib/trophies";
import { RANKS } from "../src/lib/progression";

test.describe("Aperçu admin — tout débloqué à l'affichage", () => {
  test("les statistiques d'aperçu débloquent tous les badges, trophées et rangs", () => {
    const stats = maxedStats();
    expect(evaluateBadges(stats).filter((b) => b.earned).length).toBe(BADGES.length);
    expect(evaluateTrophies(stats).filter((t) => t.earned).length).toBe(TROPHIES.length);
    const info = maxedLevelInfo();
    expect(RANKS.every((r) => info.level >= r.min)).toBe(true);
  });

  test("l'aperçu ne s'active qu'avec ?apercu=1", () => {
    // En démo (sans auth réelle), tout utilisateur est admin : on vérifie le paramètre.
    expect(adminPreviewState("x@example.invalid", {}).preview).toBe(false);
    expect(adminPreviewState("x@example.invalid", { apercu: "0" }).preview).toBe(false);
    expect(adminPreviewState("x@example.invalid", { apercu: "1" }).preview).toBe(true);
  });

  test("page profil : bascule aperçu puis retour à la vraie progression", async ({ page }) => {
    await page.goto("/academy/profil");
    await page.getByRole("link", { name: /Aperçu admin/ }).click();
    await page.waitForURL("**/academy/profil?apercu=1");
    await expect(page.getByRole("status")).toContainText("Rien n'est enregistré");
    await expect(page.getByText(new RegExp(`BADGES · ${BADGES.length}/${BADGES.length}`))).toBeVisible();
    await expect(page.getByText(new RegExp(`TROPHÉES · ${TROPHIES.length}/${TROPHIES.length}`))).toBeVisible();
    await page.getByRole("link", { name: /Revenir à ma vraie progression/ }).click();
    await page.waitForURL(/\/academy\/profil$/);
    await expect(page.getByRole("status")).toHaveCount(0);
  });
});
