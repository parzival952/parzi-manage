import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test.describe("Mot de passe oublié", () => {
  test("la connexion propose le lien (mode connexion)", async () => {
    // En démo, /academy/connexion redirige (utilisateur démo connecté) : on
    // vérifie donc le lien dans la page elle-même.
    const src = await readFile("src/app/academy/connexion/page.tsx", "utf8");
    expect(src).toContain('href="/academy/mot-de-passe-oublie"');
    expect(src).toContain("Mot de passe oublié ?");
  });

  test("la demande affiche toujours un message neutre", async ({ page }) => {
    await page.goto("/academy/mot-de-passe-oublie");
    await expect(page.getByRole("heading", { name: "Mot de passe oublié" })).toBeVisible();
    await page.getByLabel("Adresse e-mail").fill("eleve@example.invalid");
    await page.getByRole("button", { name: /Recevoir le lien/ }).click();
    await page.waitForURL("**/academy/mot-de-passe-oublie?envoye=1");
    await expect(page.getByText(/Si un compte existe pour cette adresse/)).toBeVisible();
  });

  test("sans lien valide : message et renvoi vers la demande", async ({ page }) => {
    await page.goto("/academy/nouveau-mot-de-passe");
    await expect(page.getByText(/Ouvre cette page depuis le lien/)).toBeVisible();
    // Arrivée « fraîche » depuis l'e-mail : nouveau chargement de page.
    await page.goto("about:blank");
    await page.goto("/academy/nouveau-mot-de-passe#error=access_denied&error_code=otp_expired");
    await expect(page.getByText(/Ce lien a expiré ou a déjà servi/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Recevoir un nouveau lien/ })).toBeVisible();
  });

  test("lien de récupération : formulaire, jeton retiré de l'adresse, contrôle des deux saisies", async ({ page }) => {
    await page.goto("/academy/nouveau-mot-de-passe#access_token=faux&refresh_token=faux&type=recovery");
    await expect(page.getByLabel("Nouveau mot de passe")).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
    await page.getByLabel("Nouveau mot de passe").fill("secret123");
    await page.getByLabel("Confirme le mot de passe").fill("secret124");
    await page.getByRole("button", { name: /Enregistrer et me connecter/ }).click();
    await expect(page.getByText("Les deux mots de passe ne sont pas identiques.")).toBeVisible();
  });
});

test.describe("Règles des mots de passe", () => {
  test("8 caractères minimum, avec au moins une lettre et un chiffre", async () => {
    const { passwordProblem } = await import("../src/lib/password-policy");
    expect(passwordProblem("abc12")).toMatch(/au moins 8 caractères/);
    expect(passwordProblem("abcdefgh")).toMatch(/une lettre et un chiffre/);
    expect(passwordProblem("12345678")).toMatch(/une lettre et un chiffre/);
    expect(passwordProblem("élève2026")).toBeNull();
    expect(passwordProblem("secret123")).toBeNull();
  });

  test("le nouveau mot de passe trop faible est refusé", async ({ page }) => {
    await page.goto("/academy/nouveau-mot-de-passe#access_token=faux&refresh_token=faux&type=recovery");
    await page.getByLabel("Nouveau mot de passe").fill("motdepasse");
    await page.getByLabel("Confirme le mot de passe").fill("motdepasse");
    await page.getByRole("button", { name: /Enregistrer et me connecter/ }).click();
    await expect(page.getByText("Le mot de passe doit contenir au moins une lettre et un chiffre.")).toBeVisible();
  });
});
