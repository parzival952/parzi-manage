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

test("PARZI Academy : parcours et flux de leçon", async ({ page }) => {
  await page.goto("/academy");
  await expect(page.getByText("Devenir agent de joueur")).toBeVisible();
  await expect(page.getByText(/Niveau/).first()).toBeVisible();

  // Ouvre la première leçon et déroule le quiz
  await page.getByRole("link", { name: /Le rôle réel d'un agent/ }).click();
  await page.waitForURL("**/academy/lecon/role");
  await expect(page.getByText(/QUIZ/)).toBeVisible();
  // Répond à chaque question : un choix débloque le bouton d'avancement.
  for (let i = 0; i < 2; i++) {
    await page.locator("button.pz-opt").first().click();
    await page.getByRole("button", { name: /Question suivante|Terminer la leçon/ }).click();
  }
  await expect(page.getByText(/XP gagnée|Leçon révisée|Niveau|validée/).first()).toBeVisible({ timeout: 10000 });
});

test("PARZI Academy : profil et rangs", async ({ page }) => {
  await page.goto("/academy/profil");
  await expect(page.getByText("LES 12 RANGS PARZI")).toBeVisible();
  await expect(page.getByText("PARZI ICON")).toBeVisible();
});

test("PARZI Academy : page badges", async ({ page }) => {
  await page.goto("/academy/badges");
  await expect(page.getByText("Badges & trophées")).toBeVisible();
  await expect(page.getByText("Premier Pas")).toBeVisible();
  await expect(page.getByText("Légende").first()).toBeVisible();
});

test("PARZI Academy : page trophées (dont secrets)", async ({ page }) => {
  await page.goto("/academy/trophees");
  await expect(page.getByText("Trophées", { exact: true })).toBeVisible();
  await expect(page.getByText("Éveil")).toBeVisible();
  await expect(page.getByText("Trophée secret").first()).toBeVisible();
});

test("l'aiguillage de bienvenue propose les deux parcours", async ({ page }) => {
  await page.goto("/bienvenue");
  await expect(page.getByText("Bienvenue dans PARZI")).toBeVisible();
  await expect(page.getByText(/devenir.*agent/i)).toBeVisible();
  await expect(page.getByText(/déjà.*agent licencié/i)).toBeVisible();
});

test("le cron des briefs est protégé", async ({ request }) => {
  const res = await request.get("/api/cron/briefs");
  expect(res.status()).toBe(401);
});
