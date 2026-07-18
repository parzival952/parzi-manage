import { test, expect } from "@playwright/test";

// Smoke tests — mode démo (SQLite, sans auth ni IA). Vérifie les parcours clés.

test("le dashboard Command Center s'affiche avec les données de démo", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("MISSION DU JOUR")).toBeVisible();
  await expect(page.getByText("Agency Health")).toBeVisible();
  await expect(page.getByText("Timeline live")).toBeVisible();
  await expect(page.getByText("Plan d'action")).toBeVisible();
  await expect(page.getByText("Joueurs prioritaires")).toBeVisible();
});

test("ajout puis suppression d'un joueur", async ({ page }) => {
  await page.goto("/joueurs/nouveau");
  await page.fill('input[name="name"]', "T. Smoke");
  await page.selectOption('select[name="position"]', "Avant-centre");
  await page.fill('input[name="age"]', "21");
  await page.fill('input[name="club"]', "FC CI");
  await page.getByRole("button", { name: "Ajouter le joueur" }).click();
  await page.waitForURL("**/joueurs");
  await expect(page.getByText("T. Smoke")).toBeVisible();

  await page.getByRole("link", { name: "T. Smoke" }).click();
  await page.getByRole("link", { name: "Modifier" }).click();
  await page.getByRole("button", { name: /Supprimer ce joueur/ }).click();
  await page.waitForURL("**/joueurs");
  await expect(page.getByText("T. Smoke")).toHaveCount(0);
});

test("le dossier joueur s'affiche", async ({ page }) => {
  await page.goto("/joueurs/1/dossier");
  await expect(page.getByText("Dossier joueur", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: /Imprimer/ })).toBeVisible();
});

test("clubs, scouting, CRM, calendrier et réglages répondent", async ({ page }) => {
  for (const path of ["/clubs", "/scouting", "/crm", "/calendrier", "/parametres", "/competitions"]) {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
  }
});

test("le réglage de notification s'affiche", async ({ page }) => {
  await page.goto("/parametres");
  await expect(page.getByText("Brief du matin par e-mail")).toBeVisible();
});

test("l'accueil public s'affiche pour un visiteur (aperçu)", async ({ page }) => {
  await page.goto("/?apercu=1");
  await expect(page.getByText("Le copilote IA qui gère votre agence")).toBeVisible();
  await expect(page.getByRole("link", { name: "Créer mon compte" })).toBeVisible();
});

test("le cron des briefs est protégé", async ({ request }) => {
  const res = await request.get("/api/cron/briefs");
  expect(res.status()).toBe(401);
});
